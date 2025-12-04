import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { CheckCircle, XCircle, Clock, User } from 'lucide-react';

export default function AdminAbsencePage() {
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userId = user?._id;

  const pendingRequests = useQuery(api.absence.getAllPendingRequests);
  const approveRequest = useMutation(api.absence.approveAbsenceRequest);
  const rejectRequest = useMutation(api.absence.rejectAbsenceRequest);

  const handleApprove = async (requestId: string) => {
    if (!userId) return;
    try {
      await approveRequest({ requestId: requestId as any, approvedBy: userId });
      alert('Request approved!');
    } catch (err) {
      console.error(err);
      alert('Failed to approve');
    }
  };

  const handleReject = async (requestId: string) => {
    if (!userId) return;
    try {
      await rejectRequest({ requestId: requestId as any, approvedBy: userId });
      alert('Request rejected');
    } catch (err) {
      console.error(err);
      alert('Failed to reject');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            Pending Leave Requests
          </h1>

          {!pendingRequests || pendingRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-12">No pending requests</p>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{request.userName}</h3>
                        <p className="text-sm text-gray-500">{request.userEmail}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold capitalize">
                      {request.type} Leave
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">Start Date:</span>
                      <p className="font-medium">{new Date(request.startDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">End Date:</span>
                      <p className="font-medium">{new Date(request.endDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="text-gray-500 text-sm">Reason:</span>
                    <p className="mt-1 text-gray-700">{request.reason}</p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(request._id)}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(request._id)}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
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
