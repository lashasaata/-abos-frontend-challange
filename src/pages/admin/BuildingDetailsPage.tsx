import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBuildingById, getBuildingUnits, getPendingMemberships, verifyMembership, requestBuildingAccess, getMyMembershipStatus } from '../../features/buildings/api';
import CreateUnitModal from '../../features/buildings/components/CreateUnitModal';
import AddMemberModal from '../../features/buildings/components/AddMemberModal';
import { ArrowLeft, Building2, MapPin, Loader2, Home, Plus, Users, Check, X, Shield, UserPlus, Send } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface BuildingDetailsPageProps {
  forcedBuildingId?: string;
}

const requestSchema = z.object({
  unitId: z.string().min(1, 'Please select a unit'),
});

type RequestFormData = z.infer<typeof requestSchema>;

export default function BuildingDetailsPage({ forcedBuildingId }: BuildingDetailsPageProps) {
  const { buildingId: paramBuildingId } = useParams();
  const buildingId = forcedBuildingId || paramBuildingId;
  const navigate = useNavigate();
  const [isCreateUnitModalOpen, setCreateUnitModalOpen] = useState(false);
  const [isAddMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema)
  });

  const { data: building, isLoading: isBuildingLoading } = useQuery({
    queryKey: ['building', buildingId],
    queryFn: () => getBuildingById(buildingId!),
    enabled: !!buildingId,
  });

  const { data: units, isLoading: isUnitsLoading } = useQuery({
    queryKey: ['buildingUnits', buildingId],
    queryFn: () => getBuildingUnits(buildingId!),
    enabled: !!buildingId,
  });

  const { data: pendingMemberships } = useQuery({
    queryKey: ['pendingMemberships', buildingId],
    queryFn: () => getPendingMemberships(buildingId!),
    enabled: !!buildingId && (user?.role === 'building_admin' || user?.role === 'super_admin'),
  });

  const { data: myMembership, isLoading: isMembershipLoading } = useQuery({
    queryKey: ['myMembership', buildingId],
    queryFn: () => getMyMembershipStatus(buildingId!),
    enabled: !!buildingId && !!user,
    retry: false,
  });

  const verifyMutation = useMutation({
    mutationFn: ({ membershipId, status }: { membershipId: string, status: 'active' | 'rejected' }) => 
      verifyMembership(buildingId!, membershipId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingMemberships', buildingId] });
      queryClient.invalidateQueries({ queryKey: ['buildingUnits', buildingId] });
    }
  });

  const requestAccessMutation = useMutation({
    mutationFn: (unitId: string) => requestBuildingAccess(buildingId!, { unitId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myMembership', buildingId] });
    }
  });

  const onRequestSubmit = (data: RequestFormData) => {
    requestAccessMutation.mutate(data.unitId);
  };


  if (isBuildingLoading || isUnitsLoading || isMembershipLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  if (!building) {
    return <div className="text-center py-12">Building not found</div>;
  }

  // RESIDENT VIEW
  if (forcedBuildingId) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="mb-8">
           <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">My Unit</h1>
           <p className="text-gray-500">{building.name} • {building.address}</p>
        </div>

        {myMembership ? (
           <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-8 text-center">
                  <div className={`mx-auto h-20 w-20 rounded-full flex items-center justify-center mb-4 ${
                      myMembership.status === 'active' ? 'bg-green-50 dark:bg-green-900/20' : 
                      myMembership.status === 'pending' ? 'bg-yellow-50 dark:bg-yellow-900/20' : 
                      'bg-red-50 dark:bg-red-900/20'
                  }`}>
                      <Home className={`h-10 w-10 ${
                          myMembership.status === 'active' ? 'text-green-600' : 
                          myMembership.status === 'pending' ? 'text-yellow-600' : 
                          'text-red-600'
                      }`} />
                  </div>
                  
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {myMembership.unit ? `Unit ${myMembership.unit.unitNumber}` : 'Unit Assigned'}
                  </h2>
                  <p className="text-gray-500 mb-6">
                    {myMembership.unit ? `Floor ${myMembership.unit.floor}` : ''}
                  </p>

                  <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium ${
                        myMembership.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                        myMembership.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                        {myMembership.status === 'active' && <Check className="h-4 w-4 mr-2" />}
                        {myMembership.status.toUpperCase()}
                  </span>
              </div>
           </div>
        ) : (
          <div className="space-y-8">
             {/* No Access State */}
             <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                <Shield className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Unit Access</h3>
                <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                  You don't have access to any units in this building yet. Please request access below.
                </p>
             </div>

             {/* Request Access Form */}
             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Request Access</h2>
                  <p className="text-sm text-gray-500">Select your unit to submit an access request.</p>
                </div>

                <form onSubmit={handleSubmit(onRequestSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Unit
                    </label>
                    <select
                      {...register('unitId')}
                      className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a unit...</option>
                      {units?.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          Unit {unit.unitNumber} (Floor {unit.floor})
                        </option>
                      ))}
                    </select>
                    {errors.unitId && (
                      <p className="mt-1 text-sm text-red-600">{errors.unitId.message}</p>
                    )}
                  </div>

                  {requestAccessMutation.error && (
                      <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 rounded-lg">
                          {(requestAccessMutation.error as any).response?.data?.message || 'Failed to submit request'}
                      </div>
                  )}

                  <button
                    type="submit"
                    disabled={requestAccessMutation.isPending}
                    className="w-full flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {requestAccessMutation.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Request
                      </>
                    )}
                  </button>
                </form>
             </div>
          </div>
        )}
      </div>
    );
  }

  // ADMIN VIEW
  return (
    <div>
      <button 
        onClick={() => navigate('/dashboard/buildings')}
          className="flex items-center text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Buildings
        </button>
      

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-start justify-between">
            <div className="flex gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl h-fit">
                    <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{building.name}</h1>
                    <div className="flex items-center mt-2 text-gray-500 dark:text-gray-400">
                        <MapPin className="h-4 w-4 mr-1" />
                        {building.address}
                    </div>
                </div>
            </div>
            <div className="text-right flex flex-col items-end gap-3">
                 <div>
                    <p className="text-xs text-gray-400">Building ID</p>
                    <p className="text-sm font-mono text-gray-600 dark:text-gray-300">{building.id}</p>
                 </div>
                 
                 {myMembership ? (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        myMembership.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                        myMembership.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                        {myMembership.status === 'active' && <Check className="h-3 w-3 mr-1" />}
                        {myMembership.status.charAt(0).toUpperCase() + myMembership.status.slice(1)}
                        {myMembership.unit && ` - Unit ${myMembership.unit.unitNumber}`}
                    </span>
                 ) : forcedBuildingId ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        No Active Membership
                    </span>
                 ) : null}
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
             <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Units</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{units?.length || 0}</p>
             </div>
             {/* Placeholders for future stats */}
             <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Occupancy Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">--%</p>
             </div>
        </div>
      </div>

      {pendingMemberships && pendingMemberships.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-yellow-200 dark:border-yellow-900/50 overflow-hidden mb-6">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-100 dark:border-yellow-900/30 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Pending Membership Requests
                </h3>
                <span className="bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 text-xs font-medium px-2 py-0.5 rounded-full">
                    {pendingMemberships.length}
                </span>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {pendingMemberships.map((membership) => (
                    <div key={membership.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                <Users className="h-4 w-4 text-gray-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {membership.user?.email || 'Unknown User'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Requesting: {membership.role} • {new Date(membership.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => verifyMutation.mutate({ membershipId: membership.id, status: 'active' })}
                                className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                title="Approve"
                            >
                                <Check className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => verifyMutation.mutate({ membershipId: membership.id, status: 'rejected' })}
                                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Reject"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Units</h2>
            <div className="flex gap-2">
              {!forcedBuildingId && (
                <>
                  <button 
                    onClick={() => setAddMemberModalOpen(true)}
                    className="flex items-center px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <UserPlus className="h-4 w-4 mr-1.5" />
                    Add Member
                  </button>
                  <button 
                    onClick={() => setCreateUnitModalOpen(true)}
                    className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    Add Unit
                  </button>
                </>
              )}
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4">Unit Number</th>
                <th className="px-6 py-4">Floor</th>
                <th className="px-6 py-4">Status</th>
                {forcedBuildingId && <th className="px-6 py-4">Action</th>}
                <th className="px-6 py-4">Residents</th>
              </tr>
            </thead>
            <tbody>
              {units?.map((unit) => {
                const isMyUnit = myMembership?.unitId === unit.id;
                
                // For residents, we rely on myMembership to check for pending requests
                const isPendingForMe = myMembership?.unitId === unit.id && myMembership?.status === 'pending';
                // isRequested logic removed for residents since they rely on myMembership

                return (
                  <tr key={unit.id} className={`border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${isMyUnit ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      <div className="flex items-center">
                          <Home className={`h-4 w-4 mr-2 ${isMyUnit ? 'text-blue-600' : 'text-gray-400'}`} />
                          {unit.unitNumber}
                          {isMyUnit && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">My Unit</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">{unit.floor}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          Active
                      </span>
                    </td>
                    {forcedBuildingId && (
                      <td className="px-6 py-4">
                        {!myMembership ? (
                           <button
                             onClick={() => requestAccessMutation.mutate(unit.id)}
                             disabled={requestAccessMutation.isPending}
                             className="text-xs px-3 py-1.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                           >
                             {requestAccessMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Request Access'}
                           </button>
                        ) : isPendingForMe ? (
                          <span className="text-xs text-yellow-600 font-medium">Request Pending</span>
                        ) : isMyUnit && myMembership.status === 'active' ? (
                          <span className="text-xs text-green-600 font-medium">Access Granted</span>
                        ) : (
                           <span className="text-xs text-gray-400">--</span>
                        )}
                      </td>
                    )}
                    <td className="px-6 py-4 text-gray-500">
                      --
                    </td>
                  </tr>
                );
              })}
              {units?.length === 0 && (
                <tr>
                    <td colSpan={forcedBuildingId ? 5 : 4} className="px-6 py-8 text-center text-gray-500">
                        No units found in this building.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateUnitModal 
        isOpen={isCreateUnitModalOpen} 
        onClose={() => setCreateUnitModalOpen(false)} 
        buildingId={building.id}
      />
      
      {units && (
        <AddMemberModal
            isOpen={isAddMemberModalOpen}
            onClose={() => setAddMemberModalOpen(false)}
            buildingId={building.id}
            units={units}
        />
      )}
    </div>
  );
}
