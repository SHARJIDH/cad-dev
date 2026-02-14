import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
            {/* Decorative background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-100/20 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-8">
                {/* Logo & branding */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-violet-500 to-blue-600 bg-clip-text text-transparent tracking-tight">
                        ArcForge
                    </h1>
                    <p className="text-gray-500 text-sm">
                        AI-Powered Design Studio
                    </p>
                </div>

                {/* Clerk SignIn component */}
                <SignIn
                    appearance={{
                        elements: {
                            rootBox: "mx-auto",
                            card: "shadow-xl shadow-purple-500/10 border border-purple-100/50",
                            headerTitle: "text-gray-900",
                            headerSubtitle: "text-gray-500",
                            socialButtonsBlockButton:
                                "border-gray-200 hover:bg-purple-50 transition-colors",
                            formButtonPrimary:
                                "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-500/30",
                            footerActionLink:
                                "text-purple-600 hover:text-purple-700",
                            formFieldInput:
                                "border-gray-200 focus:border-purple-400 focus:ring-purple-200",
                        },
                    }}
                />
            </div>
        </div>
    );
}
