import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      schoolName,
      location,
      contactEmail,
      contactPhone,
      schoolType,
      adminName,
      adminEmail,
      adminPassword,
    } = body;

    // Validate required fields
    if (!schoolName || !location || !contactEmail || !adminEmail || !adminPassword) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if admin email already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: adminEmail,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already in use' },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create the school and admin in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the school
      const school = await tx.school.create({
        data: {
          name: schoolName,
          location,
          contactEmail,
          contactPhone,
          schoolType,
        },
      });

      // Create the admin user
      const admin = await tx.user.create({
        data: {
          name: adminName,
          email: adminEmail,
          password: hashedPassword,
          role: 'ADMIN',
          schoolId: school.id,
        },
      });

      return { school, admin };
    });

    return NextResponse.json(
      {
        message: 'School registered successfully',
        schoolId: result.school.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error registering school:', error);
    return NextResponse.json(
      { message: 'Failed to register school' },
      { status: 500 }
    );
  }
}