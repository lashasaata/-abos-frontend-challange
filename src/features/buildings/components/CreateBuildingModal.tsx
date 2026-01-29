import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBuilding } from '../api';
import Modal from '../../../components/Modal';
import { Loader2 } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface CreateBuildingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  name: string;
  address: string;
}

export default function CreateBuildingModal({ isOpen, onClose }: CreateBuildingModalProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const mutation = useMutation({
    mutationFn: createBuilding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      reset();
      onClose();
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Building">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Building Name</label>
          <input
            {...register('name', { required: 'Building name is required' })}
            className={cn(
              "w-full rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2.5 outline-none transition",
              errors.name 
                ? "border-red-500 focus:ring-2 focus:ring-red-500" 
                : "border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
            )}
            placeholder="e.g. Sunset Apartments"
          />
          {errors.name && (
            <span className="text-xs text-red-500 mt-1 block">{errors.name.message}</span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
          <textarea
            {...register('address', { required: 'Address is required' })}
            rows={3}
            className={cn(
              "w-full rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2.5 outline-none transition resize-none",
              errors.address
                ? "border-red-500 focus:ring-2 focus:ring-red-500"
                : "border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
            )}
            placeholder="e.g. 123 Main St, City, State 12345"
          />
          {errors.address && (
            <span className="text-xs text-red-500 mt-1 block">{errors.address.message}</span>
          )}
        </div>

        {mutation.error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                {(mutation.error as any).response?.data?.error?.message || 'Failed to create building'}
            </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {mutation.isPending && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
            Create Building
          </button>
        </div>
      </form>
    </Modal>
  );
}
