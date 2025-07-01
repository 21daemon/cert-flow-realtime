
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  FileCheck, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Calendar,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react';

export const AdminDashboard = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const pendingApplications = [
    {
      id: 'CERT2024001',
      applicant: 'Rajesh Kumar',
      type: 'Caste Certificate',
      submittedDate: '2024-01-15',
      priority: 'High',
      assignedTo: 'Officer A',
      daysWaiting: 5
    },
    {
      id: 'CERT2024002',
      applicant: 'Priya Sharma',
      type: 'Income Certificate',
      submittedDate: '2024-01-16',
      priority: 'Medium',
      assignedTo: 'Officer B',
      daysWaiting: 4
    },
    {
      id: 'CERT2024003',
      applicant: 'Mohammed Ali',
      type: 'Domicile Certificate',
      submittedDate: '2024-01-18',
      priority: 'Low',
      assignedTo: 'Officer C',
      daysWaiting: 2
    }
  ];

  const recentActivities = [
    {
      id: 1,
      action: 'Certificate Approved',
      applicant: 'Sunil Gupta',
      officer: 'Officer A',
      timestamp: '2 hours ago',
      type: 'approval'
    },
    {
      id: 2,
      action: 'Document Verification',
      applicant: 'Anjali Reddy',
      officer: 'Officer B',
      timestamp: '4 hours ago',
      type: 'verification'
    },
    {
      id: 3,
      action: 'Application Submitted',
      applicant: 'Vikram Singh',
      officer: 'System',
      timestamp: '6 hours ago',
      type: 'submission'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="certificate-card">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-800">Administrative Dashboard</CardTitle>
          <CardDescription>
            Monitor applications, manage workflows, and track department performance
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="applications" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-6">
          <Card className="certificate-card">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center space-x-2">
                  <FileCheck className="h-5 w-5" />
                  <span>Pending Applications</span>
                </CardTitle>
                <div className="flex space-x-2">
                  <Input placeholder="Search applications..." className="w-64" />
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingApplications.map((app) => (
                  <div key={app.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-semibold">{app.applicant}</h3>
                          <p className="text-sm text-gray-600">{app.type} • {app.id}</p>
                        </div>
                        <Badge className={getPriorityColor(app.priority)}>
                          {app.priority}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Waiting: {app.daysWaiting} days</p>
                        <p className="text-xs text-gray-500">Assigned to: {app.assignedTo}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">
                        Submitted: {new Date(app.submittedDate).toLocaleDateString()}
                      </p>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive">
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification">
          <Card className="certificate-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Document Verification</span>
              </CardTitle>
              <CardDescription>
                Verify documents and cross-check with central databases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Document verification interface</p>
                <p className="text-sm text-gray-500 mt-2">Connect to databases for automated verification</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="certificate-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Performance Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Average Processing Time</span>
                    <span className="font-semibold">2.3 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Applications This Month</span>
                    <span className="font-semibold">456</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Approval Rate</span>
                    <span className="font-semibold">89.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending Applications</span>
                    <span className="font-semibold">23</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="certificate-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Monthly Statistics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Chart visualization would go here</p>
                  <Button className="mt-4" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activities">
          <Card className="certificate-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Recent Activities</span>
              </CardTitle>
              <CardDescription>
                Real-time log of all system activities and transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${
                      activity.type === 'approval' ? 'bg-green-500' :
                      activity.type === 'verification' ? 'bg-blue-500' : 'bg-gray-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-gray-600">
                        {activity.applicant} • Handled by {activity.officer}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500">{activity.timestamp}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
