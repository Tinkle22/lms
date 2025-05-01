import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is a super admin
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { schoolId } = await request.json();

    if (!schoolId) {
      return NextResponse.json({ message: 'School ID is required' }, { status: 400 });
    }

    // Find the school
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      include: {
        users: {
          where: { role: 'ADMIN' },
          select: { email: true, name: true }
        }
      }
    });

    if (!school) {
      return NextResponse.json({ message: 'School not found' }, { status: 404 });
    }

    // Update the school's approval status
    const updatedSchool = await prisma.school.update({
      where: { id: schoolId },
      data: { isApproved: true }
    });

    // In a real application, you would send an email to the school admin here
    // For now, we'll just log it
    console.log(`School ${school.name} has been approved. Notification would be sent to ${school.users[0]?.email}`);

    return NextResponse.json({ 
      message: 'School approved successfully',
      school: updatedSchool
    });
  } catch (error) {
    console.error('Error approving school:', error);
    return NextResponse.json({ message: 'Failed to approve school' }, { status: 500 });
  }
}