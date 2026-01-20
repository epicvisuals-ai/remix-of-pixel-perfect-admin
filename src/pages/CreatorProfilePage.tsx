import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Star, MapPin, Calendar, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { FavoriteButton } from "@/components/creators/FavoriteButton";
import { ReviewCard } from "@/components/creators/ReviewCard";
import { RequestQuoteModal } from "@/components/creators/RequestQuoteModal";
import { useMessaging } from "@/contexts/MessagingContext";
import { creatorsApi } from "@/lib/api";

// Mock reviews data
const reviewsData: Record<string, Array<{
  id: string;
  reviewerName: string;
  reviewerAvatar: string;
  reviewerCompany: string;
  rating: number;
  date: string;
  content: string;
  projectType: string;
}>> = {
  "default": [
    {
      id: "1",
      reviewerName: "Sarah Mitchell",
      reviewerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      reviewerCompany: "TechStart Inc.",
      rating: 5,
      date: "Dec 2025",
      content: "Exceptional work! Delivered exactly what we needed with great attention to detail.",
      projectType: "Project",
    },
  ],
  "4": [
    {
      id: "1",
      reviewerName: "Sarah Mitchell",
      reviewerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      reviewerCompany: "TechStart Inc.",
      rating: 5,
      date: "Dec 2025",
      content: "Alex delivered exceptional 3D renders for our product launch. The attention to detail was outstanding, and they were incredibly responsive throughout the project. Would definitely work with them again!",
      projectType: "Product Visualization",
    },
    {
      id: "2",
      reviewerName: "Michael Chen",
      reviewerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      reviewerCompany: "Creative Agency Co",
      rating: 5,
      date: "Nov 2025",
      content: "Incredible work on our brand animation. Alex understood our vision perfectly and brought it to life in ways we couldn't have imagined. Highly recommended!",
      projectType: "Motion Graphics",
    },
    {
      id: "3",
      reviewerName: "Emily Davis",
      reviewerAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      reviewerCompany: "Luxe Brands",
      rating: 4,
      date: "Oct 2025",
      content: "Great communication and professional delivery. The 3D models exceeded our expectations and really elevated our marketing materials.",
      projectType: "3D Modeling",
    },
  ],
  "5": [
    {
      id: "1",
      reviewerName: "David Park",
      reviewerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      reviewerCompany: "Fashion Forward",
      rating: 5,
      date: "Jan 2026",
      content: "Jordan's photography captured exactly what we needed for our campaign. Professional, creative, and a pleasure to work with.",
      projectType: "Commercial Photography",
    },
    {
      id: "2",
      reviewerName: "Lisa Wong",
      reviewerAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
      reviewerCompany: "Startup Hub",
      rating: 5,
      date: "Dec 2025",
      content: "Amazing editorial shots that perfectly represented our brand story. Jordan has an incredible eye for composition and lighting.",
      projectType: "Editorial",
    },
  ],
};

const defaultReviews = [
  {
    id: "1",
    reviewerName: "Alex Johnson",
    reviewerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    reviewerCompany: "Design Studio",
    rating: 5,
    date: "Dec 2025",
    content: "Fantastic work! Delivered on time and exceeded all expectations. Would highly recommend to anyone looking for quality creative work.",
    projectType: "Branding",
  },
];

// Mock data - in real app, this would come from API
const creatorsData: Record<string, {
  id: string;
  name: string;
  avatar: string;
  coverImage: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  location: string;
  memberSince: string;
  bio: string;
  skills: string[];
  portfolio: { id: string; image: string; title: string }[];
  stats: { projectsCompleted: number; repeatClients: number; avgResponseTime: string };
}> = {
  "4": {
    id: "4",
    name: "Alex Kim",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=400&fit=crop",
    specialty: "3D Art",
    rating: 4.9,
    reviewCount: 47,
    location: "Los Angeles, CA",
    memberSince: "2023",
    bio: "Award-winning 3D artist specializing in product visualization, abstract art, and immersive experiences. I bring brands to life through stunning visual storytelling.",
    skills: ["3D Modeling", "Product Viz", "Motion Graphics", "Blender", "Cinema 4D"],
    portfolio: [
      { id: "1", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop", title: "Abstract Flow" },
      { id: "2", image: "https://images.unsplash.com/photo-1633186710895-309db2eca9e4?w=400&h=400&fit=crop", title: "Product Render" },
      { id: "3", image: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=400&h=400&fit=crop", title: "Brand Identity" },
      { id: "4", image: "https://images.unsplash.com/photo-1614851099511-773084f6911d?w=400&h=400&fit=crop", title: "Gradient Study" },
      { id: "5", image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400&h=400&fit=crop", title: "Fluid Forms" },
      { id: "6", image: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&h=400&fit=crop", title: "Color Explosion" },
    ],
    stats: { projectsCompleted: 89, repeatClients: 34, avgResponseTime: "< 2 hours" },
  },
  "5": {
    id: "5",
    name: "Jordan Lee",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=1200&h=400&fit=crop",
    specialty: "Photography",
    rating: 4.8,
    reviewCount: 62,
    location: "New York, NY",
    memberSince: "2022",
    bio: "Professional photographer with 8+ years of experience in commercial and editorial photography. I specialize in capturing authentic moments and creating compelling visual narratives.",
    skills: ["Portrait", "Commercial", "Editorial", "Product", "Lifestyle"],
    portfolio: [
      { id: "1", image: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=400&h=400&fit=crop", title: "Urban Light" },
      { id: "2", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop", title: "Nature's Beauty" },
      { id: "3", image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=400&fit=crop", title: "Landscape" },
      { id: "4", image: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400&h=400&fit=crop", title: "Forest Path" },
    ],
    stats: { projectsCompleted: 156, repeatClients: 67, avgResponseTime: "< 1 hour" },
  },
};

// Default creator for unknown IDs
const defaultCreator = {
  id: "default",
  name: "Creator Profile",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
  coverImage: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200&h=400&fit=crop",
  specialty: "Creative",
  rating: 4.5,
  reviewCount: 25,
  location: "Remote",
  memberSince: "2024",
  bio: "Creative professional passionate about bringing ideas to life through visual storytelling.",
  skills: ["Design", "Creative Direction", "Branding"],
  portfolio: [
    { id: "1", image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=400&fit=crop", title: "Project 1" },
    { id: "2", image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&h=400&fit=crop", title: "Project 2" },
    { id: "3", image: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=400&h=400&fit=crop", title: "Project 3" },
  ],
  stats: { projectsCompleted: 45, repeatClients: 18, avgResponseTime: "< 4 hours" },
};

export default function CreatorProfilePage() {
  const { creatorId } = useParams<{ creatorId: string }>();
  const navigate = useNavigate();
  const { startConversation } = useMessaging();
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);

  const { data: creatorResponse, isLoading, error } = useQuery({
    queryKey: ['creator', creatorId],
    queryFn: () => creatorsApi.getById(creatorId!),
    enabled: !!creatorId,
  });

  const creatorData = creatorResponse?.data.data;
  const creator = creatorData ? {
    id: creatorData.id,
    name: `${creatorData.user.firstName} ${creatorData.user.lastName}`,
    avatar: creatorData.avatar,
    coverImage: creatorData.coverImage,
    specialty: creatorData.specialty,
    rating: creatorData.rating,
    reviewCount: creatorData.reviewCount,
    location: creatorData.location,
    memberSince: creatorData.memberSince,
    bio: creatorData.bio,
    skills: creatorData.skills,
    portfolio: creatorData.portfolio.map(item => ({
      id: item.id,
      image: item.imageUrl,
      title: item.title,
    })),
    stats: {
      projectsCompleted: creatorData.projectsCompleted,
      repeatClients: creatorData.repeatClients,
      avgResponseTime: `${creatorData.avgResponseTimeMinutes} min`,
    }
  } : defaultCreator;

  // Use hardcoded reviews since API doesn't have them yet
  const reviews = reviewsData["default"] || defaultReviews;
  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 2);

  const initials = creator.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-6 pb-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/creators")}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Creators
      </Button>

      {/* Cover Image */}
      <div className="relative h-48 overflow-hidden rounded-xl bg-muted md:h-64">
        <img
          src={creator.coverImage}
          alt="Cover"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Profile Header */}
      <div className="relative -mt-16 flex flex-col gap-4 px-4 md:flex-row md:items-end md:gap-6">
        <Avatar className="h-24 w-24 border-4 border-background shadow-lg md:h-32 md:w-32">
          <AvatarImage src={creator.avatar} alt={creator.name} />
          <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">
              {creator.name}
            </h1>
            <Badge variant="secondary">{creator.specialty}</Badge>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-foreground">{creator.rating}</span>
              <span>({creator.reviewCount} reviews)</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{creator.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Member since {creator.memberSince}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2 md:pt-0">
          <FavoriteButton creatorId={creator.id} />
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => startConversation(creator.id, creator.name, creator.avatar)}
          >
            <MessageCircle className="h-4 w-4" />
            Message
          </Button>
          <Button size="sm" className="gap-2" onClick={() => setQuoteModalOpen(true)}>
            Start Project
          </Button>
        </div>
      </div>

      <Separator />

      {/* Stats */}
      <div className="rounded-xl border border-border bg-card">
        <div className="grid grid-cols-3 divide-x divide-border">
          <div className="px-5 py-4 text-center">
            <p className="text-2xl font-bold text-foreground">{creator.stats.projectsCompleted}</p>
            <p className="text-sm text-muted-foreground">Projects Completed</p>
          </div>
          <div className="px-5 py-4 text-center">
            <p className="text-2xl font-bold text-foreground">{creator.stats.repeatClients}</p>
            <p className="text-sm text-muted-foreground">Repeat Clients</p>
          </div>
          <div className="px-5 py-4 text-center">
            <p className="text-2xl font-bold text-foreground">{creator.stats.avgResponseTime}</p>
            <p className="text-sm text-muted-foreground">Avg Response</p>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-3">
        <h2 className="text-lg font-medium text-foreground">About</h2>
        <p className="text-muted-foreground leading-relaxed">{creator.bio}</p>
      </div>

      {/* Skills */}
      <div className="space-y-3">
        <h2 className="text-lg font-medium text-foreground">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {creator.skills.map((skill) => (
            <Badge key={skill} variant="outline">
              {skill}
            </Badge>
          ))}
        </div>
      </div>

      {/* Portfolio Gallery */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-foreground">Portfolio</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {creator.portfolio.map((item) => (
            <div
              key={item.id}
              className="group relative aspect-square overflow-hidden rounded-xl bg-muted cursor-pointer"
            >
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <p className="p-4 text-sm font-medium text-white">{item.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-foreground">
            Client Reviews ({reviews.length})
          </h2>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{creator.rating}</span>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {displayedReviews.map((review) => (
            <ReviewCard
              key={review.id}
              reviewerName={review.reviewerName}
              reviewerAvatar={review.reviewerAvatar}
              reviewerCompany={review.reviewerCompany}
              rating={review.rating}
              date={review.date}
              content={review.content}
              projectType={review.projectType}
            />
          ))}
        </div>
        {reviews.length > 2 && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowAllReviews(!showAllReviews)}
          >
            {showAllReviews ? "Show Less" : `View All ${reviews.length} Reviews`}
          </Button>
        )}
      </div>

      {/* CTA */}
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <h3 className="text-lg font-medium text-foreground">Ready to work with {creator.name.split(" ")[0]}?</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Start a project and bring your ideas to life
        </p>
        <Button className="mt-4" size="lg" onClick={() => setQuoteModalOpen(true)}>
          Start Project
        </Button>
      </div>

      {/* Request Quote Modal */}
      <RequestQuoteModal
        open={quoteModalOpen}
        onOpenChange={setQuoteModalOpen}
        creatorName={creator.name}
        creatorId={creator.id}
      />
    </div>
  );
}
