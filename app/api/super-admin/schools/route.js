import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import bcrypt from 'bcrypt';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get all schools with counts
    const schools = await prisma.school.findMany({
      include: {
        _count: {
          select: {
            students: true,
            users: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Get total counts for stats
    const [totalUsers, totalStudents] = await Promise.all([
      prisma.user.count(),
      prisma.student.count(),
    ]);

    // Format the response
    const formattedSchools = schools.map(school => ({
      id: school.id,
      name: school.name,
      location: school.location,
      contactEmail: school.contactEmail,
      contactPhone: school.contactPhone,
      schoolType: school.schoolType,
      userCount: school._count.users,
      studentCount: school._count.students,
      createdAt: school.createdAt,
    }));

    return NextResponse.json({
      schools: formattedSchools,
      totalSchools: schools.length,
      activeSchools: schools.length, // You can modify this if you have an active status
      totalUsers,
      totalStudents,
    });
  } catch (error) {
    console.error('Error fetching schools:', error);
    return NextResponse.json(
      { message: 'Failed to fetch schools' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      location,
      contactEmail,
      contactPhone,
      schoolType,
      adminName,
      adminEmail,
      adminPassword,
    } = body;

    // Validate required fields
    if (!name || !location || !contactEmail || !adminEmail || !adminPassword) {
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
          name,
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
        message: 'School created successfully',
        schoolId: result.school.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating school:', error);
    return NextResponse.json(
      { message: 'Failed to create school' },
      { status: 500 }
    );
  }
}