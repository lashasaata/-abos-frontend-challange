import { useQuery } from '@tanstack/react-query';
import { getBuildings } from '../../features/buildings/api';
import { Plus, Building2, MapPin, Loader2 } from 'lucide-react';

export default function BuildingsPage() {
  const { data: buildings, isLoading } = useQuery({
    queryKey: ['buildings'],
    queryFn: getBuildings,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Buildings</h1>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="h-5 w-5 mr-2" />
          Add Building
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {buildings?.map((building) => (
          <div key={building.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">{building.name}</h3>
            <div className="flex items-center mt-2 text-gray-500 dark:text-gray-400 text-sm">
              <MapPin className="h-4 w-4 mr-1" />
              {building.address}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <span className="text-xs text-gray-400">ID: {building.id.slice(0, 8)}...</span>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View Details</button>
            </div>
          </div>
        ))}
        {buildings?.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
                No buildings found. Create one to get started.
            </div>
        )}
      </div>
    </div>
  );
}
