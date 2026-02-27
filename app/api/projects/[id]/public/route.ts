import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/projects/[id]/public - Get public project details
 * No authentication required for public projects
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
          },
        },
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            messages: true,
            members: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if project is public
    if (!project.isPublic) {
      return NextResponse.json(
        { error: 'This project is private' },
        { status: 403 }
      );
    }

    // Get latest version for model data
    const latestVersion = await prisma.projectVersion.findFirst({
      where: { projectId: id },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    return NextResponse.json({
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        thumbnailUrl: (project as any).thumbnailUrl,
        owner: project.owner,
        isPublic: project.isPublic,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        versions: project.versions,
        latestVersion,
        _count: project._count,
      },
    });
  } catch (error) {
    console.error('Error fetching public project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}
