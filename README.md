# DesignForge - AI-Powered CAD & Interior Design Platform

DesignForge is a cutting-edge AI-powered platform that revolutionizes architectural and interior design. Create stunning CAD models, design beautiful interiors, and collaborate with your team using advanced AI assistance. Share your designs publicly with clients and stakeholders effortlessly.

---

## 🌟 What is DesignForge?

DesignForge empowers architects, interior designers, and creative professionals to:
- **Generate CAD models** from text descriptions using AI
- **Design interior spaces** with AI suggestions and real-time visualization
- **Share designs publicly** with one-click public links (no login required)
- **Collaborate in real-time** with team members
- **View in AR** - See your designs in real-world spaces using QR codes
- **Export and iterate** - Download designs and refine them intelligently
- **Estimate costs** - Get instant cost breakdowns for generated designs
- **Dark mode** - Full dark/light theme support across all pages

---

## 🚀 Key Features

- **AI-Powered CAD Generation:** Describe your vision and let AI generate professional CAD models instantly
- **Interior Design Studio:** Create, visualize, and refine interior spaces with AI suggestions (fresh or from existing models)
- **3D Model Visualization:** Interactive 3D viewer with OrbitControls for seamless exploration
- **2D Floor Plans:** Toggle between 3D and 2D top/front/side views of your designs
- **Public Link Sharing:** Share completed designs with anyone using secure public links
- **AR Viewer with QR Codes:** Visualize models in augmented reality via generated QR codes
- **Real-Time Collaboration:** Invite team members and work together on projects
- **Multi-modal Input:** Support for text, voice, sketch, and image-based design descriptions
- **Project Management:** Organize, track, and manage all your design projects
- **Save & Continue Flow:** Generate a model, save it, and continue working without interruption
- **Cost Estimator:** Get instant cost breakdowns for rooms, materials, and construction
- **Code Compliance Checker:** Verify designs against building codes
- **Speech-to-Design:** Describe your design using voice input
- **One-Click Export:** Download your designs in multiple formats
- **Dark Mode:** Full dark/light theme toggle across all pages
- **Walkthrough Viewer:** Explore designs with an immersive walkthrough experience

## 🛠 Tech Stack

- **Framework:** Next.js 15.2+ with TypeScript
- **Frontend:** React 19 with TypeScript, Tailwind CSS
- **UI Components:** Shadcn UI (Radix primitives) with Lucide React icons
- **3D Visualization:** Three.js with React Three Fiber & Drei
- **Animations:** Framer Motion
- **Charts:** Recharts
- **Database:** Prisma ORM with Supabase (PostgreSQL)
- **Authentication:** Clerk
- **AI Integration:** OpenAI SDK, Azure OpenAI, Azure Cognitive Services, multi-agent orchestration
- **Speech:** Microsoft Cognitive Services Speech SDK
- **Forms:** React Hook Form with Zod validation
- **Notifications:** Sonner (toast)
- **Theming:** next-themes (dark/light mode)
- **Deployment Ready:** Vercel-optimized

## 🚦 Getting Started

### Prerequisites

- Node.js (v18+) and npm
- Git
- Supabase account (or local PostgreSQL)
- Clerk account (for authentication)

### Quick Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/designforge.git
cd cad-dev
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the root directory with your configuration:

```env
# App Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Database
DATABASE_URL=your_database_url

# AI Configuration
AZURE_OPENAI_KEY=your_azure_openai_key
OPENAI_API_KEY=your_openai_key

# Optional: Azure Cognitive Services
AZURE_SPEECH_KEY=your_speech_key
AZURE_SPEECH_REGION=your_region
```

4. Run database migrations:

```bash
npx prisma migrate dev
```

5. Start the development server:

```bash
npm run dev
```

6. Visit [http://localhost:3000](http://localhost:3000)

### 📋 Setup Documentation

For detailed setup instructions, see [SETUP.md](./SETUP.md)

## ⚙️ Configuration

### Environment Setup

All configuration is done through `.env.local`. Make sure to set up:

- **Database:** Supabase PostgreSQL connection
- **Authentication:** Clerk API keys
- **AI:** OpenAI and/or Azure OpenAI keys
- **Frontend:** Public Supabase URL and Anon key

### Database Schema

The project uses Prisma ORM with the following key models:

- **Project** - Design projects created by users
- **ConversationMessage** - Conversation history and design iterations
- **ProjectVersion** - Project version tracking with model data
- **ProjectMember** - Team collaboration roles
- **ProjectActivity** - Activity feed for projects
- **Invite** - Share designs with collaborators

### Customization

Explore the source code structure:
- `app/` - Next.js pages and app router
- `components/` - Reusable React components
- `services/` - AI agent orchestration and business logic
- `hooks/` - Custom React hooks
- `lib/` - Utilities and helpers
- `types/` - TypeScript type definitions
- `prisma/` - Database schema and migrations

## 📂 Project Structure

```
├── app/                              # Next.js app router and pages
│   ├── page.tsx                      # Landing page
│   ├── layout.tsx                    # Root layout with providers
│   ├── globals.css                   # Global styles
│   ├── dashboard/                    # User dashboard
│   ├── projects/                     # Projects listing
│   ├── project/[id]/                 # Shared project viewer
│   │   └── public/                   # Public sharing page
│   ├── cad-generator/                # CAD design workspace
│   ├── interior-designer/            # Interior design studio
│   ├── ar-viewer/                    # AR visualization
│   ├── team/                         # Team management
│   ├── settings/                     # User settings
│   ├── analytics/                    # Usage analytics
│   ├── sign-in/                      # Clerk sign-in page
│   ├── sign-up/                      # Clerk sign-up page
│   ├── cad-test/                     # CAD testing sandbox
│   ├── invite/
│   │   └── [token]/                  # Invitation acceptance (by token)
│   └── api/                          # API routes
│       ├── projects/                 # Project CRUD & sub-resources
│       │   └── [id]/
│       │       ├── messages/         # Conversation messages
│       │       ├── versions/         # Version snapshots
│       │       ├── activities/       # Activity feed
│       │       ├── invite/           # Team invitations
│       │       └── public/           # Public project access
│       ├── cad-generator/            # CAD generation endpoint
│       ├── cad-generator-stream/     # Streaming CAD generation
│       ├── cad-refine/               # Model refinement
│       ├── interior-design/          # Interior design generation
│       ├── multimodal-processor/     # Image/audio processing
│       ├── speech-to-text/           # Voice input processing
│       ├── ar-session/               # AR session management
│       ├── invite/                   # Invitation handling
│       └── users/                    # User profile sync (Clerk webhook)
├── components/                       # Reusable React components
│   ├── ui/                           # Shadcn UI components (~60 files)
│   ├── navbar.tsx                    # Navigation bar
│   ├── layout-shell.tsx              # App shell layout
│   ├── cad-model-viewer.tsx          # 3D model viewer (Three.js)
│   ├── floor-plan-2d.tsx             # 2D floor plan views
│   ├── visualization-3d.tsx          # 3D visualization component
│   ├── design-canvas.tsx             # Design workspace canvas
│   ├── design-controls.tsx           # Design control panel
│   ├── design-history.tsx            # Design version history
│   ├── input-panel.tsx               # Multi-modal input panel
│   ├── generation-progress.tsx       # Generation progress indicator
│   ├── save-project-modal.tsx        # Save project dialog (state-preserving)
│   ├── create-project-dialog.tsx     # New project creation
│   ├── invite-member-dialog.tsx      # Team invite dialog
│   ├── project-header.tsx            # Project page header
│   ├── project-members-list.tsx      # Project team members
│   ├── activity-feed.tsx             # Project activity feed
│   ├── cost-estimator.tsx            # Cost breakdown calculator
│   ├── code-compliance-checker.tsx   # Building code checker
│   ├── export-button.tsx             # Multi-format export
│   ├── ar-qr-code.tsx               # AR QR code generator
│   ├── view-mode-toggle.tsx          # 3D/2D view switcher
│   ├── ai-suggestions.tsx            # AI design suggestions
│   ├── agent-feedback.tsx            # Agent feedback display
│   ├── enhanced-room-overview.tsx    # Detailed room overview
│   ├── cad-prompt-examples.tsx       # Prompt example suggestions
│   ├── conversation-history.tsx      # Chat history panel
│   ├── refinement-panel.tsx          # Design refinement controls
│   ├── walkthrough-viewer-simple-v2.tsx  # Walkthrough experience
│   ├── voice-input.tsx               # Voice input component
│   ├── multimodal-input.tsx          # Multi-modal input handler
│   ├── theme-provider.tsx            # Dark/light mode provider
│   ├── mode-toggle.tsx               # Theme toggle button
│   ├── clerk-provider-wrapper.tsx    # Clerk auth provider wrapper
│   ├── sign-up-form.tsx              # Custom sign-up form
│   └── providers.tsx                 # App-level providers
├── hooks/                            # Custom React hooks
│   ├── use-project.ts               # Single project data & actions
│   ├── use-projects.ts              # Project listing & CRUD
│   ├── use-current-model.ts         # Persistent model state
│   ├── use-presence.ts              # Real-time presence
│   ├── use-user-profile.ts          # User profile data
│   ├── use-mobile.tsx               # Mobile detection
│   └── use-toast.ts                 # Toast notifications
├── lib/                              # Utilities and helpers
│   ├── prisma.ts                     # Prisma client
│   ├── supabase.ts                   # Supabase client
│   ├── store.tsx                     # State management (localStorage)
│   ├── utils.ts                      # Helper functions
│   ├── audio-utils.ts               # Audio processing utilities
│   ├── thumbnail-utils.ts           # Project thumbnail generation
│   └── email-service.ts             # Email sending service
├── services/                         # Business logic and AI agents
│   ├── agent-orchestrator.ts         # Multi-agent coordination
│   ├── streaming-orchestrator.ts     # Streaming generation pipeline
│   ├── llm-service.ts               # Language model integration
│   ├── azure-service.ts             # Azure Cognitive Services
│   ├── multimodal-processor.ts       # Image/audio processing
│   ├── export-service.ts            # Design export formats
│   └── agents/                       # Individual AI agents
│       ├── base-agent.ts            # Base agent class
│       ├── agent-config.ts          # Agent configuration
│       ├── interpreter-agent.ts     # Prompt interpretation
│       ├── designer-agent.ts        # Design generation
│       └── renderer-agent.ts        # Rendering pipeline
├── types/                            # TypeScript type definitions
│   ├── database.ts                   # Database model types
│   ├── generation.ts                 # Generation pipeline types
│   └── model-viewer.d.ts            # Three.js type declarations
├── prisma/                           # Database schema
│   ├── schema.prisma                 # Prisma data model
│   └── migrations/                   # Database migrations
├── middleware.ts                      # Next.js middleware (Clerk auth)
├── next.config.mjs                    # Next.js configuration
├── tailwind.config.ts                 # Tailwind CSS configuration
├── tsconfig.json                      # TypeScript configuration
├── components.json                    # Shadcn UI configuration
├── vercel.json                        # Vercel deployment settings
├── postcss.config.mjs                 # PostCSS configuration
├── public/                           # Static assets
└── styles/                           # Global CSS and Tailwind config
```

## 📃 Main Pages

| Page | Path | Description |
|------|------|-------------|
| Landing | `/` | Hero, features, and call-to-action |
| Dashboard | `/dashboard` | User's project hub and overview |
| Projects | `/projects` | Browse and manage all projects |
| CAD Generator | `/cad-generator` | AI-powered CAD design workspace |
| Interior Designer | `/interior-designer` | Interior design studio (fresh or from existing model) |
| Project Viewer | `/project/[id]` | Public sharable project view |
| AR Viewer | `/ar-viewer` | Augmented reality visualization |
| Team | `/team` | Manage team members and invites |
| Settings | `/settings` | User preferences and account |
| Analytics | `/analytics` | Usage and project statistics |
| Sign In | `/sign-in` | Clerk authentication page |
| Sign Up | `/sign-up` | Clerk registration page |
| Invite | `/invite/[token]` | Team invitation acceptance |

## 🌳 Development Workflow

### Running Locally

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Building for Production

```bash
# Create an optimized build (includes prisma generate)
npm run build

# Start production server
npm start
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production (prisma generate + next build)
npm start            # Start production server
npm run lint         # Run ESLint
```

### Git Workflow

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes and commit
git commit -m "feat: add your feature description"

# Push to your fork
git push origin feature/your-feature-name

# Open a pull request on GitHub
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)

DesignForge is optimized for Vercel:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Environment Variables for Production

Set the following in your Vercel project settings:
- All variables from `.env.local`
- Ensure `NEXT_PUBLIC_*` variables are set as public

### Custom Deployment

For other hosting providers, ensure:
- Node.js 18+ is available
- All environment variables are configured
- Database migrations are run post-deployment
- Build command: `npm run build`
- Start command: `npm start`

## 📚 Additional Resources

- [SETUP.md](./SETUP.md) - Detailed setup guide
- [QUICKSTART.md](./QUICKSTART.md) - Quick start guide
- [FEATURES.md](./FEATURES.md) - Complete feature documentation
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Database configuration
- [DATABASE_FIX.md](./DATABASE_FIX.md) - Database troubleshooting
- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - Vercel deployment guide

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

For major changes, please open an issue first to discuss your ideas.

## 🙋 Support

- Open an issue on GitHub for bug reports
- Start a discussion for feature requests
- Check existing documentation before asking questions

---

**Built with ❤️ for designers and architects**

Made with Next.js, Tailwind CSS, and AI magic ✨

