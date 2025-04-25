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

    // Fetch all required data in parallel
    const [students, teachers, recentRecords] = await Promise.all([
      // Get total students count
      prisma.student.count({
        where: {
          schoolId: session.user.schoolId,
        },
      }),
      // Get total teachers count
      prisma.user.count({
        where: {
          schoolId: session.user.schoolId,
          role: 'TEACHER',
        },
      }),
      // Get recent academic records
      prisma.academicRecord.findMany({
        where: {
          student: {
            schoolId: session.user.schoolId,
          },
        },
        include: {
          student: {
            select: {
              firstName: true,
              lastName: true,
              class: true,
              section: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10, // Limit to 10 most recent records
      }),
    ]);

    return NextResponse.json({
      totalStudents: students,
      totalTeachers: teachers,
      recentRecords: recentRecords,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { message: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}