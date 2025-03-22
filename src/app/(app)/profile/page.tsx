'use client'

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { Loader2, Camera, Mail, User, Calendar, MessageSquare, Shield, Settings, Activity, ChevronRight, Bell, LogOut, Save, Check, X, AlertOctagon, ArrowLeft, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@uidotdev/usehooks';
import { signOut as nextAuthSignOut } from "next-auth/react";
import { useNotifications } from '@/context/NotificationContext';
import { Switch } from "@/components/ui/switch";

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

  const [isUsernameEditing, setIsUsernameEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameMessage, setUsernameMessage] = useState('');
  const [isUsernameValid, setIsUsernameValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debouncedUsername = useDebounce(newUsername, 500);
  const usernameAbortControllerRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [userActivities, setUserActivities] = useState<any[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);

  const { soundEnabled, toggleSound } = useNotifications();
  const { notificationsEnabled, toggleNotifications } = useNotifications();
  
  const [showQuestions, setShowQuestions] = useState(true);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  const toggleShowQuestions = async () => {
    try {
      setIsUpdatingSettings(true);
      const newValue = !showQuestions;
      
      setShowQuestions(newValue);
      
      const response = await axios.put('/api/settings', {
        showQuestions: newValue
      });
      
      if (response.data.success) {
        toast({
          title: 'Settings updated',
          description: newValue 
            ? 'Your questions are now visible to others' 
            : 'Your questions are now hidden from others',
          variant: 'default',
        });
      } else {
        setShowQuestions(!newValue);
        throw new Error(response.data.message || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Settings update error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update question visibility settings',
        variant: 'destructive',
      });
      
      setShowQuestions(!showQuestions);
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  useEffect(() => {
    if (!session) {
      router.push('/sign-in');
      return;
    }

    const fetchUserData = async () => {
      try {
        const [profileResponse, settingsResponse] = await Promise.all([
          axios.get('/api/profile'),
          axios.get('/api/settings')
        ]);
        
        setUserData(profileResponse.data);
        
        if (settingsResponse.data.success) {
          setShowQuestions(settingsResponse.data.settings.showQuestions);
        }
      } catch (error) {
        console.error('Data fetch error:', error);
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

  useEffect(() => {
    if (!session?.user?._id) return;

    const fetchUserActivities = async () => {
      setIsLoadingActivities(true);
      try {
        const response = await axios.get('/api/profile/activities');
        setUserActivities(response.data.activities || []);
      } catch (error) {
        console.error('Error fetching user activities:', error);
      } finally {
        setIsLoadingActivities(false);
      }
    };

    fetchUserActivities();
  }, [session]);

  useEffect(() => {
    if (debouncedUsername === userData.username || !debouncedUsername) {
      setUsernameMessage('');
      setIsUsernameValid(false);
      return;
    }

    const checkUsernameUnique = async () => {
      if (debouncedUsername && debouncedUsername.length >= 3) {
        if (usernameAbortControllerRef.current) {
          usernameAbortControllerRef.current.abort();
        }

        usernameAbortControllerRef.current = new AbortController();
        const signal = usernameAbortControllerRef.current.signal;

        setIsCheckingUsername(true);
        setUsernameMessage('');
        setIsUsernameValid(false);

        try {
          await axios.get(`/api/check-unique-username?username=${encodeURIComponent(debouncedUsername.trim())}`, {
            signal,
            timeout: 5000
          });

          if (!signal.aborted) {
            setUsernameMessage('Username is available');
            setIsUsernameValid(true);
          }
        } catch (error) {
          if (axios.isCancel(error)) {
            return;
          }

          if (!signal.aborted) {
            const axiosError = error as AxiosError;

            if (axiosError.response?.status === 409) {
              setUsernameMessage('Username is already taken');
              setIsUsernameValid(false);
            } else if (axiosError.code === 'ECONNABORTED') {
              setUsernameMessage('Request timed out. Please try again.');
              setIsUsernameValid(false);
            } else {
              setUsernameMessage('Failed to check username availability');
              setIsUsernameValid(false);
            }
          }
        } finally {
          if (!signal.aborted) {
            setIsCheckingUsername(false);
          }
        }
      } else if (debouncedUsername.length > 0 && debouncedUsername.length < 3) {
        setUsernameMessage('Username must be at least 3 characters');
        setIsUsernameValid(false);
        setIsCheckingUsername(false);
      }
    };

    checkUsernameUnique();

    return () => {
      if (usernameAbortControllerRef.current) {
        usernameAbortControllerRef.current.abort();
      }
    };
  }, [debouncedUsername, userData.username]);

  useEffect(() => {
    if (isUsernameEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isUsernameEditing]);

  const handleEditUsername = () => {
    setNewUsername(userData.username);
    setIsUsernameEditing(true);
  };

  const handleCancelEdit = () => {
    setIsUsernameEditing(false);
    setNewUsername('');
    setUsernameMessage('');
    setIsUsernameValid(false);
  };

  const handleUsernameUpdate = async () => {
    if (!isUsernameValid || isCheckingUsername) return;

    setIsSubmitting(true);

    try {
      const response = await axios.patch('/api/profile/update-username', {
        newUsername: newUsername.trim()
      });

      if (response.data.success) {
        setUserData(prev => ({ ...prev, username: newUsername.trim() }));

        toast({
          title: 'Username updated',
          description: 'Your username has been successfully updated.',
          className: 'bg-green-500 text-white',
        });

        setIsUsernameEditing(false);
        setNewUsername('');
        setUsernameMessage('');
      } else {
        throw new Error(response.data.message || 'Failed to update username');
      }
    } catch (error) {
      console.error('Username update error:', error);
      const axiosError = error as AxiosError<any>;
      const errorMessage = axiosError.response?.data.message || 'Failed to update username. Please try again.';

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      }) + ' today';
    }

    if (diffDays === 1) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      }) + ' yesterday';
    }

    if (diffDays < 7) {
      return `${diffDays} days ago`;
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  const renderUsernameField = () => {
    if (isUsernameEditing) {
      return (
        <div>
          <label className="text-sm text-white/40 block mb-2">Username</label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-400" />
                <Input
                  ref={inputRef}
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="pl-10 pr-10 bg-white/5 border border-white/20 focus:border-indigo-500 text-white focus:ring-2 focus:ring-indigo-500/30 rounded-lg h-12 w-full"
                  placeholder="Enter new username"
                  disabled={isSubmitting}
                />
                {isCheckingUsername && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                  </div>
                )}
              </div>
              <Button
                onClick={handleUsernameUpdate}
                disabled={!isUsernameValid || isSubmitting || isCheckingUsername}
                className="bg-indigo-600 hover:bg-indigo-700 text-white h-12 px-4"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
              </Button>
              <Button
                onClick={handleCancelEdit}
                variant="ghost"
                className="text-white/60 hover:text-white hover:bg-white/10 h-12 px-4"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {usernameMessage && (
              <div className={`flex items-center gap-2 text-sm ${isUsernameValid ? 'text-green-400' : 'text-red-400'}`}>
                {isUsernameValid ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <AlertOctagon className="h-4 w-4" />
                )}
                <span>{usernameMessage}</span>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div>
        <label className="text-sm text-white/40 block mb-2">Username</label>
        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/8 transition-colors">
          <User className="w-5 h-5 text-indigo-400" />
          <span className="text-white font-medium">{userData.username}</span>
        </div>
      </div>
    );
  };

  const renderQuestionVisibilityToggle = () => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 rounded-lg bg-white/5 hover:bg-white/8 transition-all border border-white/10">
      <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-0 w-full sm:w-auto">
        <div className="bg-indigo-500/20 p-2 sm:p-2.5 rounded-lg shrink-0">
          <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
        </div>
        <div>
          <p className="text-white font-medium text-sm sm:text-base">Question Visibility</p>
          <p className="text-white/50 text-xs sm:text-sm">
            {showQuestions
              ? "Others can see your questions"
              : "Only you can see your questions"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 self-end sm:self-center ml-auto sm:ml-0" style={{margin:"0px 10px"}}>
        <Switch
          checked={showQuestions}
          onCheckedChange={toggleShowQuestions}
          disabled={isUpdatingSettings}
          className="data-[state=checked]:bg-green-500"
        />
        <span className="text-xs font-medium text-slate-300">
          {isUpdatingSettings ? (
            <span className="flex items-center justify-center">
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            </span>
          ) : (
            showQuestions ? 'On' : 'Off'
          )}
        </span>
      </div>
    </div>
  );

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

  function signOut({ callbackUrl }: { callbackUrl: string }): void {
    nextAuthSignOut({ callbackUrl });
  }

  return (
    <main className="min-h-screen pt-16 pb-16 bg-gradient-to-b from-slate-900 to-black text-white">
      <div className="block sm:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60"
          onClick={() => router.push('/dashboard')}
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </Button>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden mb-8">
          <div className="h-64 sm:h-64 bg-gradient-to-r from-indigo-800 via-purple-700 to-blue-800 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-black/20"></div>
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'radial-gradient(circle at 25% 100%, rgba(255, 255, 255, 0.2) 0%, transparent 0%), radial-gradient(circle at 75% 40%, rgba(255, 255, 255, 0.15) 0%, transparent 0%)',
                backgroundSize: '80% 80%, 60% 60%',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat'
              }}
            ></div>
          </div>

          <div className="absolute -bottom-20 sm:-bottom-16 w-full px-4 sm:px-8 mb-0 sm:mb-[137px]">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div className="flex flex-col sm:flex-row sm:items-end gap-6">
                <div className="relative group mx-auto sm:mx-0 ">
                  <div className="sm:hidden absolute inset-0 -m-2 rounded-full bg-black/40 backdrop-blur-sm mt-[1px]"></div>
                  <Avatar className="w-28 h-28 sm:w-32 sm:h-32 border-4 border-black relative shadow-2xl">
                    <AvatarImage
                      src="https://github.com/shadcn.png"
                      alt={userData.username}
                    />
                    <AvatarFallback className="text-2xl sm:text-3xl font-bold bg-gradient-to-br from-indigo-600 to-purple-700">
                      {getInitials(userData.username)}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    className="absolute bottom-1 right-1 rounded-full bg-white/10 backdrop-blur-xl hover:bg-white/20 p-2 text-white shadow-lg opacity-0 sm:opacity-0 group-hover:opacity-100 transition-all duration-200 border border-white/20"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1 pb-2 sm:mb-[18px] ml-0 sm:ml-[5px] text-center sm:text-left mt-3 sm:mt-0">
                  <div className="flex flex-col sm:flex-row sm:flex-wrap items-center sm:items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-white sm:bg-clip-text sm:text-transparent sm:bg-gradient-to-r sm:from-white sm:to-white/80 drop-shadow-md sm:drop-shadow-none">
                      {userData.username}
                    </h1>
                    <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium shadow-lg border-none hover:from-indigo-600 hover:to-purple-700">
                      {userData.role}
                    </Badge>
                  </div>
                  <p className="text-white sm:text-white/60 flex items-center gap-1.5 justify-center sm:justify-start">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-sm sm:text-base">{userData.email}</span>
                  </p>
                </div>
              </div>

              <div className="flex justify-center sm:justify-start gap-3 mb-5 sm:mb-2 mt-3 sm:mt-0">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 mt-28 sm:mt-20">
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl overflow-hidden hover:bg-white/8 transition-all duration-300">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-3 shadow-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Messages Received</p>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/60 hover:text-white hover:bg-white/10"
                    onClick={handleEditUsername}
                    disabled={isUsernameEditing}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Username
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
                    {renderUsernameField()}

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
                  View your received messages and progress metrics
                </CardDescription>
              </CardHeader>
              <Separator className="bg-white/10" />
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-white/60 text-sm">Messages Received</p>
                      <p className="text-2xl font-bold text-white">{userData.messageCount}</p>
                    </div>
                    <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                      {userData.messageCount} total messages
                    </Badge>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/40">Progress</span>
                      <span className="text-white/60 font-medium">{Math.min(userData.messageCount / 10, 100)}%</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-white/5 border border-white/10 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all duration-500 ease-out" 
                        style={{ width: `${Math.min(userData.messageCount / 5, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-0 space-y-8">
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-400" />
                  Activity Timeline
                </CardTitle>
                <CardDescription className="text-white/40">
                  Your activity over time
                </CardDescription>
              </CardHeader>
              <Separator className="bg-white/10" />
              <CardContent className="pt-6 space-y-6">
                {isLoadingActivities ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                  </div>
                ) : userActivities.length > 0 ? (
                  <div className="relative">
                    <div className="absolute left-[19px] top-0 bottom-0 w-px bg-white/10"></div>

                    <div className="space-y-8">
                      <div className="relative pl-12">
                        <div className="absolute left-0 w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <User className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-white font-medium">Account created</p>
                          <p className="text-white/50 text-sm flex items-center">
                            <Calendar className="w-3.5 h-3.5 mr-1.5 text-white/30" />
                            {formatDate(userData.createdAt)}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">New Account</Badge>
                            <span className="text-white/50 text-sm">Welcome to AnonyExchange!</span>
                          </div>
                        </div>
                      </div>

                      {userActivities
                        .filter(activity => activity.type === 'message')
                        .slice(0, 3)
                        .map((activity, index) => (
                          <div key={activity._id} className="relative pl-12">
                            <div className="absolute left-0 w-9 h-9 rounded-full bg-indigo-500/20 flex items-center justify-center">
                              <MessageSquare className="w-4 h-4 text-indigo-400" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-white font-medium">Received a new feedback message</p>
                              <p className="text-white/50 text-sm flex items-center">
                                <Calendar className="w-3.5 h-3.5 mr-1.5 text-white/30" />
                                {formatTimestamp(activity.createdAt)}
                              </p>
                              {activity.content && (
                                <p className="text-white/70 text-sm mt-1 bg-white/5 p-3 rounded-lg border border-white/10">
                                  "{activity.content.length > 100
                                    ? `${activity.content.substring(0, 100)}...`
                                    : activity.content}"
                                </p>
                              )}
                            </div>
                          </div>
                        ))}

                      {userActivities
                        .filter(activity => activity.type === 'profile_update')
                        .slice(0, 2)
                        .map((activity, index) => (
                          <div key={activity._id} className="relative pl-12">
                            <div className="absolute left-0 w-9 h-9 rounded-full bg-purple-500/20 flex items-center justify-center">
                              <User className="w-4 h-4 text-purple-400" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-white font-medium">
                                {activity.action || "Updated profile information"}
                              </p>
                              <p className="text-white/50 text-sm flex items-center">
                                <Calendar className="w-3.5 h-3.5 mr-1.5 text-white/30" />
                                {formatTimestamp(activity.createdAt)}
                              </p>
                              {activity.details && (
                                <p className="text-white/60 text-sm">
                                  {activity.details}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-white/50">No activity history available yet.</p>
                    <p className="text-white/40 text-sm mt-1">Your activities will appear here as you use the platform.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-0 space-y-8">
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-400" />
                  Account Settings
                </CardTitle>
                <CardDescription className="text-white/40">
                  Manage your account preferences
                </CardDescription>
              </CardHeader>
              <Separator className="bg-white/10" />
              <CardContent className="pt-6 space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 rounded-lg bg-white/5 hover:bg-white/8 transition-all border border-white/10">
                  <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-0 w-full sm:w-auto">
                    <div className="bg-indigo-500/20 p-2 sm:p-2.5 rounded-lg shrink-0">
                      <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm sm:text-base">Notifications Sound</p>
                      <p className="text-white/50 text-xs sm:text-sm">Manage Notifications sound</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center ml-auto sm:ml-0 sm:mr-5 " style={{margin:"0px 10px"}}>
                    <Switch
                      checked={soundEnabled}
                      onCheckedChange={toggleSound}
                      className="data-[state=checked]:bg-green-500"
                    />
                    <span className="text-xs font-medium text-slate-300">
                      {soundEnabled ? 'On' : 'Off'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 rounded-lg bg-white/5 hover:bg-white/8 transition-all border border-white/10">
                  <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-0 w-full sm:w-auto">
                    <div className="bg-indigo-500/20 p-2 sm:p-2.5 rounded-lg shrink-0">
                      <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm sm:text-base">Notification Settings</p>
                      <p className="text-white/50 text-xs sm:text-sm">
                        {notificationsEnabled
                          ? "You will receive notifications for new messages"
                          : "You won't receive notifications for new messages"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center ml-auto sm:ml-0 sm:mr-5" style={{margin:"0px 15px"}}>
                    <Switch
                      checked={notificationsEnabled}
                      onCheckedChange={toggleNotifications}
                      className="data-[state=checked]:bg-green-500"
                    />
                    <span className="text-xs font-medium text-slate-300">
                      {notificationsEnabled ? 'On' : 'Off'}
                    </span>
                  </div>
                </div>

                {renderQuestionVisibilityToggle()}
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-xl overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-amber-400 flex items-center gap-2">
                  <LogOut className="w-5 h-5 text-amber-400" />
                  Session Management
                </CardTitle>
                <CardDescription className="text-white/40">
                  Manage your current session
                </CardDescription>
              </CardHeader>
              <Separator className="bg-white/10" />
              <CardContent className="pt-6 space-y-6">
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-white font-medium">Log Out</p>
                      <p className="text-white/50 text-sm">Sign out from your current session</p>
                    </div>
                    <Button
                      variant="outline"
                      className="hover:bg-amber-500/20 bg-red-600 hover:text-white text-white border-amber-500/30"
                      onClick={() => signOut({ callbackUrl: '/sign-in' })}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Log Out
                    </Button>
                  </div>
                  <div className="bg-black/30 p-3 rounded-lg text-white/60 text-sm">
                    <p>You will be redirected to the sign-in page. Your account data remains secure and untouched.</p>
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