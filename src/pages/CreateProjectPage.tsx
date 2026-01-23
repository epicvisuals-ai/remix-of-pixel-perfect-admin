import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarIcon, Plus, Trash2, Upload, X } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  TeamMemberAssignment,
  TeamMember,
  ProjectRole,
} from "@/components/projects/TeamMemberAssignment";

interface Deliverable {
  id: string;
  name: string;
  description: string;
  dueDate?: Date;
}

const categoryOptions = [
  { value: "video_campaign", label: "Video Campaign" },
  { value: "photography", label: "Photography" },
  { value: "social_media", label: "Social Media" },
  { value: "brand_identity", label: "Brand Identity" },
  { value: "motion_graphics", label: "Motion Graphics" },
  { value: "content_strategy", label: "Content Strategy" },
  { value: "other", label: "Other" },
];

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const mockCreators = [
  { value: "sarah", label: "Sarah Miller" },
  { value: "alex", label: "Alex Chen" },
  { value: "jordan", label: "Jordan Lee" },
  { value: "emma", label: "Emma Wilson" },
];

const CreateProjectPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [creator, setCreator] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState<Date>();
  const [priority, setPriority] = useState("medium");
  const [deliverables, setDeliverables] = useState<Deliverable[]>([
    { id: "1", name: "", description: "" },
  ]);
  const [referenceFiles, setReferenceFiles] = useState<File[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  const handleAddTeamMember = (member: TeamMember) => {
    setTeamMembers([...teamMembers, member]);
  };

  const handleRemoveTeamMember = (memberId: string) => {
    setTeamMembers(teamMembers.filter((m) => m.id !== memberId));
  };

  const handleUpdateTeamMemberRole = (memberId: string, role: ProjectRole) => {
    setTeamMembers(
      teamMembers.map((m) => (m.id === memberId ? { ...m, role } : m))
    );
  };

  const addDeliverable = () => {
    setDeliverables([
      ...deliverables,
      { id: Date.now().toString(), name: "", description: "" },
    ]);
  };

  const removeDeliverable = (id: string) => {
    if (deliverables.length > 1) {
      setDeliverables(deliverables.filter((d) => d.id !== id));
    }
  };

  const updateDeliverable = (
    id: string,
    field: keyof Deliverable,
    value: string | Date | undefined
  ) => {
    setDeliverables(
      deliverables.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setReferenceFiles([...referenceFiles, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setReferenceFiles(referenceFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a project title.",
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

    if (!deadline) {
      toast({
        title: "Deadline required",
        description: "Please select a deadline.",
        variant: "destructive",
      });
      return;
    }

    const validDeliverables = deliverables.filter((d) => d.name.trim());
    if (validDeliverables.length === 0) {
      toast({
        title: "Deliverables required",
        description: "Please add at least one deliverable.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Project created",
      description: "Your project has been created successfully.",
    });

    navigate("/projects");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create New Project</h1>
        <p className="text-muted-foreground">
          Set up a new project with deliverables and timeline
        </p>
      </div>

      <Separator />

      <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
        {/* Project Title */}
        <div className="space-y-3">
          <Label htmlFor="title" className="text-base font-medium">
            Project Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter project title"
          />
        </div>

        {/* Project Description */}
        <div className="space-y-3">
          <Label htmlFor="description" className="text-base font-medium">
            Description
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the project scope, goals, and requirements..."
            className="min-h-[120px] resize-none"
          />
        </div>

        {/* Category and Creator */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-3">
            <Label htmlFor="category" className="text-base font-medium">
              Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="creator" className="text-base font-medium">
              Assign Creator
            </Label>
            <Select value={creator} onValueChange={setCreator}>
              <SelectTrigger id="creator">
                <SelectValue placeholder="Select creator (optional)" />
              </SelectTrigger>
              <SelectContent>
                {mockCreators.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Budget, Deadline, Priority */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="space-y-3">
            <Label htmlFor="budget" className="text-base font-medium">
              Budget (USD) <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
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
            <Label className="text-base font-medium">
              Deadline <span className="text-destructive">*</span>
            </Label>
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
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const checkDate = new Date(date);
                    checkDate.setHours(0, 0, 0, 0);
                    return checkDate <= today;
                  }}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-3">
            <Label htmlFor="priority" className="text-base font-medium">
              Priority
            </Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Deliverables */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">
              Deliverables <span className="text-destructive">*</span>
            </Label>
            <Button type="button" variant="outline" size="sm" onClick={addDeliverable}>
              <Plus className="mr-1 h-4 w-4" />
              Add Deliverable
            </Button>
          </div>

          <div className="space-y-4">
            {deliverables.map((deliverable, index) => (
              <Card key={deliverable.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor={`deliverable-name-${deliverable.id}`}>
                            Name
                          </Label>
                          <Input
                            id={`deliverable-name-${deliverable.id}`}
                            value={deliverable.name}
                            onChange={(e) =>
                              updateDeliverable(deliverable.id, "name", e.target.value)
                            }
                            placeholder={`Deliverable ${index + 1}`}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Due Date (optional)</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !deliverable.dueDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {deliverable.dueDate
                                  ? format(deliverable.dueDate, "PPP")
                                  : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={deliverable.dueDate}
                                onSelect={(date) =>
                                  updateDeliverable(deliverable.id, "dueDate", date)
                                }
                                disabled={(date) => {
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);
                                  const checkDate = new Date(date);
                                  checkDate.setHours(0, 0, 0, 0);
                                  return checkDate <= today;
                                }}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`deliverable-desc-${deliverable.id}`}>
                          Description (optional)
                        </Label>
                        <Textarea
                          id={`deliverable-desc-${deliverable.id}`}
                          value={deliverable.description}
                          onChange={(e) =>
                            updateDeliverable(deliverable.id, "description", e.target.value)
                          }
                          placeholder="Describe this deliverable..."
                          className="min-h-[60px] resize-none"
                        />
                      </div>
                    </div>
                    {deliverables.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeDeliverable(deliverable.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Team Members */}
        <TeamMemberAssignment
          teamMembers={teamMembers}
          onAddMember={handleAddTeamMember}
          onRemoveMember={handleRemoveTeamMember}
          onUpdateRole={handleUpdateTeamMemberRole}
        />

        {/* Reference Files */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Reference Files</Label>
          <div
            className={cn(
              "rounded-lg border-2 border-dashed p-6 text-center transition-colors",
              "border-muted-foreground/25 hover:border-muted-foreground/50"
            )}
          >
            <input
              type="file"
              id="reference-files"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="reference-files"
              className="flex cursor-pointer flex-col items-center gap-2"
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Click to upload reference files
              </span>
              <span className="text-xs text-muted-foreground/70">
                Images, documents, or any reference materials
              </span>
            </label>
          </div>

          {referenceFiles.length > 0 && (
            <div className="space-y-2">
              {referenceFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border bg-muted/50 px-3 py-2"
                >
                  <span className="truncate text-sm">{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/projects")}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1">
            Create Project
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateProjectPage;
