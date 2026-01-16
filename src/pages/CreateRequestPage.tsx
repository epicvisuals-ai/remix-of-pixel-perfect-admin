import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Image, Video, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type ContentType = "image" | "video";

const toneOptions = [
  { value: "cinematic", label: "Cinematic" },
  { value: "professional", label: "Professional" },
  { value: "playful", label: "Playful" },
  { value: "minimalist", label: "Minimalist" },
  { value: "bold", label: "Bold" },
  { value: "elegant", label: "Elegant" },
];

const CreateRequestPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [contentType, setContentType] = useState<ContentType>("image");
  const [brief, setBrief] = useState("");
  const [tone, setTone] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState<Date>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!brief.trim()) {
      toast({
        title: "Brief required",
        description: "Please describe what you need.",
        variant: "destructive",
      });
      return;
    }

    if (!budget) {
      toast({
        title: "Budget required",
        description: "Please enter a budget.",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would save to the database
    toast({
      title: "Request submitted",
      description: "Your request has been created successfully.",
    });
    
    navigate("/my-requests");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create Request</h1>
        <p className="text-muted-foreground">
          Describe what you need and we'll match you with the perfect creator
        </p>
      </div>

      <Separator />

      <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
        {/* Content Type */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Content Type</Label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setContentType("image")}
              className={cn(
                "flex flex-col items-center gap-2 p-6 rounded-lg border-2 transition-all",
                contentType === "image"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/50"
              )}
            >
              <Image className="h-8 w-8" />
              <span className="font-medium">Image</span>
              <span className="text-sm text-muted-foreground">Static visuals</span>
            </button>
            <button
              type="button"
              onClick={() => setContentType("video")}
              className={cn(
                "flex flex-col items-center gap-2 p-6 rounded-lg border-2 transition-all",
                contentType === "video"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/50"
              )}
            >
              <Video className="h-8 w-8" />
              <span className="font-medium">Video</span>
              <span className="text-sm text-muted-foreground">Motion content</span>
            </button>
          </div>
        </div>

        {/* Brief */}
        <div className="space-y-3">
          <Label htmlFor="brief" className="text-base font-medium">Brief</Label>
          <Textarea
            id="brief"
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="Describe what you need. Include references, constraints, style preferences..."
            className="min-h-[150px] resize-none"
          />
        </div>

        {/* Tone of Voice */}
        <div className="space-y-3">
          <Label htmlFor="tone" className="text-base font-medium">Tone of Voice</Label>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger id="tone">
              <SelectValue placeholder="Select a tone" />
            </SelectTrigger>
            <SelectContent>
              {toneOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Budget and Deadline */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="budget" className="text-base font-medium">Budget (USD)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="budget"
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="0"
                className="pl-7"
                min="0"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-medium">Deadline (optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !deadline && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? format(deadline, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={setDeadline}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Submit */}
        <Button type="submit" size="lg" className="w-full">
          Submit Request
        </Button>
      </form>
    </div>
  );
};

export default CreateRequestPage;
