'use client'

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Loader2, Camera, Mail, User, Calendar, MessageSquare, Shield, Settings, Activity, ChevronRight, Bell, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    createdAt: '',
    messageCount: 0,
    role: 'Member'
  });

  useEffect(() => {
    if (!session) {
      router.push('/sign-in');
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get('/api/profile');
        setUserData(response.data);
      } catch (error) {
        console.error('Profile fetch error:', error);
        toast({
          title: 'Error',
          description: 'Failed to load profile data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [session, router, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-black">
        <div className="flex flex-col items-center gap-4 bg-black/20 p-8 rounded-xl backdrop-blur-md border border-white/5">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <p className="text-white/80 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
};

const getInitials = (username: string): string => {
    return username?.substring(0, 2).toUpperCase() || 'U';
};

  const getAccountAgeInDays = () => {
    return Math.floor((Number(new Date()) - Number(new Date(userData.createdAt))) / (1000 * 60 * 60 * 24));
  };

  
  const recentActivities = [
    { id: 1, action: 'Changed profile picture', date: '2 hours ago', icon: Camera },
    { id: 2, action: 'Sent a message to support', date: 'Yesterday', icon: MessageSquare },
    { id: 3, action: 'Updated account settings', date: '3 days ago', icon: Settings },
  ];

  return (
    <main className="min-h-screen pt-16 pb-16 bg-gradient-to-b from-slate-900 to-black text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden mb-8">
          <div className="h-64 bg-gradient-to-r from-indigo-800 via-purple-700 to-blue-800 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-black/20"></div>
            <div 
              className="absolute inset-0" 
              style={{ 
            backgroundImage: 'radial-gradient(circle at 25% 100%, rgba(255, 255, 255, 0.2) 0%, transparent 25%), radial-gradient(circle at 75% 40%, rgba(255, 255, 255, 0.15) 0%, transparent 25%)',
            backgroundSize: '80% 80%, 60% 60%',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat'
              }}
            ></div>
          </div>

          <div className="absolute -bottom-16 w-full px-8 mb-[137px]">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div className="flex items-end gap-6">
            <div className="relative group">
              <Avatar className="w-32 h-32 border-4 border-black shadow-2xl">
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt={userData.username}
                />
                <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-indigo-600 to-purple-700">
                  {getInitials(userData.username)}
                </AvatarFallback>
              </Avatar>
              <button
                className="absolute bottom-1 right-1 rounded-full bg-white/10 backdrop-blur-xl hover:bg-white/20 p-2 text-white shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 border border-white/20"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-1 pb-2 mb-[18px] ml-[5px]">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
                  {userData.username}
                </h1>
                <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium shadow-lg border-none hover:from-indigo-600 hover:to-purple-700">
                  {userData.role}
                </Badge>
              </div>
              <p className="text-white/60 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                {userData.email}
              </p>
            </div>
              </div>
              
              <div className="flex gap-3 mb-2">
            <Button
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-none shadow-lg mb-5"
              onClick={() => router.push('/dashboard')}
            >
              Dashboard
            </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 mt-20">
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl overflow-hidden hover:bg-white/8 transition-all duration-300">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-3 shadow-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Messages Received received</p>
                <p className="text-2xl font-bold text-white">{userData.messageCount}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl overflow-hidden hover:bg-white/8 transition-all duration-300">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-3 shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Account Age</p>
                <p className="text-2xl font-bold text-white">{getAccountAgeInDays()} days</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl overflow-hidden hover:bg-white/8 transition-all duration-300">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-3 shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Member Status</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{userData.role}</p>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-white/5 backdrop-blur-xl border border-white/10 p-1 rounded-xl">
              <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70">
                <User className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="activity" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70">
                <Activity className="w-4 h-4 mr-2" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="overview" className="mt-0 space-y-8">
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-400" />
                    Personal Information
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10">
                    <Settings className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
                <CardDescription className="text-white/40">
                  Your account details and preferences
                </CardDescription>
              </CardHeader>
              <Separator className="bg-white/10" />
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm text-white/40 block mb-2">Username</label>
                      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/8 transition-colors">
                        <User className="w-5 h-5 text-indigo-400" />
                        <span className="text-white font-medium">{userData.username}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-white/40 block mb-2">Email Address</label>
                      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/8 transition-colors">
                        <Mail className="w-5 h-5 text-purple-400" />
                        <span className="text-white font-medium">{userData.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-sm text-white/40 block mb-2">Member Since</label>
                      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/8 transition-colors">
                        <Calendar className="w-5 h-5 text-teal-400" />
                        <span className="text-white font-medium">{formatDate(userData.createdAt)}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-white/40 block mb-2">Account Status</label>
                      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/8 transition-colors">
                        <Shield className="w-5 h-5 text-amber-400" />
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{userData.role}</span>
                          <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">Active</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-xl overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-400" />
                  Activity Analytics
                </CardTitle>
                <CardDescription className="text-white/40">
                  Your usage statistics and engagement metrics
                </CardDescription>
              </CardHeader>
              <Separator className="bg-white/10" />
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-white/60 text-sm">Messages Sent</p>
                      <p className="text-2xl font-bold text-white">{userData.messageCount}</p>
                    </div>
                    <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                      +{Math.round(userData.messageCount * 0.1)} this month
                    </Badge>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/40">Progress</span>
                      <span className="text-white/60 font-medium">{Math.min(userData.messageCount / 10, 100)}%</span>
                    </div>
                    <Progress 
                      value={Math.min(userData.messageCount / 10, 100)}
                      className="h-2 bg-gradient-to-r from-indigo-500 to-purple-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="flex items-center gap-1.5 text-white/40 text-xs">
                      <Bell className="w-3.5 h-3.5" />
                      <span>Notifications</span>
                    </div>
                    <p className="text-2xl font-bold text-white">12</p>
                    <div className="flex items-center text-xs text-green-400 font-medium">
                      <span>+33% from last week</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="flex items-center gap-1.5 text-white/40 text-xs">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Responses</span>
                    </div>
                    <p className="text-2xl font-bold text-white">24</p>
                    <div className="flex items-center text-xs text-emerald-400 font-medium">
                      <span>+12% from last week</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="flex items-center gap-1.5 text-white/40 text-xs">
                      <Activity className="w-3.5 h-3.5" />
                      <span>Active Days</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{Math.min(getAccountAgeInDays(), 30)}</p>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500" 
                        style={{ width: `${(Math.min(getAccountAgeInDays(), 30) / 30) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="activity">
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-400" />
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-white/40">
                  Your latest actions and system events
                </CardDescription>
              </CardHeader>
              <Separator className="bg-white/10" />
              <CardContent className="pt-6">
                (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="bg-white/5 rounded-full p-3 mb-4">
                      <Activity className="w-6 h-6 text-white/40" />
                    </div>
                    <h3 className="text-white font-medium text-lg mb-1">No recent activity</h3>
                    <p className="text-white/40 max-w-sm">Your recent actions and system events will appear here once you start using the application.</p>
                  </div>
                )
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-400" />
                  Account Settings
                </CardTitle>
                <CardDescription className="text-white/40">
                  Manage your account preferences and security settings
                </CardDescription>
              </CardHeader>
              <Separator className="bg-white/10" />
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-amber-400" />
                        <h3 className="font-medium text-white">Notification Preferences</h3>
                      </div>
                      <p className="text-white/40 text-sm">Manage how you receive notifications and alerts</p>
                    </div>
                    <Button variant="outline" className="bg-white/5 hover:bg-white/10 text-white border-white/10">
                      Manage
                    </Button>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-emerald-400" />
                        <h3 className="font-medium text-white">Security Settings</h3>
                      </div>
                      <p className="text-white/40 text-sm">Update your password and security preferences</p>
                    </div>
                    <Button variant="outline" className="bg-white/5 hover:bg-white/10 text-white border-white/10">
                      Manage
                    </Button>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-400" />
                        <h3 className="font-medium text-white">Profile Information</h3>
                      </div>
                      <p className="text-white/40 text-sm">Update your profile details and visibility settings</p>
                    </div>
                    <Button variant="outline" className="bg-white/5 hover:bg-white/10 text-white border-white/10">
                      Manage
                    </Button>
                  </div>
                  
                  <Separator className="bg-white/10 my-4" />
                  
                  <div className="bg-red-950/20 rounded-xl p-4 border border-red-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <LogOut className="w-5 h-5 text-red-400" />
                        <h3 className="font-medium text-white">Sign Out</h3>
                      </div>
                      <p className="text-white/40 text-sm">Log out from your current session</p>
                    </div>
                    <Button variant="destructive" className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/20">
                      Sign Out
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}