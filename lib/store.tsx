"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

// ============================================
// Types — shared across the app
// ============================================

export interface Project {
    id: string;
    title: string;
    description: string;
    status: "Draft" | "In Progress" | "Complete" | "Planning" | "On Hold" | "In Review";
    client: string;
    lastUpdated: string;
    dateCreated: string;
    team: string[]; // team member IDs
    thumbnail: string;
    tags: string[];
    favorite: boolean;
    progress: number;
    // Optional CAD data
    modelData?: any;
    generatedCode?: string;
}

export interface TeamMember {
    id: string;
    name: string;
    role: string;
    avatar: string;
    email: string;
    phone: string;
    skills: string[];
    activeProjects: number;
    completedProjects: number;
    bio: string;
    status: "active" | "away" | "offline";
    isAdmin: boolean;
    efficiency: number;
}

// ============================================
// Repository interface — swap this for a real DB later
// ============================================
// To migrate to a real database (Prisma, Supabase, MongoDB, etc.):
//   1. Create a new file (e.g. lib/db-repository.ts)
//   2. Implement the same IRepository interface
//   3. Swap the import in this file
// ============================================

interface IRepository<T> {
    getAll(): T[];
    getById(id: string): T | undefined;
    create(item: T): void;
    update(id: string, updates: Partial<T>): void;
    delete(id: string): void;
}

// ============================================
// localStorage repository implementation
// ============================================

function createLocalStorageRepo<T extends { id: string }>(key: string, seedData: T[]): IRepository<T> {
    const load = (): T[] => {
        if (typeof window === "undefined") return seedData;
        try {
            const raw = localStorage.getItem(key);
            if (!raw) {
                localStorage.setItem(key, JSON.stringify(seedData));
                return seedData;
            }
            return JSON.parse(raw);
        } catch {
            return seedData;
        }
    };

    const save = (items: T[]) => {
        if (typeof window === "undefined") return;
        localStorage.setItem(key, JSON.stringify(items));
    };

    return {
        getAll: () => load(),
        getById: (id) => load().find((item) => item.id === id),
        create: (item) => { const items = load(); items.push(item); save(items); },
        update: (id, updates) => {
            const items = load().map((item) => item.id === id ? { ...item, ...updates } : item);
            save(items);
        },
        delete: (id) => { save(load().filter((item) => item.id !== id)); },
    };
}

// ============================================
// Seed data — realistic defaults
// ============================================

const SEED_PROJECTS: Project[] = [
    {
        id: "proj-001",
        title: "Modern Office Building",
        description: "10-story commercial space with sustainable design elements",
        status: "In Progress",
        client: "TechCorp Inc.",
        lastUpdated: new Date(Date.now() - 2 * 3600000).toISOString(),
        dateCreated: "2023-04-15",
        team: ["user1", "user3", "user4"],
        thumbnail: "/placeholder.svg?height=200&width=300",
        tags: ["Commercial", "Sustainable", "Urban"],
        favorite: true,
        progress: 65,
    },
    {
        id: "proj-002",
        title: "Residential Complex",
        description: "Multi-family housing with integrated green spaces",
        status: "Draft",
        client: "GreenHome Developers",
        lastUpdated: new Date(Date.now() - 86400000).toISOString(),
        dateCreated: "2023-04-10",
        team: ["user1", "user2"],
        thumbnail: "/placeholder.svg?height=200&width=300",
        tags: ["Residential", "Multi-family", "Green"],
        favorite: false,
        progress: 25,
    },
    {
        id: "proj-003",
        title: "Urban Retail Center",
        description: "Mixed-use development with retail and office spaces",
        status: "Complete",
        client: "Metro Developments LLC",
        lastUpdated: new Date(Date.now() - 2 * 86400000).toISOString(),
        dateCreated: "2023-03-28",
        team: ["user2", "user3"],
        thumbnail: "/placeholder.svg?height=200&width=300",
        tags: ["Commercial", "Retail", "Urban"],
        favorite: true,
        progress: 100,
    },
    {
        id: "proj-004",
        title: "Community Healthcare Facility",
        description: "Modern clinic with specialized care units and healing garden",
        status: "In Progress",
        client: "Westside Health Partners",
        lastUpdated: new Date(Date.now() - 4 * 86400000).toISOString(),
        dateCreated: "2023-03-15",
        team: ["user1", "user4"],
        thumbnail: "/placeholder.svg?height=200&width=300",
        tags: ["Healthcare", "Community", "Accessibility"],
        favorite: false,
        progress: 45,
    },
    {
        id: "proj-005",
        title: "Educational Campus Redesign",
        description: "Renovation and expansion of existing university buildings",
        status: "Planning",
        client: "State University",
        lastUpdated: new Date(Date.now() - 7 * 86400000).toISOString(),
        dateCreated: "2023-03-10",
        team: ["user2", "user3", "user4"],
        thumbnail: "/placeholder.svg?height=200&width=300",
        tags: ["Education", "Renovation", "Institutional"],
        favorite: false,
        progress: 15,
    },
];

const SEED_TEAM: TeamMember[] = [
    {
        id: "user1",
        name: "Alice Chen",
        role: "Lead Architect",
        avatar: "/placeholder.svg?height=80&width=80",
        email: "alice.chen@example.com",
        phone: "+1 (555) 123-4567",
        skills: ["AutoCAD", "Revit", "Sustainable Design", "Project Management"],
        activeProjects: 4,
        completedProjects: 12,
        bio: "Lead architect with 10+ years of experience in sustainable commercial design.",
        status: "active",
        isAdmin: true,
        efficiency: 92,
    },
    {
        id: "user2",
        name: "Mark Johnson",
        role: "Senior Designer",
        avatar: "/placeholder.svg?height=80&width=80",
        email: "mark.johnson@example.com",
        phone: "+1 (555) 234-5678",
        skills: ["SketchUp", "3D Rendering", "Interior Design"],
        activeProjects: 3,
        completedProjects: 8,
        bio: "Senior designer specializing in 3D visualization and interior spaces.",
        status: "active",
        isAdmin: false,
        efficiency: 87,
    },
    {
        id: "user3",
        name: "Sarah Wilson",
        role: "Structural Engineer",
        avatar: "/placeholder.svg?height=80&width=80",
        email: "sarah.wilson@example.com",
        phone: "+1 (555) 345-6789",
        skills: ["Structural Analysis", "ETABS", "Seismic Design"],
        activeProjects: 5,
        completedProjects: 15,
        bio: "Structural engineer ensuring safety and innovation in every project.",
        status: "away",
        isAdmin: false,
        efficiency: 90,
    },
    {
        id: "user4",
        name: "David Park",
        role: "Project Manager",
        avatar: "/placeholder.svg?height=80&width=80",
        email: "david.park@example.com",
        phone: "+1 (555) 456-7890",
        skills: ["Project Planning", "Budget Control", "Client Relations"],
        activeProjects: 6,
        completedProjects: 20,
        bio: "Experienced project manager bridging design vision with execution.",
        status: "active",
        isAdmin: false,
        efficiency: 85,
    },
];

// ============================================
// Context + Provider
// ============================================

interface StoreContextType {
    // Projects
    projects: Project[];
    addProject: (project: Omit<Project, "id" | "dateCreated" | "lastUpdated">) => Project;
    updateProject: (id: string, updates: Partial<Project>) => void;
    deleteProject: (id: string) => void;
    getProject: (id: string) => Project | undefined;

    // Team
    teamMembers: TeamMember[];
    addTeamMember: (member: Omit<TeamMember, "id">) => TeamMember;
    updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
    deleteTeamMember: (id: string) => void;
    getTeamMember: (id: string) => TeamMember | undefined;

    // Settings (persisted)
    settings: AppSettings;
    updateSettings: (updates: Partial<AppSettings>) => void;
}

export interface AppSettings {
    profile: {
        name: string;
        email: string;
        company: string;
        bio: string;
    };
    notifications: {
        email: boolean;
        app: boolean;
        projectUpdates: boolean;
        teamMessages: boolean;
    };
    ai: {
        autoSuggestions: boolean;
        model: string;
        sustainabilityCheck: boolean;
    };
}

const DEFAULT_SETTINGS: AppSettings = {
    profile: {
        name: "Alice Chen",
        email: "alice.chen@example.com",
        company: "Architectural Innovations",
        bio: "Lead architect specializing in sustainable design",
    },
    notifications: { email: true, app: true, projectUpdates: true, teamMessages: true },
    ai: { autoSuggestions: true, model: "standard", sustainabilityCheck: true },
};

const StoreContext = createContext<StoreContextType | null>(null);

let projectRepo: IRepository<Project>;
let teamRepo: IRepository<TeamMember>;

function generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
    const [hydrated, setHydrated] = useState(false);

    // Hydrate from localStorage on mount
    useEffect(() => {
        projectRepo = createLocalStorageRepo<Project>("app_projects", SEED_PROJECTS);
        teamRepo = createLocalStorageRepo<TeamMember>("app_team", SEED_TEAM);

        setProjects(projectRepo.getAll());
        setTeamMembers(teamRepo.getAll());

        // Load settings
        try {
            const raw = localStorage.getItem("app_settings");
            if (raw) setSettings(JSON.parse(raw));
        } catch { }

        setHydrated(true);
    }, []);

    // Sync state → localStorage
    const syncProjects = useCallback((updater: (prev: Project[]) => Project[]) => {
        setProjects((prev) => {
            const next = updater(prev);
            if (typeof window !== "undefined") localStorage.setItem("app_projects", JSON.stringify(next));
            return next;
        });
    }, []);

    const syncTeam = useCallback((updater: (prev: TeamMember[]) => TeamMember[]) => {
        setTeamMembers((prev) => {
            const next = updater(prev);
            if (typeof window !== "undefined") localStorage.setItem("app_team", JSON.stringify(next));
            return next;
        });
    }, []);

    // ---- Project CRUD ----
    const addProject = useCallback((data: Omit<Project, "id" | "dateCreated" | "lastUpdated">): Project => {
        const project: Project = {
            ...data,
            id: generateId("proj"),
            dateCreated: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
        };
        syncProjects((prev) => [...prev, project]);
        return project;
    }, [syncProjects]);

    const updateProject = useCallback((id: string, updates: Partial<Project>) => {
        syncProjects((prev) =>
            prev.map((p) => p.id === id ? { ...p, ...updates, lastUpdated: new Date().toISOString() } : p)
        );
    }, [syncProjects]);

    const deleteProject = useCallback((id: string) => {
        syncProjects((prev) => prev.filter((p) => p.id !== id));
    }, [syncProjects]);

    const getProject = useCallback((id: string) => {
        return projects.find((p) => p.id === id);
    }, [projects]);

    // ---- Team CRUD ----
    const addTeamMember = useCallback((data: Omit<TeamMember, "id">): TeamMember => {
        const member: TeamMember = { ...data, id: generateId("user") };
        syncTeam((prev) => [...prev, member]);
        return member;
    }, [syncTeam]);

    const updateTeamMember = useCallback((id: string, updates: Partial<TeamMember>) => {
        syncTeam((prev) => prev.map((m) => m.id === id ? { ...m, ...updates } : m));
    }, [syncTeam]);

    const deleteTeamMember = useCallback((id: string) => {
        syncTeam((prev) => prev.filter((m) => m.id !== id));
    }, [syncTeam]);

    const getTeamMember = useCallback((id: string) => {
        return teamMembers.find((m) => m.id === id);
    }, [teamMembers]);

    // ---- Settings ----
    const updateSettings = useCallback((updates: Partial<AppSettings>) => {
        setSettings((prev) => {
            const next = { ...prev, ...updates };
            if (typeof window !== "undefined") localStorage.setItem("app_settings", JSON.stringify(next));
            return next;
        });
    }, []);

    // Don't render children until hydrated to avoid SSR mismatch
    if (!hydrated) {
        return null;
    }

    return (
        <StoreContext.Provider
            value={{
                projects, addProject, updateProject, deleteProject, getProject,
                teamMembers, addTeamMember, updateTeamMember, deleteTeamMember, getTeamMember,
                settings, updateSettings,
            }}
        >
            {children}
        </StoreContext.Provider>
    );
}

// ============================================
// Hooks — clean API for components
// ============================================

export function useProjects() {
    const ctx = useContext(StoreContext);
    if (!ctx) throw new Error("useProjects must be used within StoreProvider");
    return {
        projects: ctx.projects,
        addProject: ctx.addProject,
        updateProject: ctx.updateProject,
        deleteProject: ctx.deleteProject,
        getProject: ctx.getProject,
    };
}

export function useTeam() {
    const ctx = useContext(StoreContext);
    if (!ctx) throw new Error("useTeam must be used within StoreProvider");
    return {
        teamMembers: ctx.teamMembers,
        addTeamMember: ctx.addTeamMember,
        updateTeamMember: ctx.updateTeamMember,
        deleteTeamMember: ctx.deleteTeamMember,
        getTeamMember: ctx.getTeamMember,
    };
}

export function useSettings() {
    const ctx = useContext(StoreContext);
    if (!ctx) throw new Error("useSettings must be used within StoreProvider");
    return { settings: ctx.settings, updateSettings: ctx.updateSettings };
}
