import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const studentId = params.id;

    // Verify the student exists and belongs to the user's school
    const student = await prisma.student.findUnique({
      where: {
        id: studentId,
        schoolId: session.user.schoolId
      }
    });

    if (!student) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }

    // Fetch all academic records for the student
    const records = await prisma.academicRecord.findMany({
      where: {
        studentId: studentId
      },
      orderBy: [
        { year: 'desc' },
        { term: 'desc' },
        { subject: 'asc' }
      ]
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error('Error fetching student records:', error);
    return NextResponse.json(
      { message: 'Failed to fetch student records' },
      { status: 500 }
    );
  }
}