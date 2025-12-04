import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { UserCheck, UserX, Clock, Mail, User as UserIcon } from 'lucide-react';

export default function AdminPendingUsersPage() {
  const pendingUsers = useQuery(api.admin.getPendingUsers);
  const approveUser = useMutation(api.admin.approveUser);
  const updateUserRole = useMutation(api.admin.updateUserRole);
  const deleteUser = useMutation(api.admin.deleteUser);

  // Track role changes for each user
  const [userRoles, setUserRoles] = useState<Record<string, string>>({});

  const handleRoleChange = (userId: string, newRole: string) => {
    setUserRoles(prev => ({ ...prev, [userId]: newRole }));
  };

  const handleApprove = async (userId: string, name: string) => {
    try {
      // Update role if it was changed
      const newRole = userRoles[userId];
      if (newRole) {
        await updateUserRole({ userId: userId as any, role: newRole as any });
      }
      
      // Approve the user
      await approveUser({ userId: userId as any });
      alert(`${name} has been approved!`);
    } catch (err) {
      console.error(err);
      alert('Failed to approve user');
    }
  };

  const handleReject = async (userId: string, name: string) => {
    if (!confirm(`Reject and delete registration for ${name}?`)) return;
    try {
      await deleteUser({ userId: userId as any });
      alert('User registration rejected');
    } catch (err) {
      console.error(err);
      alert('Failed to reject user');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6 text-orange-600" />
            Pending Employee Approvals
          </h1>

          {!pendingUsers || pendingUsers.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No pending approvals</p>
              <p className="text-sm text-gray-400 mt-1">All employee registrations have been processed</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingUsers.map((user) => (
                <div key={user._id} className="border border-orange-200 bg-orange-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{user.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-orange-200 text-orange-700 rounded-full text-xs font-bold">
                      Pending Approval
                    </span>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assign Role
                    </label>
                    <select
                      value={userRoles[user._id] || user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white"
                    >
                      <option value="employee">Employee</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      You can change the role before approving the user
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(user._id, user.name)}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <UserCheck className="w-5 h-5" />
                      Approve{userRoles[user._id] && ` as ${userRoles[user._id].replace('_', ' ')}`}
                    </button>
                    <button
                      onClick={() => handleReject(user._id, user.name)}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <UserX className="w-5 h-5" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
