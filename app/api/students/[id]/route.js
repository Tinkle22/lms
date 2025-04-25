import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const student = await prisma.student.findUnique({
      where: {
        id: params.id,
        schoolId: session.user.schoolId,
      },
    });

    if (!student) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json(
      { message: 'Failed to fetch student' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
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

    const student = await prisma.student.update({
      where: {
        id: params.id,
        schoolId: session.user.schoolId,
      },
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
      },
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json(
      { message: 'Failed to update student' },
      { status: 500 }
    );
  }
}