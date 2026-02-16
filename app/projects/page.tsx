"use client";

import { useState } from "react";
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
    const { projects, isLoading, createProject, deleteProject: deleteProjectApi } = useProjects();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");
    const [createOpen, setCreateOpen] = useState(false);

    // New project form
    const [newTitle, setNewTitle] = useState("");
    const [newDescription, setNewDescription] = useState("");

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
            await createProject({
                name: newTitle.trim(),
                description: newDescription.trim(),
                isPublic: false,
            });
            setNewTitle("");
            setNewDescription("");
            setCreateOpen(false);
            toast({ title: "Project created", description: `"${newTitle}" has been created.` });
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

    return (
        <div className="container mx-auto p-6 space-y-6 bg-gradient-to-br from-purple-50/30 via-white to-blue-50/30 min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-6 w-6 text-purple-600" />
                        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            Projects
                        </h1>
                    </div>
                    <p className="text-gray-600 text-lg">
                        Manage and track your architectural designs
                    </p>
                </div>

                <div className="flex gap-2">
                    <Link href="/templates">
                        <Button variant="outline" className="gap-1 border-2 hover:bg-purple-50 hover:border-purple-300">
                            <FileText className="h-4 w-4" />
                            Templates
                        </Button>
                    </Link>
                    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-1 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all">
                                <Plus className="h-4 w-4" />
                                New Project
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle className="text-xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Create New Project</DialogTitle>
                                <DialogDescription>Fill in the details to create a new design project.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Project Name *</Label>
                                    <Input placeholder="Modern Office Building" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="border-2 focus:border-purple-300" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea placeholder="Brief description of the project..." value={newDescription} onChange={(e) => setNewDescription(e.target.value)} className="border-2 focus:border-purple-300" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                                <Button onClick={handleCreate} disabled={!newTitle.trim()} className="shadow-lg shadow-purple-500/30">
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
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                        type="search"
                        placeholder="Search projects..."
                        className="pl-9 border-2 focus:border-purple-300"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={setActiveFilter}>
                    <TabsList className="grid grid-cols-1 w-full sm:w-auto bg-white border-2">
                        <TabsTrigger value="all">All Projects</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Projects Grid */}
            {isLoading ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">Loading projects...</p>
                </div>
            ) : filteredProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-purple-100 p-6 mb-4">
                        <Building2 className="h-10 w-10 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">No projects found</h3>
                    <p className="text-gray-600 max-w-md">
                        Create your first project to get started with AI-powered CAD design.
                    </p>
                    <Button className="mt-6 gap-1 shadow-lg shadow-purple-500/30" onClick={() => setCreateOpen(true)}>
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
};

function ProjectCard({ project, onDelete }: ProjectCardProps) {
    const formattedDate = new Date(project.updatedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <Link href={`/cad-generator?projectId=${project.id}`}>
            <Card className="overflow-hidden flex flex-col h-full group hover:shadow-2xl hover:-translate-y-1 transition-all border-2 border-gray-100 hover:border-purple-200 cursor-pointer">
                <div className="aspect-video relative bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                    <Building2 className="h-16 w-16 text-purple-400" />
                </div>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <CardTitle className="text-lg mb-1 group-hover:text-purple-600 transition-colors">
                                {project.name}
                            </CardTitle>
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
                            <DropdownMenuContent align="end" onClick={(e) => e.preventDefault()}>
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
                            <div className="flex items-center text-sm text-gray-600">
                                <Users className="h-4 w-4 mr-2" />
                                <span>{project.owner.name || project.owner.email}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-600">
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
                    <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        Updated {formattedDate}
                    </div>
                </CardFooter>
            </Card>
        </Link>
    );
}

