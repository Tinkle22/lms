/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/app/components/PageHeader';
import Card from '@/app/components/Card';
import Modal from '@/app/components/Modal'; // Assuming you have a Modal component

export default function ManageSchools() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [processingAction, setProcessingAction] = useState(null); // { type: 'delete' | 'password', id: schoolId }
  
  // State for password change modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedSchoolForPassword, setSelectedSchoolForPassword] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState('');

  // State for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSchoolForDelete, setSelectedSchoolForDelete] = useState(null);

  const fetchSchools = useCallback(async () => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const response = await fetch('/api/super-admin/schools'); // Fetch all schools
      if (!response.ok) {
        throw new Error('Failed to fetch schools');
      }
      const data = await response.json();
      setSchools(data.schools || []);
    } catch (error) {
      setError(error.message || 'An error occurred while fetching schools');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'SUPER_ADMIN') {
      router.push('/dashboard');
    }
    if (status === 'authenticated' && session?.user?.role === 'SUPER_ADMIN') {
      fetchSchools();
    }
  }, [session, status, router, fetchSchools]);

  const openDeleteModal = (school) => {
    setSelectedSchoolForDelete(school);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setSelectedSchoolForDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedSchoolForDelete) return;
    
    const schoolId = selectedSchoolForDelete.id;
    const schoolName = selectedSchoolForDelete.name;
    setProcessingAction({ type: 'delete', id: schoolId });
    setError('');
    setSuccessMessage('');
    closeDeleteModal();

    try {
      const response = await fetch(`/api/super-admin/schools/${schoolId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete school');
      }

      setSchools(schools.filter(school => school.id !== schoolId));
      setSuccessMessage(`School "${schoolName}" has been deleted successfully.`);
    } catch (error) {
      setError(error.message);
    } finally {
      setProcessingAction(null);
    }
  };

  const openPasswordModal = (school) => {
    setSelectedSchoolForPassword(school);
    setNewPassword('');
    setPasswordChangeError('');
    setIsPasswordModalOpen(true);
  };

  const closePasswordModal = () => {
    setSelectedSchoolForPassword(null);
    setIsPasswordModalOpen(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!selectedSchoolForPassword || !newPassword) return;

    const schoolId = selectedSchoolForPassword.id;
    const schoolName = selectedSchoolForPassword.name;
    setProcessingAction({ type: 'password', id: schoolId });
    setPasswordChangeError('');

    try {
      const response = await fetch(`/api/super-admin/schools/${schoolId}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password');
      }

      setSuccessMessage(`Password for admin of school "${schoolName}" has been changed successfully.`);
      closePasswordModal();
    } catch (error) {
      setPasswordChangeError(error.message);
    } finally {
      setProcessingAction(null);
    }
  };

  if (status === 'loading' || (loading && schools.length === 0)) {
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
    <div className="space-y-6">
      <PageHeader title="Manage Schools" />

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
           <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      )}

      <Card>
        <h3 className="text-lg font-medium mb-4">All Registered Schools</h3>
        {schools.length === 0 && !loading ? (
          <div className="text-center py-12 text-gray-500">
            No schools found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School Name</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {schools.map((school) => (
                  <tr key={school.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{school.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        school.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {school.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{school.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{school.schoolType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{school.userCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{school.studentCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => openPasswordModal(school)}
                        disabled={processingAction?.id === school.id}
                        className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                        title="Change Admin Password"
                      >
                        {processingAction?.type === 'password' && processingAction?.id === school.id ? '...' : 'Password'}
                      </button>
                      <button
                        onClick={() => openDeleteModal(school)}
                        disabled={processingAction?.id === school.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        title="Delete School"
                      >
                         {processingAction?.type === 'delete' && processingAction?.id === school.id ? '...' : 'Delete'}
                      </button>
                       {!school.isApproved && (
                         <button
                           onClick={() => router.push('/super-dashboard/approvals')} // Or implement approve directly
                           className="text-green-600 hover:text-green-900"
                           title="Approve School"
                         >
                           Approve
                         </button>
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} title="Confirm Deletion">
        <p className="text-sm text-gray-500 mb-4">
          Are you sure you want to delete the school "{selectedSchoolForDelete?.name}"? This action will also delete all associated users, students, and data. This cannot be undone.
        </p>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={closeDeleteModal}
            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal isOpen={isPasswordModalOpen} onClose={closePasswordModal} title={`Change Admin Password for ${selectedSchoolForPassword?.name}`}>
        <form onSubmit={handleChangePassword}>
          <div className="mb-4">
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter new password (min 8 characters)"
            />
            {passwordChangeError && <p className="text-red-500 text-xs mt-1">{passwordChangeError}</p>}
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={closePasswordModal}
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newPassword || newPassword.length < 8 || processingAction?.type === 'password'}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {processingAction?.type === 'password' ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}