import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendAcademicReport(studentData, recordData) {
  const gradeColors = {
    'A': '#22c55e', // green
    'B': '#3b82f6', // blue
    'C': '#eab308', // yellow
    'D': '#f97316', // orange
    'E': '#ef4444', // red
    'F': '#dc2626', // dark red
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f3f4f6; padding: 20px; border-radius: 8px; }
        .grade { font-size: 24px; font-weight: bold; color: ${gradeColors[recordData.grade] || '#333'}; }
        .details { margin: 20px 0; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; }
        .footer { margin-top: 20px; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Academic Performance Report</h2>
          <p>Dear ${studentData.parentName},</p>
          <p>This is to inform you about ${studentData.firstName} ${studentData.lastName}'s recent academic performance.</p>
        </div>
        
        <div class="details">
          <h3>Performance Details:</h3>
          <p><strong>Subject:</strong> ${recordData.subject}</p>
          <p><strong>Grade:</strong> <span class="grade">${recordData.grade}</span></p>
          <p><strong>Term:</strong> ${recordData.term}</p>
          <p><strong>Year:</strong> ${recordData.year}</p>
          ${recordData.teacherComment ? `
          <div style="margin-top: 20px;">
            <h4>Teacher's Comment:</h4>
            <p style="font-style: italic;">${recordData.teacherComment}</p>
          </div>
          ` : ''}
        </div>
        
        <div class="footer">
          <p>If you have any questions about this report, please don't hesitate to contact the school administration.</p>
          <p>Best regards,<br>School Administration</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: studentData.parentEmail,
    subject: `Academic Report - ${recordData.subject}`,
    html: htmlContent,
  });
}