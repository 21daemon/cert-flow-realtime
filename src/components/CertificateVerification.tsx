
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle, XCircle, Search, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Certificate {
  id: string;
  certificate_number: string;
  certificate_type: string;
  issued_to: string;
  issued_date: string;
  valid_until: string | null;
  digital_signature: string | null;
}

const CertificateVerification = () => {
  const [certificateNumber, setCertificateNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const verifyCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setCertificate(null);

    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('certificate_number', certificateNumber.trim())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Certificate not found. Please check the certificate number.');
        } else {
          setError('Error verifying certificate. Please try again.');
        }
      } else {
        setCertificate(data);
      }
    } catch (err) {
      setError('Error verifying certificate. Please try again.');
    }

    setLoading(false);
  };

  const formatCertificateType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isValidCertificate = (cert: Certificate) => {
    if (!cert.valid_until) return true;
    return new Date(cert.valid_until) > new Date();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <div className="text-center">
            <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Certificate Verification
            </h1>
            <p className="text-gray-600">
              Verify the authenticity of government-issued certificates
            </p>
          </div>
        </div>

        {/* Verification Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Verify Certificate
            </CardTitle>
            <CardDescription>
              Enter the certificate number to verify its authenticity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={verifyCertificate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="certificateNumber">Certificate Number</Label>
                <Input
                  id="certificateNumber"
                  type="text"
                  placeholder="Enter certificate number (e.g., CERT2024001)"
                  value={certificateNumber}
                  onChange={(e) => setCertificateNumber(e.target.value)}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify Certificate'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mb-8">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Certificate Details */}
        {certificate && (
          <Card className="certificate-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                  Certificate Verified
                </CardTitle>
                <Badge 
                  variant={isValidCertificate(certificate) ? "default" : "destructive"}
                  className={isValidCertificate(certificate) ? "bg-green-600" : ""}
                >
                  {isValidCertificate(certificate) ? 'Valid' : 'Expired'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Certificate Number</Label>
                  <p className="font-mono text-lg">{certificate.certificate_number}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Certificate Type</Label>
                  <p className="text-lg">{formatCertificateType(certificate.certificate_type)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Issued To</Label>
                  <p className="text-lg font-medium">{certificate.issued_to}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Issue Date</Label>
                  <p className="text-lg">{formatDate(certificate.issued_date)}</p>
                </div>
                {certificate.valid_until && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Valid Until</Label>
                    <p className="text-lg">{formatDate(certificate.valid_until)}</p>
                  </div>
                )}
                {certificate.digital_signature && (
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-gray-600">Digital Signature</Label>
                    <p className="font-mono text-sm text-gray-800 bg-gray-50 p-2 rounded break-all">
                      {certificate.digital_signature}
                    </p>
                  </div>
                )}
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  This certificate has been verified against government records and is authentic.
                  The digital signature ensures the integrity of this document.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Information Card */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How to Verify</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <p>• Enter the complete certificate number exactly as shown on your certificate</p>
              <p>• Certificate numbers are usually in the format: CERT2024XXX</p>
              <p>• If verification fails, contact the issuing authority</p>
              <p>• This verification system works 24/7 for your convenience</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CertificateVerification;
