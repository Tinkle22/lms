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

export async function sendAcademicReport(studentData, recordsData, term, year) {
  const gradeColors = {
    'A': '#22c55e', // green
    'B': '#3b82f6', // blue
    'C': '#eab308', // yellow
    'D': '#f97316', // orange
    'E': '#ef4444', // red
    'F': '#dc2626', // dark red
  };

  // Generate the subjects table HTML
  const subjectsTableRows = recordsData.map(record => `
    <tr>
      <td style="padding: 10px; border: 1px solid #e5e7eb;">${record.subject}</td>
      <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: center;">
        <span style="font-size: 16px; font-weight: bold; color: ${gradeColors[record.grade] || '#333'};">
          ${record.grade}
        </span>
      </td>
      <td style="padding: 10px; border: 1px solid #e5e7eb;">${record.teacherComment || '-'}</td>
    </tr>
  `).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f3f4f6; padding: 20px; border-radius: 8px; }
        .details { margin: 20px 0; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; }
        .footer { margin-top: 20px; font-size: 14px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th { background-color: #f3f4f6; padding: 10px; border: 1px solid #e5e7eb; text-align: left; }
        .summary { margin-top: 20px; padding: 15px; background-color: #f9fafb; border-radius: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Academic Performance Report</h2>
          <p>Dear ${studentData.parentName},</p>
          <p>This is to inform you about ${studentData.firstName} ${studentData.lastName}'s academic performance for ${term} ${year}.</p>
        </div>
        
        <div class="details">
          <h3>Student Information:</h3>
          <p><strong>Name:</strong> ${studentData.firstName} ${studentData.lastName}</p>
          <p><strong>Class:</strong> ${studentData.class}${studentData.section ? ' - ' + studentData.section : ''}</p>
          <p><strong>Term:</strong> ${term}</p>
          <p><strong>Year:</strong> ${year}</p>
          
          <h3>Performance Details:</h3>
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Grade</th>
                <th>Teacher's Comment</th>
              </tr>
            </thead>
            <tbody>
              ${subjectsTableRows}
            </tbody>
          </table>
          
          <div class="summary">
            <h4>Overall Performance:</h4>
            <p>Total Subjects: ${recordsData.length}</p>
            <p>Average Grade: ${calculateAverageGrade(recordsData)}</p>
          </div>
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
    subject: `Academic Report - ${term} ${year}`,
    html: htmlContent,
  });
}

// Helper function to calculate average grade
function calculateAverageGrade(records) {
  const gradeValues = {
    'A': 5,
    'B': 4,
    'C': 3,
    'D': 2,
    'E': 1,
    'F': 0
  };
  
  const sum = records.reduce((total, record) => {
    return total + (gradeValues[record.grade] || 0);
  }, 0);
  
  const average = sum / records.length;
  
  // Convert numeric average back to letter grade
  if (average >= 4.5) return 'A';
  if (average >= 3.5) return 'B';
  if (average >= 2.5) return 'C';
  if (average >= 1.5) return 'D';
  if (average >= 0.5) return 'E';
  return 'F';
}