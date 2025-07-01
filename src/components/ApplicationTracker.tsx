
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Clock, CheckCircle, XCircle, FileCheck, Eye } from 'lucide-react';

export const ApplicationTracker = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const mockApplications = [
    {
      id: 'CERT2024001',
      type: 'Caste Certificate',
      submittedDate: '2024-01-15',
      status: 'Under Review',
      estimatedCompletion: '2024-01-20',
      currentStage: 'Document Verification',
      progress: 60
    },
    {
      id: 'CERT2024002',
      type: 'Income Certificate',
      submittedDate: '2024-01-10',
      status: 'Approved',
      completedDate: '2024-01-18',
      currentStage: 'Certificate Issued',
      progress: 100
    },
    {
      id: 'CERT2024003',
      type: 'Domicile Certificate',
      submittedDate: '2024-01-20',
      status: 'Pending',
      estimatedCompletion: '2024-01-25',
      currentStage: 'Initial Review',
      progress: 25
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'Under Review':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'Rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <FileCheck className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'Approved': 'status-approved',
      'Under Review': 'status-under-review',
      'Pending': 'status-pending',
      'Rejected': 'status-rejected'
    };
    return variants[status as keyof typeof variants] || 'status-pending';
  };

  return (
    <div className="space-y-6">
      <Card className="certificate-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Track Your Applications</span>
          </CardTitle>
          <CardDescription>
            Monitor the status and progress of your certificate applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by Application ID or Certificate Type"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {mockApplications.map((app) => (
          <Card key={app.id} className="certificate-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(app.status)}
                  <div>
                    <h3 className="font-semibold text-lg">{app.type}</h3>
                    <p className="text-gray-600">Application ID: {app.id}</p>
                  </div>
                </div>
                <Badge className={`px-3 py-1 ${getStatusBadge(app.status)}`}>
                  {app.status}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Submitted Date</p>
                  <p className="font-medium">{new Date(app.submittedDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Stage</p>
                  <p className="font-medium">{app.currentStage}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {app.status === 'Approved' ? 'Completed Date' : 'Expected Completion'}
                  </p>
                  <p className="font-medium">
                    {app.completedDate ? 
                      new Date(app.completedDate).toLocaleDateString() : 
                      new Date(app.estimatedCompletion).toLocaleDateString()
                    }
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{app.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${app.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                {app.status === 'Approved' && (
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Download Certificate
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
