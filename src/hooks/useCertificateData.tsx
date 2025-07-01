
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
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  current_stage?: string;
  progress?: number;
  created_at: string;
  updated_at: string;
  rejection_reason?: string;
}

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

      // Generate application ID
      const { data: appId, error: idError } = await supabase
        .rpc('generate_application_id');
      
      if (idError) throw idError;

      const { data, error } = await supabase
        .from('certificate_applications')
        .insert({
          ...applicationData,
          user_id: user.id,
          application_id: appId,
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

// Hook for admin/officer data
export const useAdminData = () => {
  const queryClient = useQueryClient();

  // Fetch all applications for admin view
  const { data: allApplications, isLoading: applicationsLoading } = useQuery({
    queryKey: ['allApplications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('certificate_applications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as CertificateApplication[];
    }
  });

  // Update application status
  const updateApplicationStatus = useMutation({
    mutationFn: async ({ 
      applicationId, 
      status, 
      rejectionReason 
    }: { 
      applicationId: string; 
      status: 'pending' | 'under_review' | 'approved' | 'rejected';
      rejectionReason?: string;
    }) => {
      const updateData: any = { status };
      if (rejectionReason) {
        updateData.rejection_reason = rejectionReason;
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
      queryClient.invalidateQueries({ queryKey: ['allApplications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      toast.success('Application status updated successfully!');
    },
    onError: (error) => {
      console.error('Error updating application:', error);
      toast.error('Failed to update application status.');
    }
  });

  return {
    allApplications,
    applicationsLoading,
    updateApplicationStatus
  };
};
