import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useRoleBasedData = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: roleApplications, isLoading: applicationsLoading } = useQuery({
    queryKey: ['roleApplications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('certificate_applications')
        .select('*');
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const updateApplicationStatus = useMutation({
    mutationFn: async ({
      applicationId,
      status,
      rejectionReason,
    }: {
      applicationId: string;
      status: string;
      rejectionReason?: string;
    }) => {
      const updates: any = { status };
      if (rejectionReason) {
        updates.rejection_reason = rejectionReason;
      }
      const { data, error } = await supabase
        .from('certificate_applications')
        .update(updates)
        .eq('id', applicationId);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roleApplications', user?.id] });
    },
  });

  return {
    roleApplications,
    applicationsLoading,
    updateApplicationStatus,
  };
};

export const useRoleManagement = () => {
  const queryClient = useQueryClient();

  // Fetch all users from profiles table
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  // Assign role mutation
  const assignRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { data, error } = await supabase
        .from('user_roles')
        .insert([
          { user_id: userId, role: role as any }
        ]);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['userRoles'] });
    }
  });

  return {
    users,
    usersLoading,
    assignRole
  };
};
