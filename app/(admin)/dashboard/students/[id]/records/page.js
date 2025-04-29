/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import PageHeader from '@/app/components/PageHeader';
import Card from '@/app/components/Card';

export default function StudentRecords() {
  const params = useParams();
  const studentId = params.id;
  const { data: session } = useSession();
  const [student, setStudent] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({
    term: '',
    year: '',
    subject: ''
  });

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        // Fetch student details
        const studentResponse = await fetch(`/api/students/${studentId}`);
        if (!studentResponse.ok) {
          throw new Error('Failed to fetch student details');
        }
        const studentData = await studentResponse.json();
        setStudent(studentData);

        // Fetch student's academic records
        const recordsResponse = await fetch(`/api/students/${studentId}/records`);
        if (!recordsResponse.ok) {
          throw new Error('Failed to fetch academic records');
        }
        const recordsData = await recordsResponse.json();
        setRecords(Array.isArray(recordsData) ? recordsData : []);
      } catch (error) {
        setError(error.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (session && studentId) {
      fetchStudentData();
    }
  }, [session, studentId]);

  // Filter records based on selected criteria
  const filteredRecords = records.filter(record => {
    return (
      (filter.term === '' || record.term === filter.term) &&
      (filter.year === '' || record.year.toString() === filter.year) &&
      (filter.subject === '' || record.subject.toLowerCase().includes(filter.subject.toLowerCase()))
    );
  });

  // Get unique terms, years, and subjects for filter dropdowns
  const terms = [...new Set(records.map(record => record.term))];
  const years = [...new Set(records.map(record => record.year))].map(year => year.toString());
  const subjects = [...new Set(records.map(record => record.subject))];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculate performance metrics
  const calculatePerformanceMetrics = () => {
    if (!records.length) return { averageGrade: 'N/A', totalSubjects: 0, bestSubject: 'N/A', improvementNeeded: 'N/A' };

    const gradeValues = {
      'A': 5,
      'B': 4,
      'C': 3,
      'D': 2,
      'E': 1,
      'F': 0
    };

    // Calculate average grade
    const totalGradePoints = records.reduce((sum, record) => sum + (gradeValues[record.grade] || 0), 0);
    const averageNumeric = totalGradePoints / records.length;
    
    // Convert numeric average to letter grade
    let averageGrade;
    if (averageNumeric >= 4.5) averageGrade = 'A';
    else if (averageNumeric >= 3.5) averageGrade = 'B';
    else if (averageNumeric >= 2.5) averageGrade = 'C';
    else if (averageNumeric >= 1.5) averageGrade = 'D';
    else if (averageNumeric >= 0.5) averageGrade = 'E';
    else averageGrade = 'F';

    // Find best and worst subjects
    const subjectPerformance = {};
    records.forEach(record => {
      if (!subjectPerformance[record.subject]) {
        subjectPerformance[record.subject] = [];
      }
      subjectPerformance[record.subject].push(gradeValues[record.grade] || 0);
    });

    let bestSubject = 'N/A';
    let improvementNeeded = 'N/A';
    let bestGrade = -1;
    let worstGrade = 6;

    Object.entries(subjectPerformance).forEach(([subject, grades]) => {
      const avgGrade = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
      if (avgGrade > bestGrade) {
        bestGrade = avgGrade;
        bestSubject = subject;
      }
      if (avgGrade < worstGrade) {
        worstGrade = avgGrade;
        improvementNeeded = subject;
      }
    });

    return {
      averageGrade,
      totalSubjects: subjects.length,
      bestSubject,
      improvementNeeded
    };
  };

  const metrics = calculatePerformanceMetrics();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">Student not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={`${student.firstName} ${student.lastName}'s Academic Records`}>
        <div className="flex space-x-2">
          <Link
            href={`/dashboard/students/${studentId}`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Student
          </Link>
          {(session?.user.role === 'ADMIN' || session?.user.role === 'TEACHER') && (
            <Link
              href={`/dashboard/academic-records/add?studentId=${studentId}`}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Records
            </Link>
          )}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Student</p>
              <p className="text-lg font-semibold text-gray-900">
                {student.firstName} {student.lastName}
              </p>
              <p className="text-sm text-gray-500">
                Class {student.class}{student.section ? ` (${student.section})` : ''}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Average Grade</p>
              <p className="text-2xl font-semibold text-gray-900">{metrics.averageGrade}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Subjects</p>
              <p className="text-2xl font-semibold text-gray-900">{metrics.totalSubjects}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Best Subject</p>
              <p className="text-lg font-semibold text-gray-900">{metrics.bestSubject}</p>
              <p className="text-sm text-gray-500">Needs Improvement: {metrics.improvementNeeded}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Filter Records</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Term
              </label>
              <select
                name="term"
                value={filter.term}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">All Terms</option>
                {terms.map((term, index) => (
                  <option key={index} value={term}>{term}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <select
                name="year"
                value={filter.year}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">All Years</option>
                {years.map((year, index) => (
                  <option key={index} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <select
                name="subject"
                value={filter.subject}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">All Subjects</option>
                {subjects.map((subject, index) => (
                  <option key={index} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-4 text-gray-600">No academic records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Term/Year
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teacher's Comment
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {record.subject}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        record.grade === 'A' ? 'bg-green-100 text-green-800' :
                        record.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                        record.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                        record.grade === 'D' ? 'bg-orange-100 text-orange-800' :
                        record.grade === 'E' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {record.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.term}</div>
                      <div className="text-sm text-gray-500">{record.year}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {record.teacherComment || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(record.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {records.length > 0 && (
        <Card>
          <h3 className="text-lg font-medium mb-4">Performance Trend</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Performance chart will be displayed here</p>
            {/* In a real implementation, you would add a chart library like Chart.js or Recharts */}
          </div>
        </Card>
      )}
    </div>
  );
}