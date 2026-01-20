import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { favoritesApi, creatorsApi } from "@/lib/api";
import { toast } from "sonner";

interface FavoritesContextType {
  favorites: string[];
  setFavorites: (favorites: string[]) => void;
  toggleFavorite: (creatorId: string) => Promise<void>;
  isFavorite: (creatorId: string) => boolean;
  isToggling: string | null;
  refreshFavorites: () => Promise<void>;
  isRefreshing: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isToggling, setIsToggling] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshFavorites = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await creatorsApi.getAggregate();
      const savedCreatorIds = response.data.data.saved.map((c) => c.creatorId);
      setFavorites(savedCreatorIds);
    } catch (error) {
      console.error("Failed to refresh favorites:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const toggleFavorite = useCallback(async (creatorId: string) => {
    if (isToggling) return;
    
    setIsToggling(creatorId);
    const wasFavorite = favorites.includes(creatorId);

    // Optimistic update
    setFavorites((prev) =>
      wasFavorite
        ? prev.filter((id) => id !== creatorId)
        : [...prev, creatorId]
    );

    try {
      if (wasFavorite) {
        await favoritesApi.remove(creatorId);
        toast.success("Removed from favorites");
      } else {
        await favoritesApi.add(creatorId);
        toast.success("Added to favorites");
      }
    } catch (error: any) {
      // Revert optimistic update
      setFavorites((prev) =>
        wasFavorite
          ? [...prev, creatorId]
          : prev.filter((id) => id !== creatorId)
      );
      
      const status = error.response?.status;
      if (status === 409) {
        toast.error("Creator already in favorites");
      } else if (status === 404) {
        toast.error("Favorite not found");
      } else {
        toast.error("Failed to update favorites");
      }
    } finally {
      setIsToggling(null);
    }
  }, [favorites, isToggling]);

  const isFavorite = useCallback((creatorId: string) => favorites.includes(creatorId), [favorites]);

  return (
    <FavoritesContext.Provider value={{ favorites, setFavorites, toggleFavorite, isFavorite, isToggling, refreshFavorites, isRefreshing }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
