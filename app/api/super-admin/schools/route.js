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

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const approvalStatus = searchParams.get('approvalStatus');
    
    // Build the where clause based on filters
    const where = {};
    if (approvalStatus === 'pending') {
      where.isApproved = false;
    } else if (approvalStatus === 'approved') {
      where.isApproved = true;
    }

    // Get all schools with counts
    const schools = await prisma.school.findMany({
      where,
      include: {
        _count: {
          select: {
            students: true,
            users: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Show newest schools first
      },
    });

    // Get total counts for stats
    const [totalUsers, totalStudents, totalSchools, approvedSchools] = await Promise.all([
      prisma.user.count(),
      prisma.student.count(),
      prisma.school.count(),
      prisma.school.count({ where: { isApproved: true } }),
    ]);

    // Format the response
    const formattedSchools = schools.map(school => ({
      id: school.id,
      name: school.name,
      location: school.location,
      contactEmail: school.contactEmail,
      contactPhone: school.contactPhone,
      schoolType: school.schoolType,
      isApproved: school.isApproved,
      userCount: school._count.users,
      studentCount: school._count.students,
      createdAt: school.createdAt,
    }));

    return NextResponse.json({
      schools: formattedSchools,
      totalSchools,
      activeSchools: approvedSchools,
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
      isApproved = true, // Super admin created schools are approved by default
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
          isApproved, // Set approval status
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