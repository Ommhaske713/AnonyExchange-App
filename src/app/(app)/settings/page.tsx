'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useNotifications } from '@/context/NotificationContext';
import { Switch } from "@/components/ui/switch";
import { 
  Bell, 
  Volume2,
  AlertCircle,
  ArrowLeft,
  UserIcon,
  LogOut,
  Clock,
  Filter,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { signOut } from 'next-auth/react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const { 
    soundEnabled, 
    toggleSound, 
    notificationsEnabled, 
    toggleNotifications 
  } = useNotifications();
  const router = useRouter();
  const [online, setOnline] = React.useState(true);
  const [notificationFrequency, setNotificationFrequency] = React.useState("all");
  const [sessionTimeout, setSessionTimeout] = React.useState(true);
  const [showQuestions, setShowQuestions] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      } 
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        if (session?.user?.email) {
          const response = await fetch('/api/settings');
          const data = await response.json();
          
          if (data.success && data.settings) {
            setShowQuestions(data.settings.showQuestions);
          }
        }
      } catch (error) {
        console.error('Error fetching user settings:', error);
      }
    };

    fetchUserSettings();
  }, [session]);

  interface SettingsApiResponse {
    success: boolean;
    message?: string;
  }

  interface SettingsUpdateRequest {
    showQuestions: boolean;
  }

  const toggleShowQuestions = async (value: boolean): Promise<void> => {
    setLoading(true);
    try {
      setShowQuestions(value);
      
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          showQuestions: value
        } as SettingsUpdateRequest),
      });
      
      const data: SettingsApiResponse = await response.json();
      
      if (data.success) {
        toast({
          title: "Setting updated!",
          description: "Your question visibility preference has been updated.",
          className: "bg-green-500 text-white"
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update settings.",
          variant: "destructive"
        });
        setShowQuestions(!value);
      }
    } catch (error: unknown) {
      console.error('Error updating question visibility:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
      setShowQuestions(!value);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved!",
      description: "Your notification preferences have been updated successfully.",
      className:"bg-green-500 text-white"
    });
  };
  
  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-slate-800/90 p-8 rounded-xl shadow-xl max-w-md w-full border border-slate-700/50 backdrop-blur-sm"
        >
          <AlertCircle className="h-16 w-16 text-amber-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-center text-white mb-2">Authentication Required</h1>
          <p className="text-white/70 text-center mb-8">Please sign in to access your settings.</p>
          <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg py-6" 
            onClick={() => router.push('/')}>
            Back to Home
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 pb-16">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="md:hidden fixed top-0 right-0 z-10 px-4 py-3"
      >
        <Button 
          variant="ghost" 
          size="sm" 
          className="rounded-full p-2 hover:bg-slate-700/50 text-slate-300" 
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </motion.div>

      <div className="container max-w-3xl mx-auto px-4 py-8 pt-14 md:pt-8">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="hidden md:flex items-center gap-3 mb-8 mt-2"
          style={{margin:" 5px 0px 5px -450px"}}
        >
          <Button 
            variant="ghost" 
            size="sm" 
            className="rounded-full hover:bg-slate-700/50 text-slate-500 hover:text-white" 
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Button>
          {session.user?.name && (
            <Badge variant="outline" className="ml-auto bg-slate-800/50 text-white/70 px-3 py-1 border-slate-600">
              <UserIcon className="h-3 w-3 mr-1" /> {session.user.name}
            </Badge>
          )}
        </motion.div>

        {session.user?.name && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="md:hidden flex justify-center mb-4"
          >
            <Badge variant="outline" className="bg-slate-800/50 text-white/70 px-3 py-1 border-slate-600">
              <UserIcon className="h-3 w-3 mr-1" /> {session.user.name}
            </Badge>
          </motion.div>
        )}

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden shadow-lg mt-4 md:mt-8"
        >
          <div className="p-4 md:p-6 bg-gradient-to-r from-blue-900/40 to-slate-800/40">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 md:h-7 md:w-7 text-blue-400" />
                <div>
                <h2 className="text-xl md:text-2xl font-bold text-white">Account Settings</h2>
                <p className="text-white/70 text-xs md:text-sm mt-1">
                  Customize your notification preferences and account options
                </p>
                </div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            <motion.div 
              variants={itemVariants}
              className="bg-slate-700/30 rounded-lg p-4 md:p-5 flex items-center justify-between hover:bg-slate-700/40 transition-colors duration-200 border border-transparent hover:border-slate-600/40"
            >
              <div className="flex items-center gap-3 md:gap-4">
                <div className="bg-blue-500/20 p-2 md:p-3 rounded-lg">
                  <Bell className="h-5 w-5 md:h-6 md:w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white text-base md:text-lg">Push Notifications</h3>
                  <p className="text-xs md:text-sm text-white/60">
                    {notificationsEnabled 
                      ? "You'll be notified about updates" 
                      : "You won't receive alerts"}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 md:gap-2">
                <Switch 
                  checked={notificationsEnabled} 
                  onCheckedChange={toggleNotifications}
                  className="data-[state=checked]:bg-blue-500 scale-100 md:scale-110"
                />
                <span className="text-xs font-medium text-slate-300 min-w-10 md:min-w-12 text-center bg-slate-800/70 px-2 py-0.5 rounded-full">
                  {notificationsEnabled ? 'On' : 'Off'}
                </span>
              </div>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="bg-slate-700/30 rounded-lg p-4 md:p-5 flex items-center justify-between hover:bg-slate-700/40 transition-colors duration-200 border border-transparent hover:border-slate-600/40"
            >
              <div className="flex items-center gap-3 md:gap-4">
                <div className="bg-indigo-500/20 p-2 md:p-3 rounded-lg">
                  <Volume2 className="h-5 w-5 md:h-6 md:w-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white text-base md:text-lg">Sound Effects</h3>
                  <p className="text-xs md:text-sm text-white/60">
                    {soundEnabled ? "Audio alerts enabled" : "Silent notifications"}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 md:gap-2">
                <Switch 
                  checked={soundEnabled}
                  onCheckedChange={toggleSound}
                  className="data-[state=checked]:bg-indigo-500 scale-100 md:scale-110"
                />
                <span className="text-xs font-medium text-slate-300 min-w-10 md:min-w-12 text-center bg-slate-800/70 px-2 py-0.5 rounded-full">
                  {soundEnabled ? 'On' : 'Off'}
                </span>
              </div>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="bg-slate-700/30 rounded-lg p-4 md:p-5 flex items-center justify-between hover:bg-slate-700/40 transition-colors duration-200 border border-transparent hover:border-slate-600/40"
            >
              <div className="flex items-center gap-3 md:gap-4">
                <div className={`p-2 md:p-3 rounded-lg ${online ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
                  <div className="relative">
                    <UserIcon className={`h-5 w-5 md:h-6 md:w-6 ${online ? 'text-green-400' : 'text-gray-400'}`} />
                    <span className={`absolute bottom-0 right-0 block h-2 w-2 md:h-2.5 md:w-2.5 rounded-full ring-2 ring-slate-800 ${online ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-white text-base md:text-lg">Online Status</h3>
                  <p className="text-xs md:text-sm text-white/60">
                    {online ? 'Visible to others' : 'Appear offline'}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 md:gap-2">
                <Switch 
                  checked={online}
                  onCheckedChange={setOnline}
                  className="data-[state=checked]:bg-green-500 scale-100 md:scale-110"
                />
                <span className="text-xs font-medium text-slate-300 min-w-10 md:min-w-12 text-center bg-slate-800/70 px-2 py-0.5 rounded-full">
                  {online ? 'Online' : 'Off'}
                </span>
              </div>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="bg-slate-700/30 rounded-lg p-4 md:p-5 flex items-center justify-between hover:bg-slate-700/40 transition-colors duration-200 border border-transparent hover:border-slate-600/40"
            >
              <div className="flex items-center gap-3 md:gap-4">
                <div className="bg-orange-500/20 p-2 md:p-3 rounded-lg">
                  <Clock className="h-5 w-5 md:h-6 md:w-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white text-base md:text-lg">Auto Logout</h3>
                  <p className="text-xs md:text-sm text-white/60">
                    {sessionTimeout ? 'Logout after inactivity' : 'Stay logged in'}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 md:gap-2">
                <Switch 
                  checked={sessionTimeout}
                  onCheckedChange={setSessionTimeout}
                  className="data-[state=checked]:bg-orange-500 scale-100 md:scale-110"
                />
                <span className="text-xs font-medium text-slate-300 min-w-10 md:min-w-12 text-center bg-slate-800/70 px-2 py-0.5 rounded-full">
                  {sessionTimeout ? 'On' : 'Off'}
                </span>
              </div>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="bg-slate-700/30 rounded-lg p-4 md:p-5 flex items-center justify-between hover:bg-slate-700/40 transition-colors duration-200 border border-transparent hover:border-slate-600/40"
            >
              <div className="flex items-center gap-3 md:gap-4">
                <div className="bg-purple-500/20 p-2 md:p-3 rounded-lg">
                  <Eye className="h-5 w-5 md:h-6 md:w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white text-base md:text-lg">Question Visibility</h3>
                  <p className="text-xs md:text-sm text-white/60">
                    {showQuestions ? 'Others can see your questions' : 'Only you can see your questions'}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 md:gap-2">
                <Switch 
                  checked={showQuestions}
                  disabled={loading}
                  onCheckedChange={toggleShowQuestions}
                  className="data-[state=checked]:bg-purple-500 scale-100 md:scale-110"
                />
                <span className="text-xs font-medium text-slate-300 min-w-10 md:min-w-12 text-center bg-slate-800/70 px-2 py-0.5 rounded-full">
                  {showQuestions ? 'Public' : 'Private'}
                </span>
              </div>
            </motion.div>
          </div>
          
          <div className="p-4 md:p-6 bg-slate-800/80">
            <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center md:gap-4">
              <Button
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 w-full md:w-auto md:ml-[284px]"
                onClick={handleSaveSettings}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 md:mt-8 flex justify-center"
        >
          <Button
            variant="outline"
            className="border-slate-700/40 text-slate-400 hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-400 transition-all"
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log Out
          </Button>
        </motion.div>
      </div>
    </div>
  );
}