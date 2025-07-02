
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileCheck, Clock, Users, TrendingUp, Bell, Search, Filter, LogOut, Award, Settings } from 'lucide-react';
import { CitizenPortal } from '@/components/CitizenPortal';
import { AdminDashboard } from '@/components/AdminDashboard';
import { ClerkDashboard } from '@/components/ClerkDashboard';
import { StaffOfficerDashboard } from '@/components/StaffOfficerDashboard';
import { SDODashboard } from '@/components/SDODashboard';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const Dashboard = () => {
  const [activeView, setActiveView] = useState('citizen');
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [userRoles, setUserRoles] = useState<string[]>(['citizen']);

  // Fetch user roles
  const { data: roleData } = useQuery({
    queryKey: ['userRoles', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Fetch stats for dashboard
  const { data: stats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const { data: applications, error } = await supabase
        .from('certificate_applications')
        .select('status, created_at');
      
      if (error) throw error;

      const total = applications?.length || 0;
      const pending = applications?.filter(app => app.status === 'pending').length || 0;
      const approved = applications?.filter(app => 
        app.status === 'approved' && 
        new Date(app.created_at).toDateString() === new Date().toDateString()
      ).length || 0;

      return {
        total: total.toString(),
        pending: pending.toString(),
        approved: approved.toString(),
        avgTime: '2.3 days'
      };
    }
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Set user roles based on fetched data
    if (roleData && roleData.length > 0) {
      const roles = roleData.map(r => r.role);
      setUserRoles(roles);
      
      // Set default active view based on highest role
      if (roles.includes('sdo')) {
        setActiveView('sdo');
      } else if (roles.includes('admin')) {
        setActiveView('admin');
      } else if (roles.includes('staff_officer')) {
        setActiveView('staff_officer');
      } else if (roles.includes('clerk')) {
        setActiveView('clerk');
      } else {
        setActiveView('citizen');
      }
    }
  }, [user, navigate, roleData]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) {
    return null;
  }

  const dashboardStats = [
    {
      title: 'Total Applications',
      value: stats?.total || '0',
      change: '+12%',
      icon: FileCheck,
      color: 'text-blue-600'
    },
    {
      title: 'Pending Review',
      value: stats?.pending || '0',
      change: '-8%',
      icon: Clock,
      color: 'text-yellow-600'
    },
    {
      title: 'Approved Today',
      value: stats?.approved || '0',
      change: '+24%',
      icon: Users,
      color: 'text-green-600'
    },
    {
      title: 'Processing Time',
      value: stats?.avgTime || '2.3 days',
      change: '-15%',
      icon: TrendingUp,
      color: 'text-purple-600'
    }
  ];

  const renderRoleButtons = () => {
    const buttons = [];
    
    // Always show citizen portal
    buttons.push(
      <Button 
        key="citizen"
        variant={activeView === 'citizen' ? 'secondary' : 'ghost'}
        onClick={() => setActiveView('citizen')}
        className="text-white hover:bg-white/20"
      >
        Citizen Portal
      </Button>
    );

    // Show role-specific buttons
    if (userRoles.includes('clerk')) {
      buttons.push(
        <Button 
          key="clerk"
          variant={activeView === 'clerk' ? 'secondary' : 'ghost'}
          onClick={() => setActiveView('clerk')}
          className="text-white hover:bg-white/20"
        >
          Clerk Dashboard
        </Button>
      );
    }

    if (userRoles.includes('staff_officer')) {
      buttons.push(
        <Button 
          key="staff_officer"
          variant={activeView === 'staff_officer' ? 'secondary' : 'ghost'}
          onClick={() => setActiveView('staff_officer')}
          className="text-white hover:bg-white/20"
        >
          Staff Officer
        </Button>
      );
    }

    if (userRoles.includes('admin')) {
      buttons.push(
        <Button 
          key="admin"
          variant={activeView === 'admin' ? 'secondary' : 'ghost'}
          onClick={() => setActiveView('admin')}
          className="text-white hover:bg-white/20"
        >
          Admin Dashboard
        </Button>
      );
    }

    if (userRoles.includes('sdo')) {
      buttons.push(
        <Button 
          key="sdo"
          variant={activeView === 'sdo' ? 'secondary' : 'ghost'}
          onClick={() => setActiveView('sdo')}
          className="text-white hover:bg-white/20"
        >
          SDO Dashboard
        </Button>
      );
    }

    return buttons;
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'citizen':
        return <CitizenPortal />;
      case 'clerk':
        return <ClerkDashboard />;
      case 'staff_officer':
        return <StaffOfficerDashboard />;
      case 'admin':
        return <AdminDashboard />;
      case 'sdo':
        return <SDODashboard />;
      default:
        return <CitizenPortal />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="gradient-bg text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Award className="h-8 w-8" />
              <div>
                <h1 className="text-3xl font-bold">Revenue Department</h1>
                <p className="text-blue-100 mt-1">Digital Certificate Issuance System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {renderRoleButtons()}
              <div className="flex items-center space-x-2">
                <Bell className="h-6 w-6 cursor-pointer hover:scale-110 transition-transform" />
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="text-white hover:bg-white/20"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => (
            <Card key={index} className="certificate-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    <Badge variant="secondary" className="mt-2">
                      {stat.change}
                    </Badge>
                  </div>
                  <stat.icon className={`h-12 w-12 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        {renderActiveView()}
      </div>
    </div>
  );
};

export default Dashboard;
