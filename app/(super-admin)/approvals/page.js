'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/app/components/PageHeader';
import Card from '@/app/components/Card';
import Link from 'next/link'; // Import Link

export default function SchoolApprovals() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pendingSchools, setPendingSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingApproval, setProcessingApproval] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Redirect if not super admin
    if (status === 'authenticated' && session?.user?.role !== 'SUPER_ADMIN') {
      router.push('/dashboard');
    }

    const fetchPendingSchools = async () => {
      try {
        const response = await fetch('/api/super-admin/schools?approvalStatus=pending');
        if (!response.ok) {
          throw new Error('Failed to fetch pending schools');
        }
        const data = await response.json();
        setPendingSchools(data.schools || []);
      } catch (error) {
        setError(error.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated' && session?.user?.role === 'SUPER_ADMIN') {
      fetchPendingSchools();
    }
  }, [session, status, router]);

  const handleApprove = async (schoolId, schoolName) => {
    setProcessingApproval(schoolId);
    setError('');
    setSuccessMessage('');
    
    try {
      const response = await fetch('/api/super-admin/schools/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schoolId }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to approve school');
      }

      // Remove the approved school from the list
      setPendingSchools(pendingSchools.filter(school => school.id !== schoolId));
      
      // Show success message with email status
      setSuccessMessage(
        `School "${schoolName}" has been approved successfully. ${
          data.emailSent 
            ? 'A notification email has been sent to the school administrator.' 
            : 'No email notification was sent (admin email not found).'
        }`
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setProcessingApproval(null);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (status === 'authenticated' && session?.user?.role !== 'SUPER_ADMIN') {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="space-y-8 p-4 md:p-6"> {/* Added padding */}
      <PageHeader title="School Approval Requests" />

      {/* Error Notification */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 rounded-md shadow-sm flex items-start space-x-3"> {/* Adjusted colors/padding */}
          <div className="flex-shrink-0 pt-0.5">
            <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-800 p-4 rounded-md shadow-sm flex items-start space-x-3"> {/* Adjusted colors/padding */}
          <div className="flex-shrink-0 pt-0.5">
            <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
             <p className="text-sm font-medium">Success</p>
             <p className="text-sm mt-1">{successMessage}</p>
          </div>
        </div>
      )}

      <Card>
        <h3 className="text-xl font-semibold text-gray-800 mb-5">Pending School Approvals</h3> {/* Adjusted heading style */}
        {pendingSchools.length === 0 ? (
          <div className="text-center py-16"> {/* Increased padding */}
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pending approvals</h3>
            <p className="mt-1 text-sm text-gray-500">All school registration requests have been processed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-md"> {/* Added border and rounded */}
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {/* Adjusted padding and text style for headers */}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    School Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registered On
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingSchools.map((school, index) => (
                  <tr key={school.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors duration-150`}> {/* Added zebra striping and hover */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center ring-1 ring-blue-300"> {/* Adjusted avatar style */}
                            <span className="text-blue-700 font-semibold text-sm">
                              {school.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{school.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{school.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                        {school.schoolType.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{school.contactEmail}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"> {/* Lighter text for date */}
                      {new Date(school.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3"> {/* Added space */}
                      {/* Improved Button Styles */}
                      <button
                        onClick={() => handleApprove(school.id, school.name)}
                        disabled={processingApproval === school.id}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingApproval === school.id ? (
                           <>
                             <svg className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-white" /* ... spinner svg ... */ >
                                {/* ... spinner paths ... */}
                             </svg>
                             Approving...
                           </>
                        ) : (
                          'Approve'
                        )}
                      </button>
                      <Link
                        href={`/super-dashboard/schools/${school.id}`} // Use Link for navigation
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        View Details
                      </Link>
                      {/* Add a Reject button if needed */}
                      {/* <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                        Reject
                      </button> */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}