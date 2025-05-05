'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import PageHeader from '@/app/components/PageHeader';
import Card from '@/app/components/Card';

// Define SchoolType enum again or import from a shared location
const SchoolType = {
  PRIMARY: 'PRIMARY',
  SECONDARY: 'SECONDARY',
  COLLEGE: 'COLLEGE',
  UNIVERSITY: 'UNIVERSITY'
};

export default function ViewSchool() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const schoolId = params?.schoolId;

  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect if not authenticated or trying to access without ID
    if (status === 'unauthenticated') {
      router.push('/login'); // Or your login page
    }
    if (status === 'authenticated' && !schoolId) {
        setError('School ID not found.');
        setLoading(false);
        // Optionally redirect back
        // router.push('/super-dashboard');
        return;
    }

    const fetchSchoolDetails = async () => {
      if (!schoolId) return;
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`/api/super-admin/schools/${schoolId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to fetch school (status: ${response.status})`);
        }
        const data = await response.json();
        setSchool(data);
      } catch (err) {
        setError(err.message || 'An error occurred while fetching school details.');
        setSchool(null); // Clear potentially stale data
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated' && schoolId) {
      // Check if user is SUPER_ADMIN (or ADMIN of this school if you adjusted API logic)
      if (session.user.role === 'SUPER_ADMIN' /* || (session.user.role === 'ADMIN' && session.user.schoolId === schoolId) */) {
         fetchSchoolDetails();
      } else {
          setError('Unauthorized to view this school.');
          setLoading(false);
          // Optionally redirect
          // router.push('/dashboard');
      }
    }
  }, [session, status, schoolId, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader title={school ? `School Details: ${school.name}` : 'School Details'}>
        <div className="flex gap-2">
           <button
             onClick={() => router.back()}
             className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 text-sm font-medium"
           >
             Back
           </button>
           {school && session?.user?.role === 'SUPER_ADMIN' && ( // Only show Edit for Super Admin
             <Link
               href={`/super-dashboard/school/edit/${schoolId}`}
               className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
             >
               Edit School
             </Link>
           )}
        </div>
      </PageHeader>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 rounded-md shadow-sm">
          <p className="font-medium">Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {!school && !loading && !error && (
         <Card>
            <p className="text-center text-gray-500 py-8">School data could not be loaded.</p>
         </Card>
      )}

      {school && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"> {/* Use grid for layout */}

          {/* Column 1: Basic Info & Contact */}
          <div className="lg:col-span-2 space-y-6"> {/* Span 2 columns on larger screens */}
            <Card title="School Information">
              <dl className="divide-y divide-gray-200">
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">School Name</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{school.name}</dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Location</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{school.location}</dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">School Type</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                      {school.schoolType?.toLowerCase() || 'N/A'}
                    </span>
                  </dd>
                </div>
              </dl>
            </Card>

            <Card title="Contact Details">
              <dl className="divide-y divide-gray-200">
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Contact Email</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{school.contactEmail}</dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Contact Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{school.contactPhone || 'N/A'}</dd>
                </div>
              </dl>
            </Card>
          </div>

          {/* Column 2: Status & Timestamps */}
          <div className="lg:col-span-1 space-y-6">
             <Card title="Status & History">
                <dl className="divide-y divide-gray-200">
                   <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Approval Status</dt>
                    <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                      <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${school.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {school.isApproved ? 'Approved' : 'Pending Approval'}
                      </span>
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Registered On</dt>
                    <dd className="mt-1 text-sm text-gray-500 sm:mt-0 sm:col-span-2">
                      {new Date(school.createdAt).toLocaleString()}
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                    <dd className="mt-1 text-sm text-gray-500 sm:mt-0 sm:col-span-2">
                      {new Date(school.updatedAt).toLocaleString()}
                    </dd>
                  </div>
                  {/* Add more fields like User Count, Student Count here if available */}
                  {/* Example:
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Admin Users</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{school.userCount || 0}</dd>
                  </div>
                  */}
                </dl>
             </Card>
             {/* You could add another card here for related items like Admins or quick stats */}
          </div>

        </div>
      )}
    </div>
  );
}