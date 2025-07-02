
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DocumentUpload {
  file: File;
  documentType: string;
  documentName: string;
}

export const useDocumentUpload = () => {
  const [uploading, setUploading] = useState(false);

  const uploadDocument = async (applicationId: string, document: DocumentUpload) => {
    setUploading(true);
    
    try {
      const fileExt = document.file.name.split('.').pop();
      const fileName = `${applicationId}/${document.documentType}_${Date.now()}.${fileExt}`;
      
      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('certificate-documents')
        .upload(fileName, document.file);
      
      if (uploadError) throw uploadError;
      
      // Save document info to database
      const { error: dbError } = await supabase
        .from('application_documents')
        .insert({
          application_id: applicationId,
          document_name: document.documentName,
          document_type: document.documentType,
          file_path: uploadData.path,
          file_size: document.file.size
        });
      
      if (dbError) throw dbError;
      
      toast.success('Document uploaded successfully!');
      return uploadData.path;
      
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
      throw error;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadDocument,
    uploading
  };
};
