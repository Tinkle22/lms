import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const school = await prisma.school.findUnique({
      where: {
        id: session.user.schoolId,
      },
      include: {
        _count: {
          select: {
            students: true,
            users: true,
          },
        },
      },
    });

    if (!school) {
      return NextResponse.json({ message: 'School not found' }, { status: 404 });
    }

    return NextResponse.json(school);
  } catch (error) {
    console.error('Error fetching school:', error);
    return NextResponse.json(
      { message: 'Failed to fetch school' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, location, contactEmail, contactPhone, schoolType } = body;

    const school = await prisma.school.update({
      where: {
        id: session.user.schoolId,
      },
      data: {
        name,
        location,
        contactEmail,
        contactPhone,
        schoolType,
      },
    });

    return NextResponse.json(school);
  } catch (error) {
    console.error('Error updating school:', error);
    return NextResponse.json(
      { message: 'Failed to update school' },
      { status: 500 }
    );
  }
}