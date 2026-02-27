"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    BellRing,
    BrainCircuit,
    Lock,
    Save,
    User,
    Sparkles,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useSettings } from "@/lib/store";

export default function SettingsPage() {
    const { settings, updateSettings } = useSettings();
    const { setTheme, theme } = useTheme();
    const searchParams = useSearchParams();
    const { user } = useUser();
    const tabParam = searchParams.get('tab');
    const [activeTab, setActiveTab] = useState(tabParam || "account");

    // Initialize profile from Clerk user
    const [profile, setProfile] = useState(settings.profile);
    const [notifications, setNotifications] = useState(settings.notifications);
    const [aiSettings, setAiSettings] = useState(settings.ai);
    const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);

    // Load Clerk user data into profile
    useEffect(() => {
        if (user) {
            setProfile({
                name: user.fullName || user.firstName || settings.profile.name,
                email: user.emailAddresses[0]?.emailAddress || settings.profile.email,
                company: settings.profile.company,
                bio: settings.profile.bio,
            });
        }
    }, [user]);

    // Appearance settings
    const [appearance, setAppearance] = useState({
        theme: theme || "system",
        reducedMotion: false,
    });

    // Handle form submission — persist to store
    const handleSave = () => {
        updateSettings({
            profile,
            notifications,
            ai: aiSettings,
        });
        toast({
            title: "Settings saved",
            description: "Your preferences have been updated and will persist across sessions.",
        });
    };

    return (
        <div className="container mx-auto py-6 px-4 md:px-6 bg-gradient-to-br from-orange-50/30 via-background to-amber-50/30 dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg min-h-screen transition-colors duration-300">
            <div className="flex flex-col space-y-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-6 w-6 text-orange-500" />
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">Settings</h1>
                    </div>
                    <p className="text-muted-foreground text-lg">
                        Manage your account preferences and customize your experience
                    </p>
                </div>

                <Tabs
                    defaultValue={activeTab}
                    onValueChange={setActiveTab}
                    className="space-y-6"
                >
                    <TabsList className="grid grid-cols-3 w-full max-w-2xl bg-card dark:bg-dark-surface border-2 border-border p-1">
                        <TabsTrigger value="account" className="gap-2 data-[state=active]:bg-orange-50 dark:data-[state=active]:bg-dark-accent data-[state=active]:text-orange-600 dark:data-[state=active]:text-orange-400">
                            <User className="h-4 w-4" />
                            <span className="hidden sm:inline">Account</span>
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="gap-2 data-[state=active]:bg-orange-50 dark:data-[state=active]:bg-dark-accent data-[state=active]:text-orange-600 dark:data-[state=active]:text-orange-400">
                            <BellRing className="h-4 w-4" />
                            <span className="hidden sm:inline">Notifications</span>
                        </TabsTrigger>
                        <TabsTrigger value="ai" className="gap-2 data-[state=active]:bg-orange-50 dark:data-[state=active]:bg-dark-accent data-[state=active]:text-orange-600 dark:data-[state=active]:text-orange-400">
                            <BrainCircuit className="h-4 w-4" />
                            <span className="hidden sm:inline">AI Settings</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Account Settings */}
                    <TabsContent value="account" className="space-y-6">
                        <Card className="border-2 border-border shadow-lg dark:bg-dark-surface">
                            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-dark-accent dark:to-dark-surface border-b border-border">
                                <CardTitle className="flex items-center gap-2 text-foreground">
                                    <User className="h-5 w-5" />
                                    Profile Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="flex items-center gap-4 pb-4">
                                    <div className="relative">
                                        <Avatar className="h-20 w-20 border-4 border-orange-200 dark:border-dark-border">
                                            <AvatarImage 
                                                src={uploadedPhotoUrl || user?.imageUrl || "/placeholder.svg?height=80&width=80"} 
                                                alt={profile.name}
                                            />
                                            <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-500 text-white text-2xl">
                                                {profile.name ? profile.name.split(' ').map(n => n[0]).join('') : 'AC'}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <div>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="border-2 hover:bg-orange-50 dark:hover:bg-dark-accent hover:border-orange-300 dark:hover:border-orange-500/50"
                                            onClick={() => document.getElementById('photo-upload')?.click()}
                                        >
                                            {uploadedPhotoUrl ? 'Change Photo' : 'Upload Photo'}
                                        </Button>
                                        <input
                                            id="photo-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onload = (event) => {
                                                        const result = event.target?.result as string;
                                                        setUploadedPhotoUrl(result);
                                                        toast({ title: "Photo uploaded", description: "Your profile photo has been updated." });
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-foreground font-semibold">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={profile.name}
                                        onChange={(e) =>
                                            setProfile({
                                                ...profile,
                                                name: e.target.value,
                                            })
                                        }
                                        className="border-2 focus:border-orange-300 dark:focus:border-orange-500/50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-foreground font-semibold">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={profile.email}
                                        onChange={(e) =>
                                            setProfile({
                                                ...profile,
                                                email: e.target.value,
                                            })
                                        }
                                        className="border-2 focus:border-orange-300 dark:focus:border-orange-500/50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="company" className="text-foreground font-semibold">Company</Label>
                                    <Input
                                        id="company"
                                        value={profile.company}
                                        onChange={(e) =>
                                            setProfile({
                                                ...profile,
                                                company: e.target.value,
                                            })
                                        }
                                        className="border-2 focus:border-orange-300 dark:focus:border-orange-500/50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bio" className="text-foreground font-semibold">Bio</Label>
                                    <Textarea
                                        id="bio"
                                        rows={3}
                                        value={profile.bio}
                                        onChange={(e) =>
                                            setProfile({
                                                ...profile,
                                                bio: e.target.value,
                                            })
                                        }
                                        className="border-2 focus:border-orange-300 dark:focus:border-orange-500/50"
                                    />
                                </div>

                                <div className="pt-2">
                                    <Button onClick={handleSave} className="bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all">
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Changes
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Notification Settings */}
                    <TabsContent value="notifications" className="space-y-6">
                        <Card className="border-2 border-border shadow-lg dark:bg-dark-surface">
                            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-dark-accent dark:to-dark-surface border-b border-border">
                                <CardTitle className="flex items-center gap-2 text-foreground">
                                    <BellRing className="h-5 w-5" />
                                    Notification Preferences
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-6">
                                <div className="flex items-center justify-between p-4 rounded-lg border-2 border-border hover:border-orange-200 dark:hover:border-orange-500/30 transition-colors">
                                    <div className="space-y-0.5">
                                        <Label className="text-foreground font-semibold">Email Notifications</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Receive updates via email
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notifications.email}
                                        onCheckedChange={(checked) =>
                                            setNotifications({
                                                ...notifications,
                                                email: checked,
                                            })
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-lg border-2 border-border hover:border-orange-200 dark:hover:border-orange-500/30 transition-colors">
                                    <div className="space-y-0.5">
                                        <Label className="text-foreground font-semibold">In-App Notifications</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Show notifications within the
                                            application
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notifications.app}
                                        onCheckedChange={(checked) =>
                                            setNotifications({
                                                ...notifications,
                                                app: checked,
                                            })
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-lg border-2 border-border hover:border-orange-200 dark:hover:border-orange-500/30 transition-colors">
                                    <div className="space-y-0.5">
                                        <Label className="text-foreground font-semibold">Project Updates</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Notifications about changes to your
                                            projects
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notifications.projectUpdates}
                                        onCheckedChange={(checked) =>
                                            setNotifications({
                                                ...notifications,
                                                projectUpdates: checked,
                                            })
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-lg border-2 border-border hover:border-orange-200 dark:hover:border-orange-500/30 transition-colors">
                                    <div className="space-y-0.5">
                                        <Label className="text-foreground font-semibold">Team Messages</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Notifications about team
                                            communications
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notifications.teamMessages}
                                        onCheckedChange={(checked) =>
                                            setNotifications({
                                                ...notifications,
                                                teamMessages: checked,
                                            })
                                        }
                                    />
                                </div>

                                <div className="pt-2">
                                    <Button onClick={handleSave} className="bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all">
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Changes
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* AI Settings */}
                    <TabsContent value="ai" className="space-y-6">
                        <Card className="border-2 border-border shadow-lg dark:bg-dark-surface">
                            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-dark-accent dark:to-dark-surface border-b border-border">
                                <CardTitle className="flex items-center gap-2 text-foreground">
                                    <BrainCircuit className="h-5 w-5" />
                                    AI Preferences
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="space-y-2">
                                    <Label htmlFor="model" className="text-foreground font-semibold">AI Model</Label>
                                    <Select
                                        value={aiSettings.model}
                                        onValueChange={(value) =>
                                            setAiSettings({
                                                ...aiSettings,
                                                model: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger id="model" className="border-2 focus:border-orange-300 dark:focus:border-orange-500/50">
                                            <SelectValue placeholder="Select model" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="basic">
                                                Basic
                                            </SelectItem>
                                            <SelectItem value="standard">
                                                Standard
                                            </SelectItem>
                                            <SelectItem value="professional">
                                                Professional
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-sm text-muted-foreground">
                                        Higher tier models use more AI credits
                                        but provide more detailed suggestions
                                    </p>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-lg border-2 border-border hover:border-orange-200 dark:hover:border-orange-500/30 transition-colors">
                                    <div className="space-y-0.5">
                                        <Label className="text-foreground font-semibold">Auto-Suggestions</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Allow AI to suggest improvements to
                                            your designs
                                        </p>
                                    </div>
                                    <Switch
                                        checked={aiSettings.autoSuggestions}
                                        onCheckedChange={(checked) =>
                                            setAiSettings({
                                                ...aiSettings,
                                                autoSuggestions: checked,
                                            })
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-lg border-2 border-border hover:border-orange-200 dark:hover:border-orange-500/30 transition-colors">
                                    <div className="space-y-0.5">
                                        <Label className="text-foreground font-semibold">Sustainability Checker</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Analyze designs for sustainability
                                            metrics
                                        </p>
                                    </div>
                                    <Switch
                                        checked={aiSettings.sustainabilityCheck}
                                        onCheckedChange={(checked) =>
                                            setAiSettings({
                                                ...aiSettings,
                                                sustainabilityCheck: checked,
                                            })
                                        }
                                    />
                                </div>

                                <div className="pt-2">
                                    <Button onClick={handleSave} className="bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all">
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Changes
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
