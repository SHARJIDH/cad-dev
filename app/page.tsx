"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Wand2, ArrowRight, Layers, Sparkles, Zap, Building2, Palette, BrainCircuit } from "lucide-react";
import { Spotlight } from "@/components/ui/spotlight";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { MovingBorder } from "@/components/ui/moving-border";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { Meteors } from "@/components/ui/meteors";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs";
import {
  Navbar,
  NavBody,
  NavItems,
  NavbarButton,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
} from "@/components/ui/resizable-navbar";
import { useState } from "react";

const landingNavItems = [
  { name: "Features", link: "#features" },
  { name: "Pricing", link: "#pricing" },
  { name: "Contact", link: "#contact" },
];

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* ========== Landing Navbar ========== */}
      <Navbar className="top-0">
        <NavBody className="border border-gray-200/60">
          <Link
            href="/"
            className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Wand2 className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-purple-600 via-violet-500 to-blue-600 bg-clip-text text-transparent tracking-tight">
              ArcForge
            </span>
          </Link>

          <NavItems items={landingNavItems} />

          <div className="relative z-20 flex items-center gap-2">
            <SignedIn>
              <NavbarButton as="button" variant="gradient" className="!bg-gradient-to-r !from-purple-600 !to-blue-600" onClick={() => window.location.href = '/dashboard'}>
                Dashboard
              </NavbarButton>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="redirect">
                <NavbarButton as="button" variant="secondary">Login</NavbarButton>
              </SignInButton>
              <SignUpButton mode="redirect">
                <NavbarButton as="button" variant="gradient" className="!bg-gradient-to-r !from-purple-600 !to-blue-600">
                  Sign Up
                </NavbarButton>
              </SignUpButton>
            </SignedOut>
          </div>
        </NavBody>

        {/* Mobile */}
        <MobileNav className="!bg-white/90">
          <MobileNavHeader>
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-md">
                <Wand2 className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold bg-gradient-to-r from-purple-600 via-violet-500 to-blue-600 bg-clip-text text-transparent tracking-tight">
                ArcForge
              </span>
            </Link>
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>
          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            className="!bg-white"
          >
            {landingNavItems.map((item) => (
              <a
                key={item.link}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                {item.name}
              </a>
            ))}
            <SignedOut>
              <SignInButton mode="redirect">
                <button className="w-full mt-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-700">
                  Login
                </button>
              </SignInButton>
              <SignUpButton mode="redirect">
                <button className="w-full px-4 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="w-full px-4 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center"
              >
                Go to Dashboard
              </Link>
            </SignedIn>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      {/* ========== Hero Section ========== */}
      <section className="relative px-4 md:px-6 pt-28 pb-16 md:pt-36 md:pb-24 lg:pt-44 lg:pb-32 overflow-hidden">
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="rgba(147, 51, 234, 0.15)"
        />
        <div className="absolute inset-0 bg-dot-purple\/10 -z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white -z-10" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 text-sm font-medium mb-8 border border-purple-200/50 shadow-sm">
            <Sparkles className="h-4 w-4" />
            <span>Introducing ArcForge</span>
            <ArrowRight className="h-3 w-3" />
          </div>

          {/* Animated Title */}
          <TextGenerateEffect
            words="Forge Ideas Into Architecture"
            className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-violet-500 to-blue-600 bg-clip-text text-transparent pb-2"
          />

          <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto mt-6 leading-relaxed">
            Transform your architectural ideas into reality with intelligent AI tools.
            Create stunning floor plans, 3D models, and design documents in minutes.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <SignedIn>
              <Link href="/cad-generator">
                <MovingBorder
                  as="div"
                  duration={3000}
                  className="bg-white text-gray-800 font-semibold text-base"
                >
                  <Wand2 className="h-5 w-5 text-purple-600" />
                  Start Designing
                </MovingBorder>
              </Link>
              <Link href="/projects">
                <Button variant="outline" size="lg" className="gap-2 border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 px-8 rounded-xl transition-all">
                  <Layers className="h-5 w-5" />
                  View Projects
                </Button>
              </Link>
            </SignedIn>
            <SignedOut>
              <SignUpButton mode="redirect">
                <MovingBorder
                  as="button"
                  duration={3000}
                  className="bg-white text-gray-800 font-semibold text-base"
                >
                  <Wand2 className="h-5 w-5 text-purple-600" />
                  Get Started Free
                </MovingBorder>
              </SignUpButton>
              <SignInButton mode="redirect">
                <Button variant="outline" size="lg" className="gap-2 border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 px-8 rounded-xl transition-all">
                  <ArrowRight className="h-5 w-5" />
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-16">
            {[
              { value: "10K+", label: "Designs Created" },
              { value: "50%", label: "Faster Workflow" },
              { value: "99%", label: "Client Satisfaction" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== Features Section ========== */}
      <section id="features" className="px-4 md:px-6 py-20 bg-gradient-to-b from-white to-gray-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Design
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Everything you need to bring your architectural visions to life
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: BrainCircuit,
                title: "AI-Powered Generation",
                description: "Describe your vision and let AI generate professional floor plans and 3D models instantly.",
                gradient: "from-purple-500 to-violet-500",
              },
              {
                icon: Building2,
                title: "3D CAD Modeling",
                description: "Create detailed architectural models with real-time 3D visualization and editing.",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                icon: Palette,
                title: "Smart Design Tools",
                description: "Intelligent design tools that understand architectural patterns and best practices.",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                icon: Sparkles,
                title: "Real-Time Collaboration",
                description: "Work together with your team in real-time with built-in version control.",
                gradient: "from-amber-500 to-orange-500",
              },
              {
                icon: Zap,
                title: "Instant Analytics",
                description: "Get instant insights on space efficiency, sustainability, and compliance.",
                gradient: "from-green-500 to-emerald-500",
              },
              {
                icon: Layers,
                title: "Multi-Format Export",
                description: "Export your designs in any format — DWG, OBJ, PDF, and more.",
                gradient: "from-indigo-500 to-blue-500",
              },
            ].map((feature, i) => (
              <CardSpotlight key={i} className="p-6 bg-white border-gray-100 hover:shadow-xl transition-all duration-500 group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </CardSpotlight>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA Section ========== */}
      <section id="contact" className="px-4 md:px-6 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600" />
        <div className="absolute inset-0 bg-grid-white\/10" />

        <div className="absolute inset-0 overflow-hidden">
          <Meteors number={15} className="before:from-white" />
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to revolutionize your design workflow?
          </h2>
          <p className="text-purple-100 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of architects and designers using AI to create amazing spaces.
          </p>
          <SignedIn>
            <Link href="/dashboard">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-8 rounded-xl shadow-xl shadow-purple-900/30 gap-2">
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </SignedIn>
          <SignedOut>
            <SignUpButton mode="redirect">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-8 rounded-xl shadow-xl shadow-purple-900/30 gap-2">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </SignUpButton>
          </SignedOut>
        </div>
      </section>

      {/* ========== Footer ========== */}
      <footer className="px-4 md:px-6 py-12 bg-gray-50 border-t border-gray-200/60">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <Wand2 className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold bg-gradient-to-r from-purple-600 via-violet-500 to-blue-600 bg-clip-text text-transparent tracking-tight">
                ArcForge
              </span>
            </div>
            <div className="flex items-center gap-8 text-sm text-gray-500">
              <a href="#features" className="hover:text-purple-600 transition-colors">Features</a>
              <a href="#pricing" className="hover:text-purple-600 transition-colors">Pricing</a>
              <a href="#contact" className="hover:text-purple-600 transition-colors">Contact</a>
            </div>
            <p className="text-sm text-gray-400">
              © 2026 ArcForge. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
