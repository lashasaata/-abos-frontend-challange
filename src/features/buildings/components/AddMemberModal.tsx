import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, UserPlus, Search } from 'lucide-react';
import { assignUserToUnit } from '../api';
import { getUsers } from '../../users/api';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Unit, User } from '../../../types';
import Modal from '../../../components/Modal';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildingId: string;
  units: Unit[];
}

const addMemberSchema = z.object({
  unitId: z.string().min(1, 'Unit is required'),
  userId: z.string().min(1, 'User is required'),
  role: z.enum(['resident', 'owner', 'admin']),
});

type AddMemberFormData = z.infer<typeof addMemberSchema>;

export default function AddMemberModal({ isOpen, onClose, buildingId, units }: AddMemberModalProps) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<AddMemberFormData>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      role: 'resident',
    },
  });

  const selectedUserId = watch('userId');

  const { data: users, isLoading: isUsersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const mutation = useMutation({
    mutationFn: (data: AddMemberFormData) => assignUserToUnit(buildingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildingUnits', buildingId] });
      onClose();
    },
  });

  const filteredUsers = users?.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.id.includes(searchTerm)
  );

  const onSubmit = (data: AddMemberFormData) => {
    mutation.mutate(data);
  };

  const handleUserSelect = (user: User) => {
    setValue('userId', user.id);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Member to Unit">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Unit
          </label>
          <select
            {...register('unitId')}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a unit</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                Unit {unit.unitNumber} (Floor {unit.floor})
              </option>
            ))}
          </select>
          {errors.unitId && (
            <p className="mt-1 text-sm text-red-600">{errors.unitId.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Role
          </label>
          <select
            {...register('role')}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="resident">Resident</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
          </select>
          {errors.role && (
            <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            User
          </label>
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search user by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-48 overflow-y-auto">
            {isUsersLoading ? (
              <div className="p-4 text-center text-gray-500">Loading users...</div>
            ) : filteredUsers?.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No users found</div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredUsers?.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleUserSelect(user)}
                    className={`p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between ${
                      selectedUserId === user.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user.email}</p>
                      <p className="text-xs text-gray-500">{user.role}</p>
                    </div>
                    {selectedUserId === user.id && (
                      <UserPlus className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <input type="hidden" {...register('userId')} />
          {errors.userId && (
            <p className="mt-1 text-sm text-red-600">{errors.userId.message}</p>
          )}
        </div>

        {mutation.error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 rounded-lg">
                {(mutation.error as any).response?.data?.message || 'Failed to add member'}
            </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center"
          >
            {mutation.isPending && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
            Add Member
          </button>
        </div>
      </form>
    </Modal>
  );
}
