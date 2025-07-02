
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface CertificateApplication {
  id: string;
  application_id: string;
  certificate_type: 'caste' | 'income' | 'domicile' | 'residence';
  full_name: string;
  father_name: string;
  date_of_birth: string;
  address: string;
  phone_number: string;
  email: string;
  purpose: string;
  additional_info?: string;
  status: 'pending' | 'document_verification' | 'staff_review' | 'awaiting_sdo' | 'approved' | 'rejected' | 'additional_info_needed';
  current_stage?: string;
  progress?: number;
  workflow_stage?: string;
  created_at: string;
  updated_at: string;
  rejection_reason?: string;
  clerk_verified_at?: string;
  clerk_verified_by?: string;
  staff_reviewed_at?: string;
  staff_reviewed_by?: string;
  sdo_approved_at?: string;
  sdo_approved_by?: string;
  additional_info_requested?: string;
}

// Generate unique application ID
const generateApplicationId = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `CERT${year}${timestamp}${random}`;
};

export const useCertificateData = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's applications
  const { data: applications, isLoading } = useQuery({
    queryKey: ['applications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('certificate_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as CertificateApplication[];
    },
    enabled: !!user?.id
  });

  // Submit new application
  const submitApplication = useMutation({
    mutationFn: async (applicationData: Omit<CertificateApplication, 'id' | 'application_id' | 'status' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Generate unique application ID
      const applicationId = await generateApplicationId();

      const { data, error } = await supabase
        .from('certificate_applications')
        .insert({
          ...applicationData,
          user_id: user.id,
          application_id: applicationId,
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      toast.success('Application submitted successfully!');
    },
    onError: (error) => {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again.');
    }
  });

  return {
    applications,
    isLoading,
    submitApplication
  };
};

// Hook for role-based data access
export const useRoleBasedData = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch applications based on user role
  const { data: roleApplications, isLoading: applicationsLoading } = useQuery({
    queryKey: ['roleApplications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('certificate_applications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as CertificateApplication[];
    },
    enabled: !!user?.id
  });

  // Update application status with role-specific workflow
  const updateApplicationStatus = useMutation({
    mutationFn: async ({ 
      applicationId, 
      status, 
      rejectionReason,
      additionalInfo 
    }: { 
      applicationId: string; 
      status: CertificateApplication['status'];
      rejectionReason?: string;
      additionalInfo?: string;
    }) => {
      const updateData: any = { status };
      
      if (rejectionReason) {
        updateData.rejection_reason = rejectionReason;
      }
      
      if (additionalInfo) {
        updateData.additional_info_requested = additionalInfo;
      }

      // Add role-specific tracking
      if (status === 'document_verification') {
        updateData.clerk_verified_at = new Date().toISOString();
        updateData.clerk_verified_by = user?.id;
      } else if (status === 'staff_review') {
        updateData.staff_reviewed_at = new Date().toISOString();
        updateData.staff_reviewed_by = user?.id;
      } else if (status === 'approved') {
        updateData.sdo_approved_at = new Date().toISOString();
        updateData.sdo_approved_by = user?.id;
      }

      const { data, error } = await supabase
        .from('certificate_applications')
        .update(updateData)
        .eq('id', applicationId)
        .select()
        .single();
      
      if (error) throw error;

      // If approved, create certificate
      if (status === 'approved') {
        const { error: certError } = await supabase
          .from('certificates')
          .insert({
            application_id: applicationId,
            certificate_number: `CERT${new Date().getFullYear()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
            certificate_type: data.certificate_type,
            issued_to: data.full_name,
            digital_signature: `DS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          });
        
        if (certError) throw certError;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roleApplications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      toast.success('Application status updated successfully!');
    },
    onError: (error) => {
      console.error('Error updating application:', error);
      toast.error('Failed to update application status.');
    }
  });

  return {
    roleApplications,
    applicationsLoading,
    updateApplicationStatus
  };
};

// Hook for SDO role management
export const useRoleManagement = () => {
  const queryClient = useQueryClient();

  // Fetch all users for role assignment
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles (role)
        `);
      
      if (error) throw error;
      return data;
    }
  });

  // Assign role to user
  const assignRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      // First check if role already exists
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .eq('role', role)
        .single();

      if (existingRole) {
        throw new Error('User already has this role');
      }

      // Use type assertion to bypass TypeScript enum restriction
      const { data, error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role as any
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      toast.success('Role assigned successfully!');
    },
    onError: (error) => {
      console.error('Error assigning role:', error);
      toast.error('Failed to assign role.');
    }
  });

  return {
    users,
    usersLoading,
    assignRole
  };
};
