import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg transition-colors duration-300">
            {/* Decorative background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200/30 dark:bg-orange-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-200/30 dark:bg-amber-500/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-100/20 dark:bg-orange-500/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-8">
                {/* Logo & branding */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 bg-clip-text text-transparent tracking-tight">
                        ArcForge
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        AI-Powered Design Studio
                    </p>
                </div>

                {/* Clerk SignIn component */}
                <SignIn
                    appearance={{
                        elements: {
                            rootBox: "mx-auto",
                            card: "shadow-xl shadow-orange-500/10 border border-orange-100/50 dark:bg-dark-surface dark:border-dark-border",
                            headerTitle: "text-gray-900 dark:text-white",
                            headerSubtitle: "text-gray-500 dark:text-gray-400",
                            socialButtonsBlockButton:
                                "border-gray-200 dark:border-dark-border hover:bg-orange-50 dark:hover:bg-dark-accent transition-colors dark:text-white",
                            formButtonPrimary:
                                "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/30",
                            footerActionLink:
                                "text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300",
                            formFieldInput:
                                "border-gray-200 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:border-orange-400 focus:ring-orange-200 dark:focus:ring-orange-500/20",
                        },
                    }}
                />
            </div>
        </div>
    );
}
