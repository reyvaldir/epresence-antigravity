import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useUser } from '@clerk/clerk-react';
import { Users, Trash2, AlertTriangle, X } from 'lucide-react';
import { GET_ALL_USERS, UPDATE_USER_ROLE, DELETE_USER } from '../graphql/operations';

export default function AdminEmployeesPage() {
  const { user: currentUser } = useUser();
  const { data: userData, refetch } = useQuery<any>(GET_ALL_USERS);
  
  const [updateRole] = useMutation(UPDATE_USER_ROLE);
  const [deleteUser] = useMutation(DELETE_USER);

  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; userId: string; userName: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const allUsers = userData?.users || [];

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateRole({ variables: { userId, role: newRole } });
      alert('Role updated successfully!');
      refetch();
    } catch (err) {
      console.error(err);
      alert('Failed to update role');
    }
  };

  const confirmDelete = (userId: string, userName: string) => {
    setDeleteConfirmation({ isOpen: true, userId, userName });
  };

  const handleDelete = async () => {
    if (!deleteConfirmation) return;

    const { userId } = deleteConfirmation;
    setDeletingId(userId);
    setDeleteConfirmation(null); // Close modal immediately

    try {
      await deleteUser({ variables: { userId } });
      alert('User deleted successfully');
      refetch();
    } catch (err: any) {
      console.error('Delete failed:', err);
      alert(`Failed to delete user: ${err.message || 'Unknown error'}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Employee Management
          </h1>

          {!allUsers || allUsers.length === 0 ? (
            <p className="text-gray-500 text-center py-12">No employees yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((user: any) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{user.name}</td>
                      <td className="py-3 px-4 text-gray-600">{user.email}</td>
                      <td className="py-3 px-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="px-3 py-1 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="employee">Employee</option>
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => confirmDelete(user.id, user.name)}
                            disabled={currentUser?.id === user.id || deletingId === user.id}
                            className={`p-2 rounded-lg transition-colors ${
                              currentUser?.id === user.id 
                                ? 'text-gray-300 cursor-not-allowed' 
                                : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                            }`}
                            title={currentUser?.id === user.id ? "Cannot delete yourself" : "Delete user"}
                          >
                            {deletingId === user.id ? (
                              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 text-red-600">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Delete User?</h3>
              </div>
              <button 
                onClick={() => setDeleteConfirmation(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{deleteConfirmation.userName}</strong>? 
              This action will remove all their attendance records, schedules, and data permanently.
              <br/><br/>
              <span className="font-medium text-red-600">This action cannot be undone.</span>
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition-colors shadow-sm"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
