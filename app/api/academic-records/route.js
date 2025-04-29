import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { sendAcademicReport } from '@/lib/emailService';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const records = await prisma.academicRecord.findMany({
      where: {
        student: {
          schoolId: session.user.schoolId
        }
      },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
            class: true,
            section: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error('Error fetching academic records:', error);
    return NextResponse.json(
      { message: 'Failed to fetch academic records' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'TEACHER'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Check if we have multiple subjects
    if (!Array.isArray(body.subjects) || body.subjects.length === 0) {
      return NextResponse.json(
        { message: 'At least one subject is required' },
        { status: 400 }
      );
    }

    // Convert year to integer
    const year = parseInt(body.year, 10);
    if (isNaN(year)) {
      return NextResponse.json(
        { message: 'Year must be a valid number' },
        { status: 400 }
      );
    }

    // Get student data first
    const student = await prisma.student.findUnique({
      where: { id: body.studentId },
      select: {
        firstName: true,
        lastName: true,
        class: true,
        section: true,
        parentName: true,
        parentEmail: true,
      }
    });

    if (!student) {
      return NextResponse.json(
        { message: 'Student not found' },
        { status: 404 }
      );
    }

    // Create multiple academic records in a transaction
    const records = await prisma.$transaction(
      body.subjects.map(subjectData => 
        prisma.academicRecord.create({
          data: {
            subject: subjectData.subject,
            grade: subjectData.grade,
            term: body.term,
            year: year, // Use the parsed integer
            teacherComment: subjectData.teacherComment || '',
            studentId: body.studentId,
          }
        })
      )
    );

    // Send a single consolidated email with all subjects
    try {
      await sendAcademicReport(student, records, body.term, year.toString());
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Continue with the response even if email fails
    }

    return NextResponse.json(records);
  } catch (error) {
    console.error('Error creating academic records:', error);
    return NextResponse.json(
      { message: 'Failed to create academic records' },
      { status: 500 }
    );
  }
}