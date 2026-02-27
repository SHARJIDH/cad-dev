import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { sendInviteEmail } from '@/lib/email-service';

// POST /api/projects/[id]/invite - Send invite to project
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
    const { email, role } = body;

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      );
    }

    if (!['editor', 'viewer'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be editor or viewer' },
        { status: 400 }
      );
    }

    const { id } = await params;
    // Check if user is owner or editor
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        members: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const member = project.members.find((m: any) => m.userId === user.id);
    const canInvite = project.ownerId === user.id || member?.role === 'editor' || member?.role === 'owner';

    if (!canInvite) {
      return NextResponse.json(
        { error: 'Only project owner or editors can invite members' },
        { status: 403 }
      );
    }

    // Check if user is already a member
    const existingMember = project.members.find((m: any) => m.user?.email === email);
    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this project' },
        { status: 400 }
      );
    }

    // Delete any existing pending invites for this email
    // This allows resending invites with fresh tokens and extended expiry
    await prisma.projectInvite.deleteMany({
      where: {
        projectId: id,
        email,
        status: 'pending',
      },
    });

    // Find receiver by email
    const receiver = await prisma.user.findUnique({
      where: { email },
    });

    // Create invite token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    // Create invite
    const invite = await prisma.projectInvite.create({
      data: {
        projectId: id,
        senderId: user.id,
        receiverId: receiver?.id,
        email,
        role,
        token,
        expiresAt,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
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

    // Create activity
    await prisma.projectActivity.create({
      data: {
        projectId: id,
        userId: user.id,
        action: 'invited',
        description: `Invited ${email} as ${role}`,
      },
    });

    // Send email invitation
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`;
    const emailResult = await sendInviteEmail(
      email,
      project.name,
      user.name || user.email,
      token,
      inviteLink
    );

    return NextResponse.json({
      invite,
      emailSent: emailResult.success,
      message: emailResult.success
        ? 'Invitation sent successfully'
        : 'Invitation created but email could not be sent. Email service may not be configured.',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating invite:', error);
    return NextResponse.json(
      { error: 'Failed to create invite' },
      { status: 500 }
    );
  }
}

// GET /api/projects/[id]/invite - Get all invites for a project
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
    // Check if user is owner or editor
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        members: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const member = project.members.find((m: any) => m.userId === user.id);
    const canView = project.ownerId === user.id || member?.role === 'editor' || member?.role === 'owner';

    if (!canView) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get invites
    const invites = await prisma.projectInvite.findMany({
      where: { projectId: id },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ invites });
  } catch (error) {
    console.error('Error fetching invites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invites' },
      { status: 500 }
    );
  }
}
