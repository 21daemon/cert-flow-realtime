
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CertificateApplication } from './CertificateApplication';
import { ApplicationTracker } from './ApplicationTracker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useCertificateData } from '@/hooks/useCertificateData';

export const CitizenPortal = () => {
  const { applications, isLoading } = useCertificateData();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'under_review':
        return <AlertCircle className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'under_review':
        return 'status-under-review';
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-pending';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="certificate-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold">{applications?.length || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="certificate-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">
                  {applications?.filter(app => app.status === 'pending' || app.status === 'under_review').length || 0}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="certificate-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold">
                  {applications?.filter(app => app.status === 'approved').length || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      {applications && applications.length > 0 && (
        <Card className="certificate-card">
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>Your latest certificate applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {applications.slice(0, 3).map((app) => (
                <div key={app.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(app.status)}
                    <div>
                      <p className="font-medium">{app.application_id}</p>
                      <p className="text-sm text-gray-600">
                        {app.certificate_type.charAt(0).toUpperCase() + app.certificate_type.slice(1)} Certificate
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(app.status)}>
                    {app.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs defaultValue="apply" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="apply">Apply for Certificate</TabsTrigger>
          <TabsTrigger value="track">Track Applications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="apply">
          <CertificateApplication />
        </TabsContent>
        
        <TabsContent value="track">
          <ApplicationTracker />
        </TabsContent>
      </Tabs>
    </div>
  );
};
