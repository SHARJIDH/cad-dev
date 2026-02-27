"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { PlusCircle, Sparkles, Clock, FolderOpen, TrendingUp, Zap, Building2 } from "lucide-react";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { MovingBorder } from "@/components/ui/moving-border";
import { useProjects } from "@/hooks/use-projects";

const getStatusColor = (status: string) => {
  switch (status) {
    case "In Progress": return "bg-gradient-to-r from-amber-500 to-orange-500 text-white";
    case "Draft": return "bg-gradient-to-r from-amber-500 to-orange-500 text-white";
    case "Complete": return "bg-gradient-to-r from-orange-500 to-amber-500 text-white";
    case "Planning": return "bg-gradient-to-r from-orange-500 to-red-500 text-white";
    case "On Hold": return "bg-gradient-to-r from-gray-400 to-gray-500 text-white";
    default: return "bg-gray-100 dark:bg-dark-accent text-gray-700 dark:text-gray-300";
  }
};

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function DashboardPage() {
  const { projects, isLoading } = useProjects();
  const recentProjects = [...projects].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 6);

  const stats = [
    { icon: FolderOpen, label: "Total Projects", value: String(projects.length), change: `${projects.length} projects`, gradient: "from-orange-500 to-amber-500" },
    { icon: TrendingUp, label: "Active Designs", value: String(projects.length), change: "in database", gradient: "from-amber-500 to-yellow-500" },
    { icon: Zap, label: "Messages", value: String(projects.reduce((sum, p) => sum + (p._count?.messages || 0), 0)), change: "total conversations", gradient: "from-amber-500 to-orange-500" },
    { icon: Building2, label: "Versions", value: String(projects.reduce((sum, p) => sum + (p._count?.versions || 0), 0)), change: "saved versions", gradient: "from-orange-500 to-amber-500" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="absolute inset-0 bg-dot-orange\/10 opacity-30 pointer-events-none" />

      <div className="container mx-auto px-6 py-8 relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <TextGenerateEffect
              words="Your Dashboard"
              className="text-4xl tracking-tight bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent"
            />
            <p className="text-muted-foreground text-lg mt-1">Manage your design projects with AI assistance</p>
          </div>
          <Link href="/cad-generator">
            <MovingBorder
              as="div"
              duration={3000}
              className="bg-card dark:bg-dark-surface text-foreground font-semibold"
            >
              <PlusCircle className="h-5 w-5 text-orange-500" />
              New Project
            </MovingBorder>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((stat, i) => (
            <CardSpotlight key={i} className="p-5 bg-card dark:bg-dark-surface border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm text-muted-foreground font-medium">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardSpotlight>
          ))}
        </div>

        {/* Projects Section */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-orange-500" />
            Recent Projects
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {recentProjects.map((project) => (
            <Link href={`/cad-generator?projectId=${project.id}`} key={project.id}>
              <CardSpotlight className="p-0 bg-card dark:bg-dark-surface border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden group">
                <div className="aspect-video relative bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-500/20 dark:to-amber-500/20 overflow-hidden flex items-center justify-center">
                  <Building2 className="h-16 w-16 text-orange-300 dark:text-orange-500/50" />
                </div>
                <div className="p-4">
                  <CardTitle className="text-base text-foreground group-hover:text-orange-500 transition-colors">{project.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{project.description || 'No description'}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {timeAgo(project.updatedAt.toString())}
                  </div>
                </div>
              </CardSpotlight>
            </Link>
          ))}

          {/* Create New Project Card */}
          <Link href="/cad-generator">
            <CardSpotlight className="flex flex-col items-center justify-center h-full min-h-[220px] bg-card dark:bg-dark-surface border-border border-dashed hover:border-orange-300 dark:hover:border-orange-500/50 cursor-pointer group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-500/20 dark:to-amber-500/20 flex items-center justify-center mb-3 group-hover:from-orange-200 group-hover:to-amber-200 dark:group-hover:from-orange-500/30 dark:group-hover:to-amber-500/30 group-hover:scale-110 transition-all duration-300">
                <PlusCircle className="h-7 w-7 text-orange-500" />
              </div>
              <p className="text-sm font-medium text-muted-foreground group-hover:text-orange-500 transition-colors">Create New Project</p>
            </CardSpotlight>
          </Link>
        </div>
      </div>
    </div>
  );
}
