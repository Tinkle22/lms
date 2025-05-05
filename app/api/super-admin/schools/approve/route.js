import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import nodemailer from 'nodemailer';

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'mutalemattlesa@gmail.com',
    pass: process.env.SMTP_PASSWORD || 'password',
  },
});

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is a super admin
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { schoolId } = await request.json();

    if (!schoolId) {
      return NextResponse.json({ message: 'School ID is required' }, { status: 400 });
    }

    // Find the school
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      include: {
        users: {
          where: { role: 'ADMIN' },
          select: { email: true, name: true }
        }
      }
    });

    if (!school) {
      return NextResponse.json({ message: 'School not found' }, { status: 404 });
    }

    // Update the school's approval status
    const updatedSchool = await prisma.school.update({
      where: { id: schoolId },
      data: { isApproved: true }
    });

    // Send email notification to school admin
    const schoolAdmin = school.users[0];
    if (schoolAdmin && schoolAdmin.email) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || 'noreply@lms.example.com',
          to: schoolAdmin.email,
          subject: 'Your School Registration Has Been Approved',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4a5568;">School Registration Approved</h2>
              <p>Dear ${schoolAdmin.name},</p>
              <p>We're pleased to inform you that your school <strong>${school.name}</strong> has been approved on our Learning Management System.</p>
              <p>You can now log in to your admin dashboard using your registered email and password.</p>
              <div style="margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" 
                   style="background-color: #4299e1; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                  Login to Dashboard
                </a>
              </div>
              <p>If you have any questions or need assistance, please contact our support team.</p>
              <p>Thank you for choosing our platform!</p>
              <p>Best regards,<br>LMS Support Team</p>
            </div>
          `,
        });
        console.log(`Approval email sent to ${schoolAdmin.email} for school ${school.name}`);
      } catch (emailError) {
        console.error('Error sending approval email:', emailError);
        // We don't want to fail the approval if email sending fails
      }
    }

    return NextResponse.json({ 
      message: 'School approved successfully',
      school: updatedSchool,
      emailSent: !!schoolAdmin?.email
    });
  } catch (error) {
    console.error('Error approving school:', error);
    return NextResponse.json({ message: 'Failed to approve school' }, { status: 500 });
  }
}