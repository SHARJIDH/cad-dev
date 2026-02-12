"use client";

import { useState } from "react";
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
    PaletteIcon,
    Save,
    User,
    Sparkles,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useSettings } from "@/lib/store";

export default function SettingsPage() {
    const { settings, updateSettings } = useSettings();
    const [activeTab, setActiveTab] = useState("account");

    // Local state synced from store
    const [profile, setProfile] = useState(settings.profile);
    const [notifications, setNotifications] = useState(settings.notifications);
    const [aiSettings, setAiSettings] = useState(settings.ai);

    // Appearance settings (not persisted since we force light theme)
    const [appearance, setAppearance] = useState({
        theme: "light",
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
        <div className="container mx-auto py-6 px-4 md:px-6 bg-gradient-to-br from-purple-50/30 via-white to-blue-50/30 min-h-screen">
            <div className="flex flex-col space-y-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-6 w-6 text-purple-600" />
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Settings</h1>
                    </div>
                    <p className="text-gray-600 text-lg">
                        Manage your account preferences and customize your experience
                    </p>
                </div>

                <Tabs
                    defaultValue={activeTab}
                    onValueChange={setActiveTab}
                    className="space-y-6"
                >
                    <TabsList className="grid grid-cols-4 w-full max-w-2xl bg-white border-2 p-1">
                        <TabsTrigger value="account" className="gap-2">
                            <User className="h-4 w-4" />
                            <span className="hidden sm:inline">Account</span>
                        </TabsTrigger>
                        <TabsTrigger value="appearance" className="gap-2">
                            <PaletteIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">Appearance</span>
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="gap-2">
                            <BellRing className="h-4 w-4" />
                            <span className="hidden sm:inline">Notifications</span>
                        </TabsTrigger>
                        <TabsTrigger value="ai" className="gap-2">
                            <BrainCircuit className="h-4 w-4" />
                            <span className="hidden sm:inline">AI Settings</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Account Settings */}
                    <TabsContent value="account" className="space-y-6">
                        <Card className="border-2 border-gray-100 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
                                <CardTitle className="flex items-center gap-2 text-purple-900">
                                    <User className="h-5 w-5" />
                                    Profile Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="flex items-center gap-4 pb-4">
                                    <div className="relative">
                                        <Avatar className="h-20 w-20 border-4 border-purple-200">
                                            <AvatarImage src="/placeholder.svg?height=80&width=80" />
                                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-2xl">AC</AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <Button variant="outline" size="sm" className="border-2 hover:bg-purple-50 hover:border-purple-300">
                                        Change Photo
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-gray-700 font-semibold">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={profile.name}
                                        onChange={(e) =>
                                            setProfile({
                                                ...profile,
                                                name: e.target.value,
                                            })
                                        }
                                        className="border-2 focus:border-purple-300"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-gray-700 font-semibold">Email</Label>
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
                                        className="border-2 focus:border-purple-300"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="company" className="text-gray-700 font-semibold">Company</Label>
                                    <Input
                                        id="company"
                                        value={profile.company}
                                        onChange={(e) =>
                                            setProfile({
                                                ...profile,
                                                company: e.target.value,
                                            })
                                        }
                                        className="border-2 focus:border-purple-300"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bio" className="text-gray-700 font-semibold">Bio</Label>
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
                                        className="border-2 focus:border-purple-300"
                                    />
                                </div>

                                <div className="pt-2">
                                    <Button onClick={handleSave} className="shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all">
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Changes
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Appearance Settings */}
                    <TabsContent value="appearance" className="space-y-6">
                        <Card className="border-2 border-gray-100 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
                                <CardTitle className="flex items-center gap-2 text-purple-900">
                                    <PaletteIcon className="h-5 w-5" />
                                    Display Options
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="space-y-2">
                                    <Label htmlFor="theme" className="text-gray-700 font-semibold">Theme</Label>
                                    <Select
                                        value={appearance.theme}
                                        onValueChange={(value) =>
                                            setAppearance({
                                                ...appearance,
                                                theme: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger id="theme" className="border-2 focus:border-purple-300">
                                            <SelectValue placeholder="Select theme" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="light">
                                                Light
                                            </SelectItem>
                                            <SelectItem value="dark">
                                                Dark
                                            </SelectItem>
                                            <SelectItem value="system">
                                                System Default
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-lg border-2 border-gray-100 hover:border-purple-200 transition-colors">
                                    <div className="space-y-0.5">
                                        <Label className="text-gray-700 font-semibold">Reduced Motion</Label>
                                        <p className="text-sm text-gray-600">
                                            Minimize animations throughout the
                                            interface
                                        </p>
                                    </div>
                                    <Switch
                                        checked={appearance.reducedMotion}
                                        onCheckedChange={(checked) =>
                                            setAppearance({
                                                ...appearance,
                                                reducedMotion: checked,
                                            })
                                        }
                                    />
                                </div>

                                <div className="pt-2">
                                    <Button onClick={handleSave} className="shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all">
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Changes
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Notification Settings */}
                    <TabsContent value="notifications" className="space-y-6">
                        <Card className="border-2 border-gray-100 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
                                <CardTitle className="flex items-center gap-2 text-purple-900">
                                    <BellRing className="h-5 w-5" />
                                    Notification Preferences
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-6">
                                <div className="flex items-center justify-between p-4 rounded-lg border-2 border-gray-100 hover:border-purple-200 transition-colors">
                                    <div className="space-y-0.5">
                                        <Label className="text-gray-700 font-semibold">Email Notifications</Label>
                                        <p className="text-sm text-gray-600">
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

                                <div className="flex items-center justify-between p-4 rounded-lg border-2 border-gray-100 hover:border-purple-200 transition-colors">
                                    <div className="space-y-0.5">
                                        <Label className="text-gray-700 font-semibold">In-App Notifications</Label>
                                        <p className="text-sm text-gray-600">
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

                                <div className="flex items-center justify-between p-4 rounded-lg border-2 border-gray-100 hover:border-purple-200 transition-colors">
                                    <div className="space-y-0.5">
                                        <Label className="text-gray-700 font-semibold">Project Updates</Label>
                                        <p className="text-sm text-gray-600">
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

                                <div className="flex items-center justify-between p-4 rounded-lg border-2 border-gray-100 hover:border-purple-200 transition-colors">
                                    <div className="space-y-0.5">
                                        <Label className="text-gray-700 font-semibold">Team Messages</Label>
                                        <p className="text-sm text-gray-600">
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
                                    <Button onClick={handleSave} className="shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all">
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Changes
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* AI Settings */}
                    <TabsContent value="ai" className="space-y-6">
                        <Card className="border-2 border-gray-100 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
                                <CardTitle className="flex items-center gap-2 text-purple-900">
                                    <BrainCircuit className="h-5 w-5" />
                                    AI Preferences
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="space-y-2">
                                    <Label htmlFor="model" className="text-gray-700 font-semibold">AI Model</Label>
                                    <Select
                                        value={aiSettings.model}
                                        onValueChange={(value) =>
                                            setAiSettings({
                                                ...aiSettings,
                                                model: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger id="model" className="border-2 focus:border-purple-300">
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
                                    <p className="text-sm text-gray-600">
                                        Higher tier models use more AI credits
                                        but provide more detailed suggestions
                                    </p>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-lg border-2 border-gray-100 hover:border-purple-200 transition-colors">
                                    <div className="space-y-0.5">
                                        <Label className="text-gray-700 font-semibold">Auto-Suggestions</Label>
                                        <p className="text-sm text-gray-600">
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

                                <div className="flex items-center justify-between p-4 rounded-lg border-2 border-gray-100 hover:border-purple-200 transition-colors">
                                    <div className="space-y-0.5">
                                        <Label className="text-gray-700 font-semibold">Sustainability Checker</Label>
                                        <p className="text-sm text-gray-600">
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
                                    <Button onClick={handleSave} className="shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all">
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
