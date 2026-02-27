"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Building2,
    Calendar,
    Clock,
    FileText,
    MoreVertical,
    Plus,
    Search,
    Trash2,
    Users,
    Sparkles,
    Lock,
    Globe,
} from "lucide-react";
import Link from "next/link";
import { useProjects } from "@/hooks/use-projects";
import { toast } from "@/components/ui/use-toast";

function timeAgo(isoDate: string): string {
    const diff = Date.now() - new Date(isoDate).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export default function ProjectsPage() {
    const router = useRouter();
    const { projects, isLoading, createProject, deleteProject: deleteProjectApi } = useProjects();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");

    // New project form
    const [newTitle, setNewTitle] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [newIsPublic, setNewIsPublic] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    // Filter projects
    const filteredProjects = projects.filter((project) => {
        const matchesSearch =
            project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (project.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());

        if (activeFilter === "all") return matchesSearch;
        return matchesSearch;
    });

    const handleCreate = async () => {
        if (!newTitle.trim()) return;
        try {
            const newProject = await createProject({
                name: newTitle.trim(),
                description: newDescription.trim(),
                isPublic: newIsPublic,
            });
            setNewTitle("");
            setNewDescription("");
            setNewIsPublic(false);
            setDialogOpen(false);
            toast({ title: "Project created", description: `"${newTitle}" has been created.` });
            // Navigate to the CAD generator with the new project
            router.push(`/cad-generator?projectId=${newProject.id}`);
        } catch (error) {
            toast({ 
                title: "Error", 
                description: "Failed to create project", 
                variant: "destructive" 
            });
        }
    };

    const handleDelete = async (projectId: string, projectName: string) => {
        try {
            await deleteProjectApi(projectId);
            toast({ 
                title: "Project deleted", 
                description: `"${projectName}" has been deleted.`, 
                variant: "destructive" 
            });
        } catch (error) {
            toast({ 
                title: "Error", 
                description: "Failed to delete project", 
                variant: "destructive" 
            });
        }
    };

    const handleTogglePublic = async (projectId: string, isPublic: boolean) => {
        try {
            const response = await fetch(`/api/projects/${projectId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isPublic }),
            });

            if (!response.ok) {
                throw new Error('Failed to update project');
            }

            // Refresh projects list
            window.location.reload();
            
            toast({ 
                title: isPublic ? "Project is now public" : "Project is now private", 
                description: isPublic 
                    ? "Anyone with the link can view this project" 
                    : "Only team members can access this project",
            });
        } catch (error) {
            toast({ 
                title: "Error", 
                description: "Failed to update project visibility", 
                variant: "destructive" 
            });
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6 bg-gradient-to-br from-orange-50/30 via-background to-amber-50/30 dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg min-h-screen transition-colors duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-6 w-6 text-orange-500" />
                        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                            Projects
                        </h1>
                    </div>
                    <p className="text-muted-foreground text-lg">
                        Manage and track your architectural designs
                    </p>
                </div>

                <div className="flex gap-2">
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-1 bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all">
                                <Plus className="h-4 w-4" />
                                New Project
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] dark:bg-dark-surface dark:border-dark-border">
                            <DialogHeader>
                                <DialogTitle className="text-xl bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">Create New Project</DialogTitle>
                                <DialogDescription>Fill in the details to create a new design project.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Project Name *</Label>
                                    <Input placeholder="Modern Office Building" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="border-2 focus:border-orange-300 dark:focus:border-orange-500/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea placeholder="Brief description of the project..." value={newDescription} onChange={(e) => setNewDescription(e.target.value)} className="border-2 focus:border-orange-300 dark:focus:border-orange-500/50" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Public Project</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Anyone with the link can view this project
                                        </p>
                                    </div>
                                    <Switch
                                        checked={newIsPublic}
                                        onCheckedChange={setNewIsPublic}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleCreate} disabled={!newTitle.trim()} className="bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/30">
                                    <Plus className="h-4 w-4 mr-1" />
                                    Create Project
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search projects..."
                        className="pl-9 border-2 focus:border-orange-300 dark:focus:border-orange-500/50"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={setActiveFilter}>
                    <TabsList className="grid grid-cols-1 w-full sm:w-auto bg-card dark:bg-dark-surface border-2 border-border">
                        <TabsTrigger value="all" className="data-[state=active]:bg-orange-50 dark:data-[state=active]:bg-dark-accent data-[state=active]:text-orange-600 dark:data-[state=active]:text-orange-400">All Projects</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Projects Grid */}
            {isLoading ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Loading projects...</p>
                </div>
            ) : filteredProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            onDelete={handleDelete}
                            onTogglePublic={handleTogglePublic}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-orange-100 dark:bg-orange-500/20 p-6 mb-4">
                        <Building2 className="h-10 w-10 text-orange-500" />
                    </div>
                    <h3 className="text-xl font-medium mb-2 text-foreground">No projects found</h3>
                    <p className="text-muted-foreground max-w-md">
                        Create your first project to get started with AI-powered CAD design.
                    </p>
                    <Button className="mt-6 gap-1 bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/30" onClick={() => setDialogOpen(true)}>
                        <Plus className="h-4 w-4" />
                        New Project
                    </Button>
                </div>
            )}
        </div>
    );
}

type ProjectCardProps = {
    project: {
        id: string;
        name: string;
        description?: string | null;
        createdAt: Date | string;
        updatedAt: Date | string;
        isPublic?: boolean;
        _count?: {
            messages: number;
            versions: number;
        };
        owner?: {
            name?: string | null;
            email: string;
        };
        members?: Array<{
            user: {
                name?: string | null;
                email: string;
            };
        }>;
    };
    onDelete: (id: string, name: string) => void;
    onTogglePublic?: (id: string, isPublic: boolean) => void;
};

function ProjectCard({ project, onDelete, onTogglePublic }: ProjectCardProps) {
    const [isTogglingPublic, setIsTogglingPublic] = useState(false);
    const formattedDate = new Date(project.updatedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <Link href={`/cad-generator?projectId=${project.id}`}>
            <Card className="overflow-hidden flex flex-col h-full group hover:shadow-2xl hover:-translate-y-1 transition-all border-2 border-border hover:border-orange-200 dark:hover:border-orange-500/30 cursor-pointer dark:bg-dark-surface">
                <div className="aspect-video relative bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-500/20 dark:to-amber-500/20 flex items-center justify-center overflow-hidden">
                    <Building2 className="h-16 w-16 text-orange-400 dark:text-orange-500/50" />
                </div>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <CardTitle className="text-lg group-hover:text-orange-500 transition-colors">
                                    {project.name}
                                </CardTitle>
                                {project.isPublic ? (
                                    <Globe className="h-4 w-4 text-green-600" title="Public" />
                                ) : (
                                    <Lock className="h-4 w-4 text-gray-400 dark:text-gray-500" title="Private" />
                                )}
                            </div>
                            <CardDescription className="line-clamp-2">
                                {project.description || 'No description'}
                            </CardDescription>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.preventDefault()} className="dark:bg-dark-surface dark:border-dark-border">
                                {project.isPublic ? (
                                    <>
                                        <DropdownMenuItem 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                const publicLink = `${window.location.origin}/project/${project.id}/public`;
                                                navigator.clipboard.writeText(publicLink);
                                                alert('Public link copied to clipboard!');
                                            }}
                                            className="cursor-pointer"
                                        >
                                            <Globe className="h-4 w-4 mr-2 text-green-600" />
                                            Copy Public Link
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setIsTogglingPublic(true);
                                                onTogglePublic?.(project.id, false);
                                            }}
                                            disabled={isTogglingPublic}
                                            className="cursor-pointer"
                                        >
                                            <Lock className="h-4 w-4 mr-2" />
                                            Make Private
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                    </>
                                ) : (
                                    <>
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setIsTogglingPublic(true);
                                                onTogglePublic?.(project.id, true);
                                            }}
                                            disabled={isTogglingPublic}
                                            className="cursor-pointer"
                                        >
                                            <Globe className="h-4 w-4 mr-2 text-amber-600" />
                                            Make Public
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                    </>
                                )}
                                <DropdownMenuItem onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onDelete(project.id, project.name);
                                }}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>
                <CardContent className="flex-1">
                    <div className="space-y-3">
                        {project.owner && (
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Users className="h-4 w-4 mr-2" />
                                <span>{project.owner.name || project.owner.email}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {project._count && (
                                <>
                                    <div className="flex items-center gap-1">
                                        <FileText className="h-4 w-4" />
                                        <span>{project._count.messages} messages</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        <span>{project._count.versions} versions</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="pt-0">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        Updated {formattedDate}
                    </div>
                </CardFooter>
            </Card>
        </Link>
    );
}

