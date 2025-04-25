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
    
    // Create the academic record
    const record = await prisma.academicRecord.create({
      data: {
        subject: body.subject,
        grade: body.grade,
        term: body.term,
        year: body.year,
        teacherComment: body.teacherComment,
        studentId: body.studentId,
      },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
            class: true,
            section: true,
            parentName: true,
            parentEmail: true,
          }
        }
      }
    });

    // Send email notification
    try {
      await sendAcademicReport(record.student, record);
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Continue with the response even if email fails
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error('Error creating academic record:', error);
    return NextResponse.json(
      { message: 'Failed to create academic record' },
      { status: 500 }
    );
  }
}