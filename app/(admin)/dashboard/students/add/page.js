'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/app/components/PageHeader'; // Assuming you might want a header
import Card from '@/app/components/Card'; // Wrap form in a card

export default function AddStudent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.target);
    const data = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      dateOfBirth: formData.get('dateOfBirth'),
      gender: formData.get('gender'),
      admissionNumber: formData.get('admissionNumber'),
      class: formData.get('class'),
      section: formData.get('section'),
      parentName: formData.get('parentName'),
      parentEmail: formData.get('parentEmail'),
      parentPhone: formData.get('parentPhone'),
      address: formData.get('address'),
    };

    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to add student');
      }

      router.push('/dashboard/students');
      router.refresh();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6"> {/* Added padding and spacing */}
      <PageHeader title="Add New Student" /> {/* Optional Header */}

      <Card> {/* Wrap form in Card */}
        {error && (
          <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-800 p-4 rounded-md shadow-sm"> {/* Improved error styling */}
            <p className="font-medium">Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section for Basic Info */}
          <fieldset className="space-y-6">
             <legend className="text-lg font-medium text-gray-900 mb-4">Student Information</legend>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5"> {/* Adjusted gap */}
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1"> {/* Use htmlFor */}
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName" // Match label htmlFor
                    name="firstName"
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" // Enhanced input style
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    required
                    className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" // Enhanced select style
                  >
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
             </div>
          </fieldset>

          {/* Section for Academic Info */}
          <fieldset className="space-y-6 pt-4 border-t border-gray-200"> {/* Added separator */}
             <legend className="text-lg font-medium text-gray-900 mb-4">Academic Information</legend>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5"> {/* Adjusted grid */}
                <div>
                  <label htmlFor="admissionNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Admission Number
                  </label>
                  <input
                    type="text"
                    id="admissionNumber"
                    name="admissionNumber"
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-1">
                    Class / Level
                  </label>
                  <input
                    type="text"
                    id="class"
                    name="class"
                    required
                    placeholder="e.g., Grade 10, Year 2"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-1">
                    Section / Group <span className="text-gray-500">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    id="section"
                    name="section"
                    placeholder="e.g., A, Blue Group"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
             </div>
          </fieldset>

          {/* Section for Parent/Guardian Info */}
          <fieldset className="space-y-6 pt-4 border-t border-gray-200">
             <legend className="text-lg font-medium text-gray-900 mb-4">Parent/Guardian Information</legend>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
                <div>
                  <label htmlFor="parentName" className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Name
                  </label>
                  <input
                    type="text"
                    id="parentName"
                    name="parentName"
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="parentEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Email
                  </label>
                  <input
                    type="email"
                    id="parentEmail"
                    name="parentEmail"
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="parentPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Phone
                  </label>
                  <input
                    type="tel"
                    id="parentPhone"
                    name="parentPhone"
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
             </div>
             <div className="col-span-1 md:col-span-3"> {/* Address spans full width */}
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows="3"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" // Enhanced textarea style
                ></textarea>
             </div>
          </fieldset>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-5 border-t border-gray-200"> {/* Align buttons right */}
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" // Secondary button style
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center px-4 py-2 bg-indigo-600 text-white font-medium border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50" // Primary button style
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </>
              ) : (
                'Add Student'
              )}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}