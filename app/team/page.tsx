"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
    BarChart,
    Building2,
    Clock,
    FileText,
    Mail,
    MessageCircle,
    MoreHorizontal,
    Phone,
    Plus,
    Search,
    Shield,
    UserPlus,
    Users,
    Sparkles,
} from "lucide-react";
import { useTeam, useProjects, type TeamMember } from "@/lib/store";
import { toast } from "@/components/ui/use-toast";

// Helper function to get status color
const getStatusColor = (status: string) => {
    switch (status) {
        case "active": return "bg-green-500";
        case "away": return "bg-yellow-500";
        case "offline": return "bg-gray-500";
        default: return "bg-gray-500";
    }
};

const getProjectStatusColor = (status: string) => {
    switch (status) {
        case "In Progress": return "bg-gradient-to-r from-orange-500 to-amber-500 text-white border-none";
        case "In Review": return "bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-none";
        case "Complete": return "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-none";
        default: return "bg-gray-100 text-gray-600 dark:bg-dark-surface dark:text-gray-400";
    }
};

export default function TeamPage() {
    const { teamMembers, addTeamMember, deleteTeamMember } = useTeam();
    const { projects } = useProjects();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTeamTab, setActiveTeamTab] = useState("all");
    const [inviteOpen, setInviteOpen] = useState(false);

    // New member form
    const [newName, setNewName] = useState("");
    const [newRole, setNewRole] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [newPhone, setNewPhone] = useState("");
    const [newSkills, setNewSkills] = useState("");
    const [newBio, setNewBio] = useState("");

    // Filter team members
    const filteredTeamMembers = teamMembers.filter((member) => {
        const matchesSearch =
            member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()));

        if (activeTeamTab === "all") return matchesSearch;
        if (activeTeamTab === "architects") return matchesSearch && (member.role.includes("Architect") || member.role.includes("Designer"));
        if (activeTeamTab === "engineers") return matchesSearch && member.role.includes("Engineer");
        if (activeTeamTab === "management") return matchesSearch && (member.role.includes("Manager") || member.isAdmin);
        return matchesSearch;
    });

    // Get projects that include a team member
    const getTeamMemberProjects = (memberId: string) => {
        return projects.filter(p => p.team.includes(memberId));
    };

    const handleInvite = () => {
        if (!newName.trim() || !newRole.trim()) return;
        addTeamMember({
            name: newName.trim(),
            role: newRole.trim(),
            avatar: "/placeholder.svg?height=80&width=80",
            email: newEmail.trim() || `${newName.trim().toLowerCase().replace(/\s+/g, ".")}@example.com`,
            phone: newPhone.trim() || "+1 (555) 000-0000",
            skills: newSkills.split(",").map(s => s.trim()).filter(Boolean),
            activeProjects: 0,
            completedProjects: 0,
            bio: newBio.trim() || `${newRole.trim()} specializing in architectural design.`,
            status: "active",
            isAdmin: false,
            efficiency: 75,
        });
        setNewName(""); setNewRole(""); setNewEmail(""); setNewPhone(""); setNewSkills(""); setNewBio("");
        setInviteOpen(false);
        toast({ title: "Team member invited", description: `${newName} has been added to the team.` });
    };

    const handleRemove = (member: TeamMember) => {
        deleteTeamMember(member.id);
        toast({ title: "Team member removed", description: `${member.name} has been removed.`, variant: "destructive" });
    };

    return (
        <div className="container mx-auto p-6 space-y-6 bg-white dark:bg-dark-bg min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Team</h1>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                        Manage your architectural team and collaborators
                    </p>
                </div>

                <div className="flex gap-2">
                    <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-1 border-2 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:border-orange-300 dark:hover:border-orange-500/50">
                                <UserPlus className="h-4 w-4" />
                                Invite
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] dark:bg-dark-surface dark:border-dark-border">
                            <DialogHeader>
                                <DialogTitle className="text-xl bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Invite Team Member</DialogTitle>
                                <DialogDescription>Add a new architect, engineer, or collaborator to your team.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Name *</Label>
                                        <Input placeholder="Jane Smith" value={newName} onChange={(e) => setNewName(e.target.value)} className="border-2 focus:border-orange-300 dark:focus:border-orange-500/50 dark:bg-dark-bg dark:border-dark-border" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Role *</Label>
                                        <Input placeholder="Senior Architect" value={newRole} onChange={(e) => setNewRole(e.target.value)} className="border-2 focus:border-orange-300 dark:focus:border-orange-500/50 dark:bg-dark-bg dark:border-dark-border" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input placeholder="jane@example.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="border-2 focus:border-orange-300 dark:focus:border-orange-500/50 dark:bg-dark-bg dark:border-dark-border" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Phone</Label>
                                        <Input placeholder="+1 (555) 123-4567" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="border-2 focus:border-orange-300 dark:focus:border-orange-500/50 dark:bg-dark-bg dark:border-dark-border" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Skills (comma-separated)</Label>
                                    <Input placeholder="AutoCAD, Revit, Sustainable Design" value={newSkills} onChange={(e) => setNewSkills(e.target.value)} className="border-2 focus:border-orange-300 dark:focus:border-orange-500/50 dark:bg-dark-bg dark:border-dark-border" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Bio</Label>
                                    <Input placeholder="Brief bio..." value={newBio} onChange={(e) => setNewBio(e.target.value)} className="border-2 focus:border-orange-300 dark:focus:border-orange-500/50 dark:bg-dark-bg dark:border-dark-border" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
                                <Button onClick={handleInvite} disabled={!newName.trim() || !newRole.trim()} className="shadow-lg shadow-orange-500/30 bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                                    <UserPlus className="h-4 w-4 mr-1" />
                                    Add Member
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Button className="gap-1 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                        <Users className="h-4 w-4" />
                        Manage Roles
                    </Button>
                </div>
            </div>

            {/* Team Tabs & Search */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={setActiveTeamTab}>
                    <TabsList className="grid grid-cols-4 w-full sm:w-auto bg-white border-2">
                        <TabsTrigger value="all">All ({teamMembers.length})</TabsTrigger>
                        <TabsTrigger value="architects">Architects</TabsTrigger>
                        <TabsTrigger value="engineers">Engineers</TabsTrigger>
                        <TabsTrigger value="management">Management</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        type="search"
                        placeholder="Search team..."
                        className="pl-8 border-2 focus:border-orange-300 dark:focus:border-orange-500/50 dark:bg-dark-surface dark:border-dark-border"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Team Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTeamMembers.map((member) => (
                    <TeamMemberCard key={member.id} member={member} onRemove={handleRemove} />
                ))}

                {/* Add Team Member Card */}
                <Card
                    className="border-2 border-dashed border-orange-200 dark:border-orange-500/30 flex flex-col items-center justify-center p-6 h-full hover:border-orange-400 dark:hover:border-orange-500/50 hover:bg-orange-50/50 dark:hover:bg-orange-500/10 transition-all cursor-pointer group dark:bg-dark-surface"
                    onClick={() => setInviteOpen(true)}
                >
                    <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 p-4 mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/30">
                        <UserPlus className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Add Team Member</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
                        Invite a new architect, engineer, or collaborator to join your team
                    </p>
                </Card>
            </div>

            {/* Team Projects Section */}
            <div className="mt-10">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                        Team Projects
                    </h2>
                </div>

                <div className="space-y-4">
                    {projects.filter(p => p.status !== "Complete").slice(0, 5).map((project) => (
                        <TeamProjectCard
                            key={project.id}
                            project={project}
                            teamMembers={teamMembers}
                            statusColor={getProjectStatusColor(project.status)}
                        />
                    ))}
                    {projects.filter(p => p.status !== "Complete").length === 0 && (
                        <div className="text-center py-8 text-gray-400">No active team projects</div>
                    )}
                </div>
            </div>
        </div>
    );
}

function TeamMemberCard({ member, onRemove }: { member: TeamMember; onRemove: (m: TeamMember) => void }) {
    return (
        <Card className="overflow-hidden border-gray-100 dark:border-dark-border hover:shadow-xl hover:-translate-y-1 transition-all border-2 hover:border-orange-200 dark:hover:border-orange-500/30 dark:bg-dark-surface">
            <CardHeader className="pb-2">
                <div className="flex justify-between">
                    <div className="flex items-start gap-3">
                        <div className="relative">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={member.avatar} />
                                <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-500 text-white">
                                    {member.name.split(" ").map((n: string) => n[0]).join("")}
                                </AvatarFallback>
                            </Avatar>
                            <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-dark-surface ${getStatusColor(member.status)}`} />
                        </div>
                        <div>
                            <CardTitle className="text-lg dark:text-white">{member.name}</CardTitle>
                            <CardDescription className="flex items-center gap-1">
                                {member.role}
                                {member.isAdmin && (
                                    <Badge variant="outline" className="ml-2 text-xs font-normal py-0 h-5 border-orange-200 dark:border-orange-500/30 text-orange-700 dark:text-orange-400">
                                        <Shield className="h-3 w-3 mr-1" /> Admin
                                    </Badge>
                                )}
                            </CardDescription>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem className="cursor-pointer"><Mail className="h-4 w-4 mr-2" /> Email</DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer"><MessageCircle className="h-4 w-4 mr-2" /> Message</DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer"><Building2 className="h-4 w-4 mr-2" /> View Projects</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer text-destructive" onClick={() => onRemove(member)}>
                                Remove
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>

            <CardContent>
                <div className="space-y-3">
                    <div className="text-sm line-clamp-2 text-gray-500 dark:text-gray-400">{member.bio}</div>

                    <div className="flex flex-wrap gap-1 mt-3">
                        {member.skills.map((skill: string) => (
                            <Badge key={skill} variant="outline" className="font-normal border-orange-200 dark:border-orange-500/30 text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10">{skill}</Badge>
                        ))}
                    </div>

                    <div className="flex justify-between text-sm pt-2">
                        <div>
                            <div className="text-gray-500 dark:text-gray-400">Active Projects</div>
                            <div className="font-semibold text-gray-800 dark:text-white">{member.activeProjects}</div>
                        </div>
                        <div>
                            <div className="text-gray-500 dark:text-gray-400">Completed</div>
                            <div className="font-semibold text-gray-800 dark:text-white">{member.completedProjects}</div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-orange-50 dark:hover:bg-orange-500/10">
                                <Mail className="h-4 w-4 text-orange-500 dark:text-orange-400" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-orange-50 dark:hover:bg-orange-500/10">
                                <Phone className="h-4 w-4 text-orange-500 dark:text-orange-400" />
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function TeamProjectCard({
    project,
    teamMembers,
    statusColor,
}: {
    project: any;
    teamMembers: TeamMember[];
    statusColor: string;
}) {
    const projectMembers = teamMembers.filter(m => project.team.includes(m.id));

    return (
        <Card className="border-gray-100 dark:border-dark-border border-2 hover:border-orange-200 dark:hover:border-orange-500/30 hover:shadow-lg transition-all dark:bg-dark-surface">
            <CardContent className="p-0">
                <div className="flex flex-col md:flex-row md:items-center p-4">
                    <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-medium">{project.title}</h3>
                                    <Badge className={statusColor}>{project.status}</Badge>
                                </div>
                                <p className="text-sm text-gray-500">Client: {project.client}</p>
                            </div>

                            <div className="flex items-center gap-2 md:justify-end">
                                <Button variant="outline" size="sm" className="border-2 hover:border-orange-300 dark:hover:border-orange-500/50">
                                    <FileText className="h-4 w-4 mr-1" /> Details
                                </Button>
                            </div>
                        </div>

                        <div className="mt-4">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Progress</span>
                                <span className="text-sm font-medium text-orange-600 dark:text-orange-400">{project.progress}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-orange-100 dark:bg-orange-500/20 overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500" style={{ width: `${project.progress}%` }} />
                            </div>
                        </div>

                        <div className="mt-4 flex flex-col sm:flex-row justify-between gap-4">
                            <div>
                                <span className="text-sm text-gray-500 block">Team Members</span>
                                <div className="flex items-center mt-1">
                                    <div className="flex -space-x-2">
                                        {projectMembers.slice(0, 3).map((member) => (
                                            <Avatar key={member.id} className="h-6 w-6 border-2 border-white dark:border-dark-surface">
                                                <AvatarImage src={member.avatar} alt={member.name} />
                                                <AvatarFallback className="text-xs bg-gradient-to-br from-orange-500 to-amber-500 text-white">
                                                    {member.name.split(" ").map((n: string) => n[0]).join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                        ))}
                                        {projectMembers.length > 3 && (
                                            <div className="h-6 w-6 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xs border-2 border-white dark:border-dark-surface">
                                                +{projectMembers.length - 3}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-sm ml-3">
                                        {projectMembers.slice(0, 2).map(m => m.name).join(", ")}
                                        {projectMembers.length > 2 ? ` +${projectMembers.length - 2} more` : ""}
                                        {projectMembers.length === 0 && <span className="text-gray-400">No members assigned</span>}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
