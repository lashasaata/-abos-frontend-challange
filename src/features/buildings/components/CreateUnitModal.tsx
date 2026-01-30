import { useForm, useFieldArray } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBuildingUnits } from '../api';
import Modal from '../../../components/Modal';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface CreateUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildingId: string;
}

interface FormData {
  units: {
    unitNumber: string;
    floor: number;
  }[];
}

export default function CreateUnitModal({ isOpen, onClose, buildingId }: CreateUnitModalProps) {
  const queryClient = useQueryClient();
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      units: [{ unitNumber: '', floor: undefined }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "units"
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => createBuildingUnits(buildingId, data.units),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildingUnits', buildingId] });
      handleClose();
    },
  });

  const handleClose = () => {
    reset({ units: [{ unitNumber: '', floor: undefined }] });
    onClose();
  };

  const onSubmit = (data: FormData) => {
    // Ensure floors are numbers
    const formattedUnits = data.units.map(u => ({
      ...u,
      floor: Number(u.floor)
    }));
    mutation.mutate({ units: formattedUnits });
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Units">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-4 items-start">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Unit Number {index + 1}
                </label>
                <input
                  {...register(`units.${index}.unitNumber` as const, { required: 'Required' })}
                  className={cn(
                    "w-full rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2.5 outline-none transition",
                    errors.units?.[index]?.unitNumber 
                      ? "border-red-500 focus:ring-2 focus:ring-red-500" 
                      : "border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                  )}
                  placeholder="e.g. 101"
                />
              </div>

              <div className="w-24">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Floor
                </label>
                <input
                  type="number"
                  {...register(`units.${index}.floor` as const, { required: 'Required', valueAsNumber: true })}
                  className={cn(
                    "w-full rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2.5 outline-none transition",
                    errors.units?.[index]?.floor
                      ? "border-red-500 focus:ring-2 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                  )}
                  placeholder="1"
                />
              </div>

              <div className="pt-7">
                <button
                  type="button"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                  className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => append({ unitNumber: '', floor: undefined as unknown as number })}
          className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Another Unit
        </button>

        {mutation.error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                {(mutation.error as any).response?.data?.error?.message || 'Failed to create units'}
            </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
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
            Create {fields.length} Unit{fields.length !== 1 ? 's' : ''}
          </button>
        </div>
      </form>
    </Modal>
  );
}
