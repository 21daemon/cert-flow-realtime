
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Eye, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { generateCertificatePDF } from '@/utils/pdfGenerator';
import { toast } from 'sonner';

interface Certificate {
  id: string;
  certificate_number: string;
  certificate_type: string;
  issued_to: string;
  issued_date: string;
  digital_signature: string;
  application_id: string;
}

interface Application {
  id: string;
  full_name: string;
  father_name: string;
  date_of_birth: string;
  address: string;
  certificate_type: string;
}

export const CertificateViewer = () => {
  const { user } = useAuth();
  const [viewingCertificate, setViewingCertificate] = useState<string | null>(null);

  // Fetch user's certificates
  const { data: certificates, isLoading } = useQuery({
    queryKey: ['certificates', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          certificate_applications!inner(
            user_id,
            full_name,
            father_name,
            date_of_birth,
            address,
            certificate_type
          )
        `)
        .eq('certificate_applications.user_id', user.id)
        .order('issued_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const handleDownloadCertificate = async (certificate: any) => {
    try {
      const application = certificate.certificate_applications;
      
      const pdf = generateCertificatePDF({
        certificateNumber: certificate.certificate_number,
        fullName: application.full_name,
        fatherName: application.father_name,
        dateOfBirth: application.date_of_birth,
        address: application.address,
        certificateType: application.certificate_type,
        issuedDate: new Date(certificate.issued_date).toLocaleDateString(),
        digitalSignature: certificate.digital_signature
      });
      
      pdf.save(`${certificate.certificate_type}_certificate_${certificate.certificate_number}.pdf`);
      toast.success('Certificate downloaded successfully!');
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast.error('Failed to download certificate');
    }
  };

  const handleViewCertificate = (certificateId: string) => {
    setViewingCertificate(certificateId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Certificates</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading certificates...</p>
        </CardContent>
      </Card>
    );
  }

  if (!certificates || certificates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Certificates</CardTitle>
          <CardDescription>Your issued certificates will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No certificates issued yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-6 w-6 mr-2" />
          My Certificates
        </CardTitle>
        <CardDescription>Download and view your issued certificates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {certificates.map((cert: any) => (
            <div key={cert.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-medium">{cert.certificate_type.toUpperCase()} CERTIFICATE</h3>
                    <Badge variant="secondary">Issued</Badge>
                  </div>
                  <p className="text-sm text-gray-600">Certificate No: {cert.certificate_number}</p>
                  <p className="text-sm text-gray-600">Issued to: {cert.issued_to}</p>
                  <p className="text-sm text-gray-600">
                    Issued on: {new Date(cert.issued_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewCertificate(cert.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleDownloadCertificate(cert)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
