/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import PageHeader from '@/app/components/PageHeader';
import Card from '@/app/components/Card';

export default function AddAcademicRecords() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [studentFilter, setStudentFilter] = useState({
    name: '',
    class: '',
    section: ''
  });
  
  const [formData, setFormData] = useState({
    term: '',
    year: new Date().getFullYear(), // Store as number
    subjects: [{ subject: '', grade: '', teacherComment: '' }]
  });

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('/api/students');
        const data = await response.json();
        setStudents(data);
      } catch (error) {
        setError('Failed to fetch students');
      }
    };

    if (session) {
      fetchStudents();
    }
  }, [session]);

  // Filter students based on search criteria
  const filteredStudents = students.filter(student => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    const nameMatch = fullName.includes(studentFilter.name.toLowerCase());
    const classMatch = studentFilter.class === '' || student.class === studentFilter.class;
    const sectionMatch = studentFilter.section === '' || student.section === studentFilter.section;
    
    return nameMatch && classMatch && sectionMatch;
  });

  // Get unique classes and sections for filter dropdowns
  const classes = [...new Set(students.map(student => student.class))].sort();
  const sections = [...new Set(students.filter(s => s.section).map(student => student.section))].sort();

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setStudentFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For year field, convert to integer
    if (name === 'year') {
      const yearValue = parseInt(value, 10);
      setFormData(prev => ({
        ...prev,
        [name]: isNaN(yearValue) ? '' : yearValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubjectChange = (index, e) => {
    const { name, value } = e.target;
    const updatedSubjects = [...formData.subjects];
    updatedSubjects[index] = {
      ...updatedSubjects[index],
      [name]: value
    };
    
    setFormData(prev => ({
      ...prev,
      subjects: updatedSubjects
    }));
  };

  const addSubject = () => {
    setFormData(prev => ({
      ...prev,
      subjects: [...prev.subjects, { subject: '', grade: '', teacherComment: '' }]
    }));
  };

  const removeSubject = (index) => {
    if (formData.subjects.length === 1) {
      return; // Keep at least one subject
    }
    
    const updatedSubjects = formData.subjects.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      subjects: updatedSubjects
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!selectedStudent) {
      setError('Please select a student');
      setLoading(false);
      return;
    }

    if (formData.subjects.some(subject => !subject.subject || !subject.grade)) {
      setError('Subject and grade are required for all entries');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/academic-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: selectedStudent,
          term: formData.term,
          year: formData.year, // This will be a number
          subjects: formData.subjects
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to add academic records');
      }

      router.push('/dashboard/academic-records');
      router.refresh();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Add Academic Records" />
      
      <Card>
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student Filter Section */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Find Student</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={studentFilter.name}
                  onChange={handleFilterChange}
                  placeholder="Search by name"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class
                </label>
                <select
                  name="class"
                  value={studentFilter.class}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Classes</option>
                  {classes.map((cls, index) => (
                    <option key={index} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade
                </label>
                <select
                  name="section"
                  value={studentFilter.section}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Grades</option>
                  {sections.map((section, index) => (
                    <option key={index} value={section}>{section}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                Found {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student
              </label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select a student</option>
                {filteredStudents.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.firstName} {student.lastName} - Class {student.class}{student.section ? ` (${student.section})` : ''}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Term
                </label>
                <select
                  name="term"
                  value={formData.term}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select Term</option>
                  <option value="First Term">First Term</option>
                  <option value="Second Term">Second Term</option>
                  <option value="Third Term">Third Term</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year
                </label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                  min="2000"
                  max="2100"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Subjects</h3>
              <button
                type="button"
                onClick={addSubject}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Subject
              </button>
            </div>
            
            {formData.subjects.map((subject, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-md mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Subject {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeSubject(index)}
                    className="text-red-600 hover:text-red-800"
                    disabled={formData.subjects.length === 1}
                  >
                    Remove
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject Name
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={subject.subject}
                      onChange={(e) => handleSubjectChange(index, e)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grade
                    </label>
                    <select
                      name="grade"
                      value={subject.grade}
                      onChange={(e) => handleSubjectChange(index, e)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Select Grade</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                      <option value="E">E</option>
                      <option value="F">F</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teacher's Comment
                    </label>
                    <textarea
                      name="teacherComment"
                      value={subject.teacherComment}
                      onChange={(e) => handleSubjectChange(index, e)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      rows="2"
                    ></textarea>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md mr-2"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Records'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}