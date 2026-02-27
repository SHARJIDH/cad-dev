import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/projects - Get all projects for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database or create if doesn't exist
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      // Create user if doesn't exist
      const clerkUser = await auth();
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: clerkUser.sessionClaims?.email as string || `${userId}@unknown.com`,
          name: clerkUser.sessionClaims?.name as string || undefined,
          imageUrl: clerkUser.sessionClaims?.image_url as string || undefined,
        },
      });
    }

    // Get all projects where user is owner or member
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: user.id },
          {
            members: {
              some: {
                userId: user.id,
              },
            },
          },
        ],
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                imageUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: true,
            versions: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, isPublic, thumbnailUrl } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      const clerkUser = await auth();
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: clerkUser.sessionClaims?.email as string || `${userId}@unknown.com`,
          name: clerkUser.sessionClaims?.name as string || undefined,
          imageUrl: clerkUser.sessionClaims?.image_url as string || undefined,
        },
      });
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        name,
        description,
        isPublic: isPublic ?? false,
        ...(thumbnailUrl ? { thumbnailUrl } : {}),
        ownerId: user.id,
        members: {
          create: {
            userId: user.id,
            role: 'owner',
          },
        },
        activities: {
          create: {
            userId: user.id,
            action: 'created',
            description: `Created project "${name}"`,
          },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
