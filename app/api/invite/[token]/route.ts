import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// POST /api/invite/[token]/accept - Accept an invite
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
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

    const { token } = await params;
    // Find invite
    const invite = await prisma.projectInvite.findUnique({
      where: { token },
      include: {
        project: true,
      },
    });

    if (!invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }

    // Check if invite is valid
    if (invite.status !== 'pending') {
      return NextResponse.json(
        { error: `Invite has already been ${invite.status}` },
        { status: 400 }
      );
    }

    if (new Date() > invite.expiresAt) {
      // Update invite status to expired
      await prisma.projectInvite.update({
        where: { id: invite.id },
        data: { status: 'expired' },
      });
      return NextResponse.json({ error: 'Invite has expired' }, { status: 400 });
    }

    // Check if user's email matches
    if (invite.email !== user.email) {
      return NextResponse.json(
        { error: 'This invite was sent to a different email address' },
        { status: 403 }
      );
    }

    // Check if user is already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: invite.projectId,
          userId: user.id,
        },
      },
    });

    if (existingMember) {
      // Update invite status
      await prisma.projectInvite.update({
        where: { id: invite.id },
        data: { status: 'accepted' },
      });
      return NextResponse.json(
        { error: 'You are already a member of this project' },
        { status: 400 }
      );
    }

    // Add user as member
    const member = await prisma.projectMember.create({
      data: {
        projectId: invite.projectId,
        userId: user.id,
        role: invite.role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Update invite status
    await prisma.projectInvite.update({
      where: { id: invite.id },
      data: {
        status: 'accepted',
        receiverId: user.id,
      },
    });

    // Create activity
    await prisma.projectActivity.create({
      data: {
        projectId: invite.projectId,
        userId: user.id,
        action: 'joined',
        description: `${user.name || user.email} joined the project`,
      },
    });

    return NextResponse.json({ member, project: invite.project });
  } catch (error) {
    console.error('Error accepting invite:', error);
    return NextResponse.json(
      { error: 'Failed to accept invite' },
      { status: 500 }
    );
  }
}

// POST /api/invite/[token]/reject - Reject an invite
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
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

    const { token } = await params;
    // Find invite
    const invite = await prisma.projectInvite.findUnique({
      where: { token },
    });

    if (!invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }

    // Check if user's email matches
    if (invite.email !== user.email) {
      return NextResponse.json(
        { error: 'This invite was sent to a different email address' },
        { status: 403 }
      );
    }

    // Update invite status
    await prisma.projectInvite.update({
      where: { id: invite.id },
      data: {
        status: 'rejected',
        receiverId: user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error rejecting invite:', error);
    return NextResponse.json(
      { error: 'Failed to reject invite' },
      { status: 500 }
    );
  }
}
