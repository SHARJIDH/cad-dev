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
    Copy,
    Download,
    Edit2,
    FileText,
    MoreVertical,
    Plus,
    Search,
    Settings,
    Star,
    StarOff,
    Trash2,
    Users,
    Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useProjects, type Project } from "@/lib/store";
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
    const { projects, addProject, updateProject, deleteProject } = useProjects();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");
    const [createOpen, setCreateOpen] = useState(false);

    // New project form
    const [newTitle, setNewTitle] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [newClient, setNewClient] = useState("");
    const [newStatus, setNewStatus] = useState<Project["status"]>("Draft");
    const [newTags, setNewTags] = useState("");

    // Filter projects
    const filteredProjects = projects.filter((project) => {
        const matchesSearch =
            project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

        if (activeFilter === "all") return matchesSearch;
        if (activeFilter === "favorites") return matchesSearch && project.favorite;
        if (activeFilter === "inProgress") return matchesSearch && project.status === "In Progress";
        if (activeFilter === "completed") return matchesSearch && project.status === "Complete";
        return matchesSearch;
    });

    const handleCreate = () => {
        if (!newTitle.trim()) return;
        addProject({
            title: newTitle.trim(),
            description: newDescription.trim(),
            status: newStatus,
            client: newClient.trim() || "Unassigned",
            team: [],
            thumbnail: "/placeholder.svg?height=200&width=300",
            tags: newTags.split(",").map(t => t.trim()).filter(Boolean),
            favorite: false,
            progress: 0,
        });
        setNewTitle(""); setNewDescription(""); setNewClient(""); setNewTags(""); setNewStatus("Draft");
        setCreateOpen(false);
        toast({ title: "Project created", description: `"${newTitle}" has been created.` });
    };

    const handleDuplicate = (project: Project) => {
        addProject({
            title: `${project.title} (Copy)`,
            description: project.description,
            status: "Draft",
            client: project.client,
            team: [...project.team],
            thumbnail: project.thumbnail,
            tags: [...project.tags],
            favorite: false,
            progress: 0,
        });
        toast({ title: "Project duplicated", description: `"${project.title}" has been duplicated.` });
    };

    const handleDelete = (project: Project) => {
        deleteProject(project.id);
        toast({ title: "Project deleted", description: `"${project.title}" has been deleted.`, variant: "destructive" });
    };

    const toggleFavorite = (id: string) => {
        const project = projects.find(p => p.id === id);
        if (project) updateProject(id, { favorite: !project.favorite });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "In Progress": return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-none";
            case "Complete": return "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-none";
            case "Draft": return "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-none";
            case "Planning": return "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none";
            case "On Hold": return "bg-gradient-to-r from-gray-400 to-gray-500 text-white border-none";
            default: return "bg-gray-500/10 text-gray-500";
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
                                    <Label>Project Title *</Label>
                                    <Input placeholder="Modern Office Building" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="border-2 focus:border-purple-300" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea placeholder="Brief description of the project..." value={newDescription} onChange={(e) => setNewDescription(e.target.value)} className="border-2 focus:border-purple-300" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Client</Label>
                                        <Input placeholder="Client name" value={newClient} onChange={(e) => setNewClient(e.target.value)} className="border-2 focus:border-purple-300" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Status</Label>
                                        <Select value={newStatus} onValueChange={(v) => setNewStatus(v as Project["status"])}>
                                            <SelectTrigger className="border-2">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Draft">Draft</SelectItem>
                                                <SelectItem value="Planning">Planning</SelectItem>
                                                <SelectItem value="In Progress">In Progress</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Tags (comma-separated)</Label>
                                    <Input placeholder="Commercial, Sustainable, Urban" value={newTags} onChange={(e) => setNewTags(e.target.value)} className="border-2 focus:border-purple-300" />
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
                    <TabsList className="grid grid-cols-4 w-full sm:w-auto bg-white border-2">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="favorites">Favorites</TabsTrigger>
                        <TabsTrigger value="inProgress">In Progress</TabsTrigger>
                        <TabsTrigger value="completed">Completed</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Projects Grid */}
            {filteredProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            onToggleFavorite={toggleFavorite}
                            onDuplicate={handleDuplicate}
                            onDelete={handleDelete}
                            getStatusColor={getStatusColor}
                        />
                    ))}

                    {/* Create New Project Card */}
                    <Card
                        className="border-2 border-dashed border-purple-200 h-full flex flex-col items-center justify-center text-center p-6 cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-all group"
                        onClick={() => setCreateOpen(true)}
                    >
                        <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 p-4 mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/50">
                            <Plus className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold">Create New Project</h3>
                        <p className="text-sm text-gray-600 mt-2">Start designing with AI assistance</p>
                    </Card>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-purple-100 p-6 mb-4">
                        <Building2 className="h-10 w-10 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">No projects found</h3>
                    <p className="text-gray-600 max-w-md">
                        We couldn't find any projects matching your search criteria.
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

function ProjectCard({
    project,
    onToggleFavorite,
    onDuplicate,
    onDelete,
    getStatusColor,
}: {
    project: Project;
    onToggleFavorite: (id: string) => void;
    onDuplicate: (project: Project) => void;
    onDelete: (project: Project) => void;
    getStatusColor: (status: string) => string;
}) {
    return (
        <Card className="overflow-hidden flex flex-col h-full group hover:shadow-2xl hover:-translate-y-1 transition-all border-2 border-gray-100 hover:border-purple-200">
            <div className="aspect-video relative bg-gradient-to-br from-purple-100 to-blue-100">
                <img src={project.thumbnail} alt={project.title} className="object-cover w-full h-full opacity-80" />
                <div className="absolute top-2 right-2 flex items-center gap-2">
                    <Badge variant="secondary" className={`${getStatusColor(project.status)} font-semibold shadow-lg`}>
                        {project.status}
                    </Badge>
                    <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
                        onClick={(e) => { e.preventDefault(); onToggleFavorite(project.id); }}
                    >
                        {project.favorite ? (
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ) : (
                            <StarOff className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>

            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg group-hover:text-purple-600 transition-colors">{project.title}</CardTitle>
                        <CardDescription className="line-clamp-2 text-gray-600">{project.description}</CardDescription>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem className="cursor-pointer gap-2"><Edit2 className="h-4 w-4" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => onDuplicate(project)}>
                                <Copy className="h-4 w-4" /> Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer gap-2"><Download className="h-4 w-4" /> Export</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer text-destructive gap-2" onClick={() => onDelete(project)}>
                                <Trash2 className="h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>

            <CardContent className="pb-2">
                <div className="flex flex-wrap gap-1 mb-3">
                    {project.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="font-normal border-purple-200 text-purple-700">{tag}</Badge>
                    ))}
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4 text-purple-500" />
                        <span>Client: {project.client}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 text-purple-500" />
                        <span>Created: {new Date(project.dateCreated).toLocaleDateString()}</span>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-semibold text-purple-600">{project.progress}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-purple-100 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500" style={{ width: `${project.progress}%` }} />
                        </div>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="pt-2 mt-auto">
                <div className="flex justify-between items-center w-full">
                    <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {timeAgo(project.lastUpdated)}
                    </div>
                    <Link href={`/cad-generator`}>
                        <Button variant="default" size="sm" className="shadow-md hover:shadow-lg transition-shadow">
                            Open Project
                        </Button>
                    </Link>
                </div>
            </CardFooter>
        </Card>
    );
}
