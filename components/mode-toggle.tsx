"use client"

import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function ModeToggle({ mode = "default" }: { mode?: "default" | "item" }) {
  const { setTheme, theme } = useTheme()

  if (mode === "item") {
    return (
      <>
        <DropdownMenuItem onClick={() => setTheme("light")} className="gap-2">
          <Sun className="h-4 w-4" />
          Light Mode
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="gap-2">
          <Moon className="h-4 w-4" />
          Dark Mode
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="gap-2">
          <Monitor className="h-4 w-4" />
          System
        </DropdownMenuItem>
      </>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="h-9 w-9 border-orange-200 dark:border-dark-border hover:bg-orange-50 dark:hover:bg-dark-accent hover:border-orange-300 dark:hover:border-orange-500/30"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all text-orange-500 dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all text-orange-400 dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="border-orange-200 dark:border-dark-border dark:bg-dark-surface">
        <DropdownMenuItem 
          onClick={() => setTheme("light")} 
          className="gap-2 cursor-pointer focus:bg-orange-50 dark:focus:bg-dark-accent"
        >
          <Sun className="h-4 w-4 text-orange-500" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")} 
          className="gap-2 cursor-pointer focus:bg-orange-50 dark:focus:bg-dark-accent"
        >
          <Moon className="h-4 w-4 text-orange-400" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")} 
          className="gap-2 cursor-pointer focus:bg-orange-50 dark:focus:bg-dark-accent"
        >
          <Monitor className="h-4 w-4 text-gray-500" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

