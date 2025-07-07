
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useCertificateData = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: applications, isLoading } = useQuery({
    queryKey: ['applications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('certificate_applications')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const submitApplication = useMutation({
    mutationFn: async (applicationData: {
      certificate_type: 'caste' | 'income' | 'domicile' | 'residence';
      full_name: string;
      father_name: string;
      date_of_birth: string;
      address: string;
      phone_number: string;
      email: string;
      purpose: string;
      additional_info?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data: applicationId } = await supabase.rpc('generate_application_id');
      
      const { data, error } = await supabase
        .from('certificate_applications')
        .insert([
          {
            ...applicationData,
            user_id: user.id,
            application_id: applicationId,
            status: 'pending'
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications', user?.id] });
    },
  });

  return {
    applications,
    isLoading,
    submitApplication,
  };
};

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
      additionalInfo,
    }: {
      applicationId: string;
      status: string;
      rejectionReason?: string;
      additionalInfo?: string;
    }) => {
      const updates: any = { status };
      if (rejectionReason) {
        updates.rejection_reason = rejectionReason;
      }
      if (additionalInfo) {
        updates.additional_info = additionalInfo;
      }
      
      // Set timestamp fields based on status
      if (status === 'document_verification') {
        updates.clerk_verified_at = new Date().toISOString();
      } else if (status === 'staff_review') {
        updates.staff_reviewed_at = new Date().toISOString();
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
