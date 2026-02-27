import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// POST /api/projects/[id]/versions - Create a new version
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, modelData, thumbnailUrl } = body;

    if (!modelData) {
      return NextResponse.json(
        { error: 'Model data is required' },
        { status: 400 }
      );
    }

    const { id } = await params;
    // Check if user has access to project
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        members: true,
        versions: {
          orderBy: {
            version: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const member = project.members.find((m: any) => m.userId === user.id);
    const canEdit = project.ownerId === user.id || member?.role === 'editor' || member?.role === 'owner';

    if (!canEdit) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get next version number
    const nextVersion = (project.versions[0]?.version || 0) + 1;

    // Create version
    const version = await prisma.projectVersion.create({
      data: {
        projectId: id,
        version: nextVersion,
        name,
        description,
        modelData,
        thumbnailUrl,
      },
    });

    // Create activity
    await prisma.projectActivity.create({
      data: {
        projectId: id,
        userId: user.id,
        action: 'version_created',
        description: `Created version ${nextVersion}${name ? `: ${name}` : ''}`,
      },
    });

    // Update project timestamp
    const updateData: any = { updatedAt: new Date() };
    
    // If thumbnail is provided, update the project's thumbnail
    if (thumbnailUrl) {
      updateData.thumbnailUrl = thumbnailUrl;
    }
    
    await prisma.project.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ version }, { status: 201 });
  } catch (error) {
    console.error('Error creating version:', error);
    return NextResponse.json(
      { error: 'Failed to create version' },
      { status: 500 }
    );
  }
}

// GET /api/projects/[id]/versions - Get all versions for a project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await params;
    // Check if user has access to project
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        members: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const hasAccess =
      project.ownerId === user.id ||
      project.members.some((m: any) => m.userId === user.id) ||
      project.isPublic;

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get versions
    const versions = await prisma.projectVersion.findMany({
      where: { projectId: id },
      orderBy: {
        version: 'desc',
      },
    });

    return NextResponse.json({ versions });
  } catch (error) {
    console.error('Error fetching versions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch versions' },
      { status: 500 }
    );
  }
}
