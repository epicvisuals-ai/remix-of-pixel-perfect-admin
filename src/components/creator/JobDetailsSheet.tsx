import { useRef, useState } from "react";
import { format } from "date-fns";
import {
  Check,
  Circle,
  Clock,
  DollarSign,
  File,
  FileText,
  Image,
  MessageCircle,
  Send,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { creatorRequestsApi } from "@/lib/api";
import type { Deliverable, Job, Message } from "@/lib/creatorRequestMapper";

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

const getStatusBadgeVariant = (status: Job["status"]) => {
  switch (status) {
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

const TypeIcon = ({ type }: { type: Job["type"] }) => {
  if (type === "Video") {
    return <Video className="h-4 w-4 text-muted-foreground" />;
  }
  return <Image className="h-4 w-4 text-muted-foreground" />;
};

const STATUS_STEPS = ["Submitted", "In Progress", "Approved"] as const;

const getStepStatus = (
  currentStatus: Job["status"],
  step: (typeof STATUS_STEPS)[number]
): "completed" | "current" | "upcoming" | "rejected" => {
  if (currentStatus === "Rejected") {
    if (step === "Submitted") return "completed";
    return "rejected";
  }

  const currentIndex = STATUS_STEPS.indexOf(currentStatus as (typeof STATUS_STEPS)[number]);
  const stepIndex = STATUS_STEPS.indexOf(step);

  if (stepIndex < currentIndex) return "completed";
  if (stepIndex === currentIndex) return "current";
  return "upcoming";
};

const StatusTimeline = ({ status }: { status: Job["status"] }) => {
  return (
    <div className="flex items-center justify-between">
      {STATUS_STEPS.map((step, index) => {
        const stepStatus = getStepStatus(status, step);
        const isLast = index === STATUS_STEPS.length - 1;

        return (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 whitespace-nowrap
                  ${stepStatus === "completed" ? "bg-green-500 text-white" : ""}
                  ${stepStatus === "current" ? "bg-primary text-primary-foreground ring-4 ring-primary/20" : ""}
                  ${stepStatus === "upcoming" ? "bg-muted text-muted-foreground" : ""}
                  ${stepStatus === "rejected" ? "bg-muted text-muted-foreground" : ""}
                `}
              >
                {stepStatus === "completed" ? (
                  <Check className="h-4 w-4" />
                ) : stepStatus === "current" ? (
                  <Circle className="h-3 w-3 fill-current" />
                ) : (
                  <Circle className="h-3 w-3" />
                )}
              </div>
              <span
                className={`
                  text-xs mt-2 font-medium text-center
                  ${stepStatus === "completed" ? "text-green-600 dark:text-green-400" : ""}
                  ${stepStatus === "current" ? "text-primary" : ""}
                  ${stepStatus === "upcoming" || stepStatus === "rejected" ? "text-muted-foreground" : ""}
                `}
              >
                {step}
              </span>
            </div>
            {!isLast && (
              <div
                className={`
                  flex-1 h-0.5 mx-2 mt-[-16px] transition-all duration-300
                  ${getStepStatus(status, STATUS_STEPS[index + 1]) === "completed" || getStepStatus(status, STATUS_STEPS[index + 1]) === "current"
                    ? "bg-green-500"
                    : "bg-muted"}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

interface JobDetailsSheetProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (jobId: string, newStatus: Job["status"]) => void;
  onAddDeliverable: (jobId: string, deliverable: Deliverable) => void;
  onRemoveDeliverable: (jobId: string, deliverableId: string) => void;
  onAddMessage: (jobId: string, message: Message) => void;
}

export const JobDetailsSheet = ({
  job,
  open,
  onOpenChange,
  onStatusChange,
  onAddDeliverable,
  onRemoveDeliverable,
  onAddMessage,
}: JobDetailsSheetProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  if (!job) return null;

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: `msg-${Date.now()}`,
      author: "You",
      authorType: "creator",
      content: newMessage.trim(),
      createdAt: new Date(),
    };

    onAddMessage(job.id, message);
    setNewMessage("");
    toast.success("Message sent");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      const response = await creatorRequestsApi.acceptRequest(job.id);
      if (response.data.success) {
        onStatusChange(job.id, "In Progress");
        toast.success("Job accepted! Status changed to In Progress.");
      }
    } catch (error) {
      console.error("Error accepting request:", error);
      toast.error("Failed to accept job. Please try again.");
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = async () => {
    setIsDeclining(true);
    try {
      const response = await creatorRequestsApi.declineRequest(job.id);
      if (response.data.success) {
        onStatusChange(job.id, "Rejected");
        toast.info("Job declined.");
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error declining request:", error);
      toast.error("Failed to decline job. Please try again.");
    } finally {
      setIsDeclining(false);
    }
  };

  const handleSubmitDeliverable = () => {
    if (job.deliverables.length === 0) {
      toast.error("Please upload at least one file before submitting.");
      return;
    }
    toast.success("Deliverable submitted for review!");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const newDeliverable: Deliverable = {
        id: `del-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: formatFileSize(file.size),
        uploadedAt: new Date(),
      };
      onAddDeliverable(job.id, newDeliverable);
      toast.success(`Uploaded: ${file.name}`);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (deliverableId: string) => {
    onRemoveDeliverable(job.id, deliverableId);
    toast.info("File removed.");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl">Job {job.id}</SheetTitle>
            <Badge variant="secondary" className={getStatusBadgeVariant(job.status)}>
              {job.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Created {format(job.createdAt, "MMM d, yyyy")}
          </p>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          <Card className="rounded-2xl border border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Status Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusTimeline status={job.status} />
              {job.status === "Rejected" && (
                <div className="mt-4 rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-center">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    This job was declined
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Brief
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">{job.brief}</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TypeIcon type={job.type} />
                  <span>Type</span>
                </div>
                <span className="text-sm font-medium">{job.type}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>Budget</span>
                </div>
                <span className="text-sm font-medium">${job.budget}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tone</span>
                <span className="text-sm font-medium">{job.tone}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Deadline</span>
                </div>
                <span className="text-sm font-medium">{job.deadline}</span>
              </div>
            </CardContent>
          </Card>

          {(job.status === "In Progress" || job.status === "Approved") && (
            <Card className="rounded-2xl border border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Deliverables
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Upload your final files before submitting for review.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {job.status === "In Progress" && (
                  <div
                    className="border-2 border-dashed border-primary/30 rounded-2xl p-6 text-center cursor-pointer bg-muted/30 hover:border-primary/60 hover:bg-muted/40 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileUpload}
                      accept="image/*,video/*,.pdf,.zip,.psd,.ai,.fig"
                    />
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-foreground">
                      Drag and drop or click to upload
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      MP4, MOV, JPG, PNG, PDF, or design files
                    </p>
                  </div>
                )}

                {job.deliverables.length > 0 && (
                  <div className="space-y-2">
                    {job.deliverables.map((deliverable) => (
                      <div
                        key={deliverable.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-xl"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {deliverable.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {deliverable.size} • {format(deliverable.uploadedAt, "MMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                        {job.status === "In Progress" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 flex-shrink-0"
                            onClick={() => handleRemoveFile(deliverable.id)}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {job.deliverables.length === 0 && job.status === "Approved" && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No deliverables uploaded
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="rounded-2xl border border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Messages
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-[200px] pr-4">
                <div className="space-y-4">
                  {job.messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No messages yet. Start the conversation!
                    </p>
                  ) : (
                    job.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.authorType === "creator" ? "flex-row-reverse" : ""}`}
                      >
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback
                            className={message.authorType === "creator" ? "bg-primary text-primary-foreground" : "bg-muted"}
                          >
                            {message.author.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`flex-1 ${message.authorType === "creator" ? "text-right" : ""}`}>
                          <div
                            className="flex items-center gap-2 mb-1"
                            style={{
                              justifyContent:
                                message.authorType === "creator" ? "flex-end" : "flex-start",
                            }}
                          >
                            <span className="text-sm font-medium">{message.author}</span>
                            <span className="text-xs text-muted-foreground">
                              {format(message.createdAt, "MMM d, h:mm a")}
                            </span>
                          </div>
                          <div
                            className={`inline-block rounded-lg px-3 py-2 text-sm ${
                              message.authorType === "creator"
                                ? "bg-primary text-primary-foreground rounded-br-sm"
                                : "bg-muted text-foreground rounded-bl-sm"
                            }`}
                          >
                            {message.content}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              <div className="flex gap-2">
                <Textarea
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="min-h-[80px] resize-none"
                />
                <Button
                  size="icon"
                  className="h-[80px] w-10 flex-shrink-0"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {job.status === "In Progress" && (
            <Button onClick={handleSubmitDeliverable} className="w-full rounded-xl">
              <Upload className="h-4 w-4 mr-2" />
              Submit Deliverable
            </Button>
          )}

          <div className="space-y-3">
            {job.status === "Submitted" && (
              <div className="flex gap-3">
                <Button
                  onClick={handleAccept}
                  className="flex-1"
                  disabled={isAccepting || isDeclining}
                >
                  <Check className="h-4 w-4 mr-2" />
                  {isAccepting ? "Accepting..." : "Accept Job"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDecline}
                  className="flex-1"
                  disabled={isAccepting || isDeclining}
                >
                  <X className="h-4 w-4 mr-2" />
                  {isDeclining ? "Declining..." : "Decline"}
                </Button>
              </div>
            )}

            {job.status === "Approved" && (
              <div className="rounded-xl bg-green-50 dark:bg-green-950/30 p-4 text-center">
                <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                  ✓ This job has been completed
                </p>
              </div>
            )}

            {job.status === "Rejected" && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/30 p-4 text-center">
                <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                  This job was declined
                </p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export type { Deliverable, Job, Message };
