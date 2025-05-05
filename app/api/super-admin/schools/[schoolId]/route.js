import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

// GET handler - Fetch single school details
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    // Allow ADMIN of the school OR SUPER_ADMIN to view details
    // Note: Adjust logic if only SUPER_ADMIN should view specific details
    if (!session || !(session.user.role === 'SUPER_ADMIN' || (session.user.role === 'ADMIN' && session.user.schoolId === params.schoolId))) {
       // If you want ONLY Super Admin to access this specific endpoint:
       // if (!session || session.user.role !== 'SUPER_ADMIN') {
       return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { schoolId } = params;

    if (!schoolId) {
      return NextResponse.json({ message: 'School ID is required' }, { status: 400 });
    }

    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      // Optionally include related data if needed for the view page
      // include: {
      //   users: { select: { id: true, name: true, email: true, role: true } }, // Example
      //   students: { select: { id: true, firstName: true, lastName: true } } // Example
      // }
    });

    if (!school) {
      return NextResponse.json({ message: 'School not found' }, { status: 404 });
    }

    return NextResponse.json(school);

  } catch (error) {
    console.error('Error fetching school details:', error);
    return NextResponse.json({ message: 'Failed to fetch school details' }, { status: 500 });
  }
}

// PATCH handler - Update school details
export async function PATCH(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        // Only SUPER_ADMIN can edit schools via this route
        if (!session || session.user.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { schoolId } = params;
        const body = await request.json();

        // Add validation for the request body here (e.g., using Zod)
        // For simplicity, basic checks are shown:
        const { name, location, schoolType, contactEmail, contactPhone, isApproved } = body;

        if (!schoolId) {
            return NextResponse.json({ message: 'School ID is required' }, { status: 400 });
        }

        // Ensure at least one field is being updated (optional, prevents empty updates)
        if (!name && !location && !schoolType && !contactEmail && !contactPhone && typeof isApproved !== 'boolean') {
             return NextResponse.json({ message: 'No update data provided' }, { status: 400 });
        }

        // Construct update data object, only including fields that were provided
        const updateData = {};
        if (name) updateData.name = name;
        if (location) updateData.location = location;
        if (schoolType) updateData.schoolType = schoolType; // Ensure schoolType is valid enum value if provided
        if (contactEmail) updateData.contactEmail = contactEmail;
        if (contactPhone) updateData.contactPhone = contactPhone;
        if (typeof isApproved === 'boolean') updateData.isApproved = isApproved; // Allow updating approval status


        const updatedSchool = await prisma.school.update({
            where: { id: schoolId },
            data: updateData,
        });

        console.log(`School ${updatedSchool.name} (ID: ${schoolId}) updated by Super Admin ${session.user.email}`);

        return NextResponse.json(updatedSchool);

    } catch (error) {
        console.error('Error updating school:', error);
        // Handle potential errors like school not found (P2025) or validation errors
        if (error.code === 'P2025') {
             return NextResponse.json({ message: 'School not found' }, { status: 404 });
        }
        // Add more specific error handling (e.g., for invalid enum values)
        return NextResponse.json({ message: 'Failed to update school' }, { status: 500 });
    }
}


// DELETE handler (existing)
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { schoolId } = params;

    if (!schoolId) {
      return NextResponse.json({ message: 'School ID is required' }, { status: 400 });
    }

    // Use a transaction to ensure atomicity
    // Note: Ensure your Prisma schema has appropriate cascading deletes set up
    // e.g., on User model: school School @relation(fields: [schoolId], references: [id], onDelete: Cascade)
    // e.g., on Student model: school School @relation(fields: [schoolId], references: [id], onDelete: Cascade)
    // If not, you'll need to manually delete related records here within the transaction.

    const deletedSchool = await prisma.$transaction(async (tx) => {
      // Manually delete related records if cascade delete is not set
      // await tx.student.deleteMany({ where: { schoolId } });
      // await tx.user.deleteMany({ where: { schoolId } });

      // Delete the school
      const school = await tx.school.delete({
        where: { id: schoolId },
      });
      return school;
    });

    if (!deletedSchool) {
       return NextResponse.json({ message: 'School not found' }, { status: 404 });
    }

    console.log(`School ${deletedSchool.name} (ID: ${schoolId}) deleted by Super Admin ${session.user.email}`);

    return NextResponse.json({ message: 'School deleted successfully' });

  } catch (error) {
    console.error('Error deleting school:', error);
    // Check for specific Prisma errors, like foreign key constraints if cascade isn't set
    if (error.code === 'P2014' || error.code === 'P2003') { // Example error codes
         return NextResponse.json({ message: 'Failed to delete school due to related records. Ensure cascading deletes are configured or manually delete related users/students first.' }, { status: 409 }); // Conflict
    }
    return NextResponse.json({ message: 'Failed to delete school' }, { status: 500 });
  }
}