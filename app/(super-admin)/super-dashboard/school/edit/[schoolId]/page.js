/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import PageHeader from '@/app/components/PageHeader';
import Card from '@/app/components/Card';

// Define SchoolType enum again or import from a shared location
const SchoolType = {
  PRIMARY: 'PRIMARY',
  SECONDARY: 'SECONDARY',
  COLLEGE: 'COLLEGE',
  UNIVERSITY: 'UNIVERSITY'
};

export default function EditSchool() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const schoolId = params?.schoolId;

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    schoolType: '',
    contactEmail: '',
    contactPhone: '',
    isApproved: false,
  });
  const [loading, setLoading] = useState(true); // For initial data fetch
  const [submitting, setSubmitting] = useState(false); // For form submission
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch existing school data
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated' && session.user.role !== 'SUPER_ADMIN') {
        setError('Unauthorized: Only Super Admins can edit schools.');
        setLoading(false);
        return;
    }
    if (status === 'authenticated' && !schoolId) {
        setError('School ID not found.');
        setLoading(false);
        return;
    }

    const fetchSchoolData = async () => {
      if (!schoolId) return;
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`/api/super-admin/schools/${schoolId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to fetch school data (status: ${response.status})`);
        }
        const data = await response.json();
        setFormData({
          name: data.name || '',
          location: data.location || '',
          schoolType: data.schoolType || '',
          contactEmail: data.contactEmail || '',
          contactPhone: data.contactPhone || '',
          isApproved: data.isApproved || false,
        });
      } catch (err) {
        setError(err.message || 'An error occurred while fetching school data.');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated' && session.user.role === 'SUPER_ADMIN' && schoolId) {
      fetchSchoolData();
    }
  }, [session, status, schoolId, router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!schoolId) {
        setError('Cannot submit: School ID is missing.');
        return;
    }
    setSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/super-admin/schools/${schoolId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update school (status: ${response.status})`);
      }

      const updatedSchool = await response.json();
      setSuccessMessage(`School "${updatedSchool.name}" updated successfully!`);
      // Optionally redirect after a delay or stay on page
      // setTimeout(() => router.push(`/super-dashboard/schools/${schoolId}`), 2000);

    } catch (err) {
      setError(err.message || 'An error occurred while updating the school.');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader title={`Edit School: ${formData.name || '...'}`}>
         <button
             onClick={() => router.back()}
             className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 text-sm font-medium"
           >
             Back
           </button>
      </PageHeader>

      <Card>
        {error && (
          <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-800 p-4 rounded-md shadow-sm">
            <p className="font-medium">Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}
        {successMessage && (
          <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-800 p-4 rounded-md shadow-sm">
            <p className="font-medium">Success</p>
            <p className="text-sm mt-1">{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* School Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              School Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* School Type */}
          <div>
            <label htmlFor="schoolType" className="block text-sm font-medium text-gray-700 mb-1">
              School Type
            </label>
            <select
              id="schoolType"
              name="schoolType"
              value={formData.schoolType}
              onChange={handleChange}
              required
              className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">Select Type</option>
              {Object.entries(SchoolType).map(([key, value]) => (
                <option key={key} value={value}>{value.charAt(0) + value.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>

          {/* Contact Email */}
          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Contact Email
            </label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Contact Phone */}
          <div>
            <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
              Contact Phone <span className="text-gray-500">(Optional)</span>
            </label>
            <input
              type="tel"
              id="contactPhone"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

           {/* Approval Status */}
           <div className="relative flex items-start">
             <div className="flex items-center h-5">
               <input
                 id="isApproved"
                 name="isApproved"
                 type="checkbox"
                 checked={formData.isApproved}
                 onChange={handleChange}
                 className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
               />
             </div>
             <div className="ml-3 text-sm">
               <label htmlFor="isApproved" className="font-medium text-gray-700">
                 Approved
               </label>
               <p className="text-gray-500">Check this box to approve the school's registration.</p>
             </div>
           </div>


          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-5 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()} // Or redirect to view page: router.push(`/super-dashboard/schools/${schoolId}`)
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex justify-center px-4 py-2 bg-indigo-600 text-white font-medium border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}