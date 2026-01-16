import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, DollarSign, FileText, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const quoteSchema = z.object({
  projectTitle: z
    .string()
    .trim()
    .min(1, "Project title is required")
    .max(100, "Title must be less than 100 characters"),
  projectType: z.string().min(1, "Please select a project type"),
  description: z
    .string()
    .trim()
    .min(10, "Please provide at least 10 characters")
    .max(1000, "Description must be less than 1000 characters"),
  budget: z.string().min(1, "Please select a budget range"),
  timeline: z.string().min(1, "Please select a timeline"),
  deliverables: z
    .string()
    .trim()
    .min(1, "Please describe expected deliverables")
    .max(500, "Deliverables must be less than 500 characters"),
});

type QuoteFormData = z.infer<typeof quoteSchema>;

interface RequestQuoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creatorName: string;
  creatorId: string;
}

const projectTypes = [
  "3D Art & Visualization",
  "Photography",
  "Video Production",
  "Illustration",
  "Motion Graphics",
  "Branding & Design",
  "Social Media Content",
  "Other",
];

const budgetRanges = [
  "Under $500",
  "$500 - $1,000",
  "$1,000 - $2,500",
  "$2,500 - $5,000",
  "$5,000 - $10,000",
  "$10,000+",
  "Open to discussion",
];

const timelines = [
  "Less than 1 week",
  "1-2 weeks",
  "2-4 weeks",
  "1-2 months",
  "2-3 months",
  "Flexible",
];

export function RequestQuoteModal({
  open,
  onOpenChange,
  creatorName,
}: RequestQuoteModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      projectTitle: "",
      projectType: "",
      description: "",
      budget: "",
      timeline: "",
      deliverables: "",
    },
  });

  const projectType = watch("projectType");
  const budget = watch("budget");
  const timeline = watch("timeline");

  const onSubmit = async (data: QuoteFormData) => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    toast.success("Quote request sent!", {
      description: `${creatorName} will receive your project details and respond soon.`,
    });
    
    reset();
    onOpenChange(false);
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Request a Quote</DialogTitle>
          <DialogDescription>
            Share your project details with {creatorName}. They'll review and send you a custom quote.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-4">
          {/* Project Title */}
          <div className="space-y-2">
            <Label htmlFor="projectTitle">
              Project Title <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="projectTitle"
                placeholder="e.g., Product Launch Campaign"
                className="pl-10"
                {...register("projectTitle")}
              />
            </div>
            {errors.projectTitle && (
              <p className="text-sm text-destructive">{errors.projectTitle.message}</p>
            )}
          </div>

          {/* Project Type */}
          <div className="space-y-2">
            <Label>
              Project Type <span className="text-destructive">*</span>
            </Label>
            <Select value={projectType} onValueChange={(v) => setValue("projectType", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select project type" />
              </SelectTrigger>
              <SelectContent>
                {projectTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.projectType && (
              <p className="text-sm text-destructive">{errors.projectType.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Project Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe your project, goals, and any specific requirements..."
              className="min-h-[100px] resize-none"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Budget & Timeline */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>
                Budget Range <span className="text-destructive">*</span>
              </Label>
              <Select value={budget} onValueChange={(v) => setValue("budget", v)}>
                <SelectTrigger>
                  <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Select budget" />
                </SelectTrigger>
                <SelectContent>
                  {budgetRanges.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.budget && (
                <p className="text-sm text-destructive">{errors.budget.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                Timeline <span className="text-destructive">*</span>
              </Label>
              <Select value={timeline} onValueChange={(v) => setValue("timeline", v)}>
                <SelectTrigger>
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
                <SelectContent>
                  {timelines.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.timeline && (
                <p className="text-sm text-destructive">{errors.timeline.message}</p>
              )}
            </div>
          </div>

          {/* Deliverables */}
          <div className="space-y-2">
            <Label htmlFor="deliverables">
              Expected Deliverables <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="deliverables"
              placeholder="e.g., 5 high-resolution product images, 2 social media videos..."
              className="min-h-[80px] resize-none"
              {...register("deliverables")}
            />
            {errors.deliverables && (
              <p className="text-sm text-destructive">{errors.deliverables.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Request"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
