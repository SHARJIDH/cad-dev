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
    case "In Progress": return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white";
    case "Draft": return "bg-gradient-to-r from-amber-500 to-orange-500 text-white";
    case "Complete": return "bg-gradient-to-r from-green-500 to-emerald-500 text-white";
    case "Planning": return "bg-gradient-to-r from-purple-500 to-pink-500 text-white";
    case "On Hold": return "bg-gradient-to-r from-gray-400 to-gray-500 text-white";
    default: return "bg-gray-100 text-gray-700";
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
    { icon: FolderOpen, label: "Total Projects", value: String(projects.length), change: `${projects.length} projects`, gradient: "from-purple-500 to-violet-500" },
    { icon: TrendingUp, label: "Active Designs", value: String(projects.length), change: "in database", gradient: "from-blue-500 to-cyan-500" },
    { icon: Zap, label: "Messages", value: String(projects.reduce((sum, p) => sum + (p._count?.messages || 0), 0)), change: "total conversations", gradient: "from-amber-500 to-orange-500" },
    { icon: Building2, label: "Versions", value: String(projects.reduce((sum, p) => sum + (p._count?.versions || 0), 0)), change: "saved versions", gradient: "from-green-500 to-emerald-500" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="absolute inset-0 bg-dot-purple\/10 opacity-30 pointer-events-none" />

      <div className="container mx-auto px-6 py-8 relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <TextGenerateEffect
              words="Your Dashboard"
              className="text-4xl tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
            />
            <p className="text-gray-500 text-lg mt-1">Manage your design projects with AI assistance</p>
          </div>
          <Link href="/cad-generator">
            <MovingBorder
              as="div"
              duration={3000}
              className="bg-white text-gray-800 font-semibold"
            >
              <PlusCircle className="h-5 w-5 text-purple-600" />
              New Project
            </MovingBorder>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((stat, i) => (
            <CardSpotlight key={i} className="p-5 bg-white border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm text-gray-500 font-medium">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
            </CardSpotlight>
          ))}
        </div>

        {/* Projects Section */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Recent Projects
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {recentProjects.map((project) => (
            <Link href={`/cad-generator?projectId=${project.id}`} key={project.id}>
              <CardSpotlight className="p-0 bg-white border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden group">
                <div className="aspect-video relative bg-gradient-to-br from-purple-100 to-blue-100 overflow-hidden flex items-center justify-center">
                  <Building2 className="h-16 w-16 text-purple-300" />
                </div>
                <div className="p-4">
                  <CardTitle className="text-base text-gray-800 group-hover:text-purple-600 transition-colors">{project.name}</CardTitle>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{project.description || 'No description'}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    {timeAgo(project.updatedAt.toString())}
                  </div>
                </div>
              </CardSpotlight>
            </Link>
          ))}

          {/* Create New Project Card */}
          <Link href="/cad-generator">
            <CardSpotlight className="flex flex-col items-center justify-center h-full min-h-[220px] bg-white border-gray-100 border-dashed hover:border-purple-300 cursor-pointer group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center mb-3 group-hover:from-purple-200 group-hover:to-blue-200 group-hover:scale-110 transition-all duration-300">
                <PlusCircle className="h-7 w-7 text-purple-500" />
              </div>
              <p className="text-sm font-medium text-gray-500 group-hover:text-purple-600 transition-colors">Create New Project</p>
            </CardSpotlight>
          </Link>
        </div>
      </div>
    </div>
  );
}
