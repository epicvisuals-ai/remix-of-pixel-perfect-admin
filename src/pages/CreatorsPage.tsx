import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { CreatorCard } from "@/components/creators/CreatorCard";
import { WorkedWithCard } from "@/components/creators/WorkedWithCard";
import { CreatorSearch } from "@/components/creators/CreatorSearch";
import { FavoriteCreatorCard } from "@/components/creators/FavoriteCreatorCard";
import { Skeleton } from "@/components/ui/skeleton";
import { creatorsApi, SavedCreator, WorkedWithCreator, ExploreCreator } from "@/lib/api";
import { useFavorites } from "@/contexts/FavoritesContext";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Mock data - Discover styles section
const discoverStyles = [
  {
    id: "1",
    title: "Minimalist Design",
    image: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=300&h=200&fit=crop",
    description: "Clean, simple aesthetics",
  },
  {
    id: "2",
    title: "Bold Typography",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=200&fit=crop",
    description: "Expressive type treatments",
  },
  {
    id: "3",
    title: "Abstract Art",
    image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=300&h=200&fit=crop",
    description: "Modern artistic expressions",
  },
  {
    id: "4",
    title: "Nature Vibes",
    image: "https://images.unsplash.com/photo-1518173946687-a4c036bc6c9f?w=300&h=200&fit=crop",
    description: "Organic and earthy tones",
  },
];

function SavedCreatorsSkeleton() {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Heart className="h-5 w-5 fill-red-500 text-red-500" />
        <h2 className="text-lg font-medium text-foreground">Saved Creators</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function WorkedWithSkeleton() {
  return (
    <section className="space-y-4">
      <Skeleton className="h-6 w-48" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-8 w-14" />
          </div>
        ))}
      </div>
    </section>
  );
}

function ExploreSkeleton() {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex gap-4 overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex-shrink-0 w-[180px]">
            <Skeleton className="aspect-[4/5] rounded-2xl" />
            <div className="mt-3 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function CreatorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [savedCreators, setSavedCreators] = useState<SavedCreator[]>([]);
  const [workedWithCreators, setWorkedWithCreators] = useState<WorkedWithCreator[]>([]);
  const [exploreCreators, setExploreCreators] = useState<ExploreCreator[]>([]);
  const { setFavorites } = useFavorites();

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const response = await creatorsApi.getAggregate();
        const data = response.data.data;
        setSavedCreators(data.saved);
        setWorkedWithCreators(data.workedWith);
        setExploreCreators(data.explore);
        // Sync favorites with saved creators
        setFavorites(data.saved.map((c) => c.creatorId));
      } catch (error) {
        console.error("Failed to fetch creators:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCreators();
  }, [setFavorites]);

  const filteredExploreCreators = exploreCreators.filter(
    (creator) => {
      const name = `${creator.user.firstName} ${creator.user.lastName}`.toLowerCase();
      return name.includes(searchQuery.toLowerCase()) ||
        creator.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    }
  );

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">Creators</h1>
        <p className="text-muted-foreground">
          Discover talented creators for your next project
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <CreatorSearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name or specialty..."
        />
      </div>

      {/* Loading State */}
      {isLoading ? (
        <>
          <SavedCreatorsSkeleton />
          <WorkedWithSkeleton />
          <ExploreSkeleton />
        </>
      ) : (
        <>
          {/* Saved Creators Section */}
          {savedCreators.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                <h2 className="text-lg font-medium text-foreground">
                  Saved Creators
                </h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {savedCreators.map((creator) => (
                  <FavoriteCreatorCard
                    key={creator.id}
                    id={creator.creatorId}
                    name={creator.name || "Unknown"}
                    avatar={creator.avatar || ""}
                    specialty={creator.specialty || "Creator"}
                    rating={creator.rating || 0}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Worked With Section */}
          {workedWithCreators.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-medium text-foreground">
                Creators you've worked with
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {workedWithCreators.map((creator) => (
                  <WorkedWithCard
                    key={creator.id}
                    name={creator.name || "Unknown"}
                    avatar={creator.avatar || ""}
                    collaborationCount={creator.projectCount || 0}
                    specialty={creator.specialty || "Creator"}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Explore All Creators */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-foreground">
                Explore all creators
              </h2>
              <span className="text-sm text-muted-foreground">
                {filteredExploreCreators.length} creator{filteredExploreCreators.length !== 1 ? "s" : ""}
              </span>
            </div>
            {filteredExploreCreators.length > 0 ? (
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {filteredExploreCreators.map((creator) => (
                    <CarouselItem
                      key={creator.id}
                      className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
                    >
                      <CreatorCard
                        id={creator.userId}
                        name={`${creator.user.firstName} ${creator.user.lastName}`}
                        portfolioImage={creator.portfolioImage || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=500&fit=crop"}
                        specialty={creator.specialty}
                        rating={creator.rating}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="-left-4 hidden sm:flex" />
                <CarouselNext className="-right-4 hidden sm:flex" />
              </Carousel>
            ) : (
              <p className="text-muted-foreground">No creators found matching your search.</p>
            )}
          </section>
        </>
      )}

      {/* Discover Styles - Always shown, mocked */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium text-foreground">
          Discover something new
        </h2>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {discoverStyles.map((style) => (
            <div
              key={style.id}
              className="group cursor-pointer overflow-hidden rounded-xl border border-border bg-card transition-colors hover:bg-accent/50"
            >
              <div className="aspect-[3/2] overflow-hidden">
                <img
                  src={style.image}
                  alt={style.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-3">
                <h3 className="font-medium text-foreground">{style.title}</h3>
                <p className="text-sm text-muted-foreground">{style.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
