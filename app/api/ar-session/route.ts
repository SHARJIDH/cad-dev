import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST: Create a new AR session
export async function POST(request: NextRequest) {
    try {
        const { modelData } = await request.json();

        if (!modelData) {
            return NextResponse.json(
                { error: 'Model data is required' },
                { status: 400 }
            );
        }

        // Generate a unique session ID
        const sessionId = `ar_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        // Set expiration to 24 hours from now
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // Store in database
        const session = await prisma.aRSession.create({
            data: {
                sessionId,
                modelData,
                expiresAt,
            },
        });

        return NextResponse.json({
            sessionId: session.sessionId,
            expiresAt: session.expiresAt,
        });
    } catch (error) {
        console.error('Error creating AR session:', error);
        return NextResponse.json(
            { error: 'Failed to create AR session' },
            { status: 500 }
        );
    }
}

// GET: Retrieve an AR session by ID
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('id');

        if (!sessionId) {
            return NextResponse.json(
                { error: 'Session ID is required' },
                { status: 400 }
            );
        }

        // Find the session
        const session = await prisma.aRSession.findUnique({
            where: { sessionId },
        });

        if (!session) {
            return NextResponse.json(
                { error: 'Model data not found. QR code may have expired.' },
                { status: 404 }
            );
        }

        // Check if expired
        if (new Date() > session.expiresAt) {
            // Delete expired session
            await prisma.aRSession.delete({
                where: { sessionId },
            });

            return NextResponse.json(
                { error: 'Model data has expired. Please generate a new QR code.' },
                { status: 410 }
            );
        }

        return NextResponse.json({
            modelData: session.modelData,
            expiresAt: session.expiresAt,
        });
    } catch (error) {
        console.error('Error retrieving AR session:', error);
        return NextResponse.json(
            { error: 'Failed to retrieve AR session' },
            { status: 500 }
        );
    }
}

// DELETE: Clean up expired sessions (can be called periodically)
export async function DELETE(request: NextRequest) {
    try {
        const now = new Date();
        
        const result = await prisma.aRSession.deleteMany({
            where: {
                expiresAt: {
                    lt: now,
                },
            },
        });

        return NextResponse.json({
            deleted: result.count,
        });
    } catch (error) {
        console.error('Error cleaning up expired sessions:', error);
        return NextResponse.json(
            { error: 'Failed to clean up expired sessions' },
            { status: 500 }
        );
    }
}
