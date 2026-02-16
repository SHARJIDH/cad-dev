# 🚀 Quick Start Guide

## Part 1: Development Server (Already Working)

### 1. Start the Development Server
```bash
cd /Users/sharjidh/Desktop/cad-prok/cad-dev
npm run dev
```

### 2. Access the Features
Open your browser and navigate to:
```
http://localhost:3000/cad-generator
```

---

## Part 2: Database Setup (New - 5 minutes)

### Step 1: Create Supabase Account
1. Visit [supabase.com](https://supabase.com)
2. Sign up (free)
3. Click "New Project"
4. Choose organization, project name, database password, and region

### Step 2: Get Credentials
From your project dashboard:

**API Settings** (Settings → API):
- Copy `Project URL` 
- Copy `anon` / `public` key

**Database Settings** (Settings → Database):
- Scroll to "Connection string"
- Select "URI" format
- Copy the connection string

### Step 3: Configure Environment
Create/update `.env.local` in project root:

```bash
# Add these three lines
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc....
DATABASE_URL=postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

### Step 4: Initialize Database
Run these commands:

```bash
# Generate Prisma client
npx prisma generate

# Create tables in your database
npx prisma db push
```

You'll see output like:
```
✔ Generated Prisma Client
🚀 Your database is now in sync with your Prisma schema
```

### Step 5: Restart Development Server
```bash
# Stop current server (Ctrl+C)
# Start again
npm run dev
```

---

## Testing the Database Features

### 1. Create a Project
1. Open CAD Generator page
2. Click "New Project" button in the header
3. Fill in project name and description
4. Click "Create Project"

### 2. Generate a Design
1. Type a prompt: "Create a 3-bedroom house"
2. Click "Generate"
3. Messages automatically save to database

### 3. Save Versions
1. After generating, model is auto-saved
2. Make changes and regenerate
3. Each generation creates a new version

### 4. Invite Team Members
1. Click "Invite" button in header
2. Enter email address
3. Select role (Editor or Viewer)
4. Send invite

### 5. View Data (Optional)
Open Prisma Studio to see your data:
```bash
npx prisma studio
```

---

## Verification Checklist

After database setup:

- [ ] No console errors about missing Supabase variables
- [ ] Can create a project from dialog
- [ ] Messages appear in conversation
- [ ] Can invite members
- [ ] Activity feed shows events

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Check `.env.local` exists in project root
- Verify all three variables are set
- Restart dev server: `npm run dev`

### Error: "Schema not found"
- Run `npx prisma db push` again
- Check DATABASE_URL format
- Verify database password

### Connection timeout
- Check Supabase project is active
- Use pooling URL (port 6543, not 5432)

---

## 🎯 Feature Walkthrough

### Feature 1: Streaming Generation
**What to do:**
1. Enter a prompt: "3 bedroom house with open kitchen"
2. Click "Generate"
3. **Watch the progress bar** with stage indicators:
   - 🔍 Interpreting requirements... (0-33%)
   - 🏗️ Generating architectural layout... (33-66%)
   - 🎨 Generating visualization code... (66-100%)
   - ✅ Complete!

**What you'll see:**
- Real-time progress updates
- Agent names displayed
- Room count during generation
- No more 30-second black box!

---

### Feature 2: Iterative Refinement
**What to do:**
1. After generating a design, scroll to the "Refine Design" panel
2. (Optional) Click room badges to lock elements you want to keep
3. Enter a refinement: "Make the living room 20% bigger"
4. Click "Refine Design"
5. Watch the streaming progress again

**What you'll see:**
- Only the living room changes
- Locked rooms stay the same
- Conversation history updates
- Toast notification on success

**Try these refinements:**
- "Add a balcony to the master bedroom"
- "Move the kitchen next to the dining room"
- "Replace the window with a door"
- "Make all bedrooms 15% larger"

---

### Feature 3: Conversation History
**What to do:**
1. Generate a design
2. Scroll down to see "Conversation History" panel
3. Make a refinement
4. Watch the history update

**What you'll see:**
- User messages on the right (blue)
- AI messages on the left (gray)
- Timestamps for each message
- Scrollable history

---

### Feature 4: 2D Floor Plan View
**What to do:**
1. After generating a design, look for the view toggle buttons
2. Click "2D Floor Plan"

**What you'll see:**
- Top-down view of the floor plan
- Room dimensions (width × length)
- Area in m² for each room
- Grid overlay
- North arrow
- Color-coded rooms

**Toggle back:**
- Click "3D View" to return to perspective

---

### Feature 5: Real File Export
**What to do:**
1. After generating a design, click the "Export" button
2. Choose a format from the dropdown

**Available formats:**

**For 3D Software (Blender, SketchUp, etc.):**
- GLTF (.gltf) - Standard format
- GLB (.glb) - Binary format (smaller)
- OBJ (.obj) - Universal format
- STL (.stl) - 3D printing

**For 2D Drawings:**
- SVG Floor Plan - Vector graphics (editable in Illustrator)

**For Developers:**
- JSON Data - Raw model data
- Three.js Code - JavaScript source
- Standalone HTML - Complete viewer

**What you'll see:**
- File downloads automatically
- Toast notification confirming export
- Can open files in external programs

**Test the HTML export:**
1. Export as "Standalone HTML"
2. Open the downloaded file in a browser
3. See your 3D model running standalone!

---

## 💡 Pro Tips

### Lock Multiple Rooms
When refining, lock rooms you want to keep:
1. Click multiple room badges to lock them
2. They'll show a 🔒 icon
3. Refinements won't touch locked rooms

### Save Your Work
Don't forget to save:
1. Click "Save as Project" button (top right)
2. View it later in the Projects page
3. Continue working from where you left off

### Quick Refinement Suggestions
Click any suggestion button to auto-fill:
- "Make the living room 2 meters wider"
- "Add a bathroom between bedroom 1 and 2"
- etc.

### Copy Generated Code
1. Scroll to "Generated Three.js Code" card
2. Click the copy icon
3. Paste into your own project

---

## 🧪 Testing Checklist

Try each feature to verify it works:

- [ ] Generate a design with streaming progress
- [ ] See progress go from 0% → 33% → 66% → 100%
- [ ] View conversation history
- [ ] Lock a room (click badge)
- [ ] Refine the design with locked elements
- [ ] Toggle between 2D and 3D views
- [ ] Export as GLTF and open in viewer
- [ ] Export as SVG and open in browser
- [ ] Export as HTML and run standalone
- [ ] Save as a project

---

## 🐛 Troubleshooting

### "Nothing happens when I click Generate"
- Check browser console for errors
- Ensure Azure API keys are configured in `.env.local`
- Verify the API endpoint is running

### "Progress bar stuck at 0%"
- Check Network tab in DevTools
- Look for SSE connection to `/api/cad-generator-stream`
- Verify no CORS errors

### "Export doesn't download"
- Check browser's download settings
- Try a different export format
- Look for popup blocker warnings

### "2D view is blank"
- Ensure model has rooms with valid dimensions
- Check console for canvas errors
- Try toggling back to 3D and back to 2D

### "Refinement doesn't work"
- Verify you have a generated model first
- Check that refinement prompt is not empty
- Look for streaming errors in console

---

## 📱 Mobile Experience

The interface is responsive but works best on desktop for:
- 3D model interaction
- Multiple panel layout
- Export file downloads

Mobile users can still:
- Generate designs
- View conversation history
- See 2D floor plans
- Make refinements

---

## ⚡ Performance Tips

For best experience:
1. **Use Chrome or Edge** - Best WebGL performance
2. **Close other tabs** - 3D rendering is GPU-intensive
3. **Start small** - Test with 2-3 room designs first
4. **Use 2D view** - Less resource-intensive for planning

---

## 🎓 Learning Path

**Beginner:**
1. Generate a simple 2-room design
2. Toggle to 2D view
3. Export as SVG
4. Save as project

**Intermediate:**
1. Generate a 4-5 room house
2. Lock some rooms
3. Refine with natural language
4. Review conversation history
5. Export as GLTF

**Advanced:**
1. Generate complex multi-story design
2. Use locked elements strategically
3. Make multiple refinements
4. Compare 2D and 3D views
5. Export in multiple formats
6. Integrate exported code into own project

---

## 📚 Next Steps

After trying all features:

1. **Read FEATURES.md** - Detailed documentation
2. **Read IMPLEMENTATION_SUMMARY.md** - Technical details
3. **Experiment** - Try complex prompts and refinements
4. **Integrate** - Use exports in your own projects
5. **Provide Feedback** - Report any issues or suggestions

---

## 🎉 Enjoy!

You now have access to:
- ✅ Streaming generation with progress
- ✅ Natural language refinement
- ✅ Conversation history
- ✅ 2D/3D view toggle
- ✅ Real file exports (9 formats!)

Have fun creating architectural designs with AI! 🏗️✨
