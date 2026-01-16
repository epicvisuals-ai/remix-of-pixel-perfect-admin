import { useState } from "react";
import { CreatorCard } from "@/components/creators/CreatorCard";
import { WorkedWithCard } from "@/components/creators/WorkedWithCard";
import { CreatorSearch } from "@/components/creators/CreatorSearch";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Mock data - in real app, this would come from API
const workedWithCreators = [
  {
    id: "1",
    name: "Sarah Chen",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    collaborationCount: 5,
    specialty: "Photography",
  },
  {
    id: "2",
    name: "Marcus Johnson",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    collaborationCount: 3,
    specialty: "Video",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    collaborationCount: 2,
    specialty: "Design",
  },
];

const allCreators = [
  {
    id: "4",
    name: "Alex Kim",
    portfolioImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=500&fit=crop",
    specialty: "3D Art",
    rating: 4.9,
  },
  {
    id: "5",
    name: "Jordan Lee",
    portfolioImage: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=400&h=500&fit=crop",
    specialty: "Photography",
    rating: 4.8,
  },
  {
    id: "6",
    name: "Taylor Swift",
    portfolioImage: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=500&fit=crop",
    specialty: "Illustration",
    rating: 5.0,
  },
  {
    id: "7",
    name: "Morgan Davis",
    portfolioImage: "https://images.unsplash.com/photo-1561998338-13ad7883b20f?w=400&h=500&fit=crop",
    specialty: "Video",
    rating: 4.7,
  },
  {
    id: "8",
    name: "Casey Brown",
    portfolioImage: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=400&h=500&fit=crop",
    specialty: "Motion",
    rating: 4.6,
  },
  {
    id: "9",
    name: "Riley Wilson",
    portfolioImage: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=400&h=500&fit=crop",
    specialty: "Photography",
    rating: 4.8,
  },
];

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

export default function CreatorsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCreators = allCreators.filter(
    (creator) =>
      creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.specialty.toLowerCase().includes(searchQuery.toLowerCase())
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
                name={creator.name}
                avatar={creator.avatar}
                collaborationCount={creator.collaborationCount}
                specialty={creator.specialty}
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
            {filteredCreators.length} creator{filteredCreators.length !== 1 ? "s" : ""}
          </span>
        </div>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {filteredCreators.map((creator) => (
              <CarouselItem
                key={creator.id}
                className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
              >
                <CreatorCard
                  name={creator.name}
                  portfolioImage={creator.portfolioImage}
                  specialty={creator.specialty}
                  rating={creator.rating}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-4 hidden sm:flex" />
          <CarouselNext className="-right-4 hidden sm:flex" />
        </Carousel>
      </section>

      {/* Discover Styles */}
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
