import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getBuildingById, getBuildingUnits } from '../../features/buildings/api';
import CreateUnitModal from '../../features/buildings/components/CreateUnitModal';
import { ArrowLeft, Building2, MapPin, Loader2, Home, Plus } from 'lucide-react';

export default function BuildingDetailsPage() {
  const { buildingId } = useParams();
  const navigate = useNavigate();
  const [isCreateUnitModalOpen, setCreateUnitModalOpen] = useState(false);

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

  if (isBuildingLoading || isUnitsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  if (!building) {
    return <div className="text-center py-12">Building not found</div>;
  }

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
            <div className="text-right">
                 <p className="text-xs text-gray-400">Building ID</p>
                 <p className="text-sm font-mono text-gray-600 dark:text-gray-300">{building.id}</p>
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

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Units</h2>
            <button 
              onClick={() => setCreateUnitModalOpen(true)}
              className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Unit
            </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4">Unit Number</th>
                <th className="px-6 py-4">Floor</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Residents</th>
              </tr>
            </thead>
            <tbody>
              {units?.map((unit) => (
                <tr key={unit.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    <div className="flex items-center">
                        <Home className="h-4 w-4 mr-2 text-gray-400" />
                        {unit.unitNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4">{unit.floor}</td>
                  <td className="px-6 py-4">
                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        Active
                     </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    --
                  </td>
                </tr>
              ))}
              {units?.length === 0 && (
                <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
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
    </div>
  );
}
