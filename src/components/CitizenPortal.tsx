
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CertificateApplication } from './CertificateApplication';
import { ApplicationTracker } from './ApplicationTracker';
import { FileText, Search, Download, Award } from 'lucide-react';

export const CitizenPortal = () => {
  const certificateTypes = [
    {
      id: 'caste',
      name: 'Caste Certificate',
      description: 'For reservation benefits and educational purposes',
      icon: Award,
      processing: '2-3 days'
    },
    {
      id: 'income',
      name: 'Income Certificate',
      description: 'For financial assistance and loan applications',
      icon: FileText,
      processing: '1-2 days'
    },
    {
      id: 'domicile',
      name: 'Domicile Certificate',
      description: 'Proof of residence for various purposes',
      icon: FileText,
      processing: '2-4 days'
    },
    {
      id: 'residence',
      name: 'Residence Certificate',
      description: 'Permanent residence verification',
      icon: FileText,
      processing: '1-3 days'
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="certificate-card">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-800">Citizen Services Portal</CardTitle>
          <CardDescription>
            Apply for certificates, track applications, and download digital certificates
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="apply" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="apply">Apply for Certificate</TabsTrigger>
          <TabsTrigger value="track">Track Application</TabsTrigger>
          <TabsTrigger value="download">Download Certificates</TabsTrigger>
        </TabsList>

        <TabsContent value="apply" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificateTypes.map((cert) => (
              <Card key={cert.id} className="certificate-card cursor-pointer hover:border-blue-300 transition-colors">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <cert.icon className="h-8 w-8 text-blue-600" />
                    <div>
                      <CardTitle className="text-lg">{cert.name}</CardTitle>
                      <CardDescription>{cert.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Processing Time: {cert.processing}</span>
                    <span className="text-sm font-medium text-green-600">Available</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <CertificateApplication />
        </TabsContent>

        <TabsContent value="track">
          <ApplicationTracker />
        </TabsContent>

        <TabsContent value="download">
          <Card className="certificate-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="h-5 w-5" />
                <span>Download Certificates</span>
              </CardTitle>
              <CardDescription>
                Access and download your approved digital certificates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Download className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No certificates available for download</p>
                <p className="text-sm text-gray-500 mt-2">Approved certificates will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
