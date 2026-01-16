import { format } from "date-fns";
import { X, Image, Video, Calendar, DollarSign, Edit2, Check } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface Request {
  id: string;
  type: "Image" | "Video";
  budget: number;
  status: "Created" | "Submitted" | "In Progress" | "Approved" | "Rejected";
  createdAt: Date;
  brief: string;
  toneOfVoice?: string;
  deadline?: Date;
}

interface RequestDetailsSheetProps {
  request: Request | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getStatusBadgeVariant = (status: Request["status"]) => {
  switch (status) {
    case "Created":
      return "bg-gray-100 text-gray-700 hover:bg-gray-100";
    case "Submitted":
      return "bg-blue-100 text-blue-700 hover:bg-blue-100";
    case "In Progress":
      return "bg-amber-100 text-amber-700 hover:bg-amber-100";
    case "Approved":
      return "bg-green-100 text-green-700 hover:bg-green-100";
    case "Rejected":
      return "bg-red-100 text-red-700 hover:bg-red-100";
    default:
      return "";
  }
};

const statusTimeline: { status: Request["status"]; label: string }[] = [
  { status: "Created", label: "Created" },
  { status: "Submitted", label: "Submitted" },
  { status: "In Progress", label: "In Progress" },
  { status: "Approved", label: "Approved" },
];

const getStatusIndex = (status: Request["status"]) => {
  if (status === "Rejected") return -1;
  return statusTimeline.findIndex((s) => s.status === status);
};

export function RequestDetailsSheet({
  request,
  open,
  onOpenChange,
}: RequestDetailsSheetProps) {
  if (!request) return null;

  const currentStatusIndex = getStatusIndex(request.status);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-xl font-semibold">
                Request {request.id}
              </SheetTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Created {format(request.createdAt, "MMM d, yyyy")}
              </p>
            </div>
            <Badge
              variant="secondary"
              className={getStatusBadgeVariant(request.status)}
            >
              {request.status}
            </Badge>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status Timeline */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-4">
              Status Timeline
            </h3>
            <div className="relative">
              <div className="flex items-center justify-between">
                {statusTimeline.map((step, index) => {
                  const isCompleted = currentStatusIndex >= index;
                  const isCurrent = currentStatusIndex === index;
                  const isRejected = request.status === "Rejected";

                  return (
                    <div key={step.status} className="flex flex-col items-center flex-1">
                      <div
                        className={`
                          w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                          ${isRejected && index === 0 ? "bg-red-100 text-red-700" : ""}
                          ${isCompleted && !isRejected ? "bg-primary text-primary-foreground" : ""}
                          ${!isCompleted && !isRejected ? "bg-muted text-muted-foreground" : ""}
                          ${isCurrent ? "ring-2 ring-primary ring-offset-2" : ""}
                        `}
                      >
                        {isCompleted && !isRejected ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span
                        className={`text-xs mt-2 text-center ${
                          isCompleted ? "text-foreground font-medium" : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              {/* Progress line */}
              <div className="absolute top-4 left-4 right-4 h-0.5 bg-muted -z-10">
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width: `${Math.max(0, (currentStatusIndex / (statusTimeline.length - 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Request Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">
              Request Details
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                {request.type === "Video" ? (
                  <Video className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Image className="h-4 w-4 text-muted-foreground" />
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="text-sm font-medium text-foreground">
                    {request.type}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Budget</p>
                  <p className="text-sm font-medium text-foreground">
                    ${request.budget}
                  </p>
                </div>
              </div>

              {request.deadline && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 col-span-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Deadline</p>
                    <p className="text-sm font-medium text-foreground">
                      {format(request.deadline, "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Brief */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-2">Brief</h3>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-foreground leading-relaxed">
                {request.brief}
              </p>
            </div>
          </div>

          {request.toneOfVoice && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">
                  Tone of Voice
                </h3>
                <Badge variant="outline" className="text-foreground">
                  {request.toneOfVoice}
                </Badge>
              </div>
            </>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1">
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Request
            </Button>
            {request.status === "Created" && (
              <Button className="flex-1">Submit for Review</Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
