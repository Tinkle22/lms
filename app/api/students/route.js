import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      admissionNumber,
      class: studentClass,
      section,
      parentName,
      parentEmail,
      parentPhone,
      address
    } = body;

    const student = await prisma.student.create({
      data: {
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        admissionNumber,
        class: studentClass,
        section,
        parentName,
        parentEmail,
        parentPhone,
        address,
        schoolId: session.user.schoolId,
      },
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { message: 'Failed to create student' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const students = await prisma.student.findMany({
      where: {
        schoolId: session.user.schoolId,
      },
      orderBy: {
        lastName: 'asc',
      },
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { message: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}