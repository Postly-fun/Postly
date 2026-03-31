'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { User, Shield, Wallet, Save, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const { user, setUser } = useStore();
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    email: user?.email || '',
    avatarUrl: user?.avatarUrl || '',
    xHandle: user?.xHandle || '',
    telegramHandle: user?.telegramHandle || '',
    password: '',
  });

  if (!user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const res = await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        toast.success('Settings updated successfully!');
        setFormData(prev => ({ ...prev, password: '' })); // clear password
      } else {
        toast.error(data.error || 'Failed to update settings');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full flex-1 min-h-screen bg-white">
      <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-gray-100 flex items-center h-[52px] px-4">
        <h1 className="text-xl font-bold font-sans">Settings</h1>
      </div>

      <div className="p-6 max-w-2xl mx-auto space-y-8">
        {/* Profile Settings */}
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 text-purple-600 mb-1">
               <User className="w-4 h-4" />
               <span className="text-xs font-bold uppercase tracking-wider">Public Profile</span>
            </div>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>Update your public information that other users will see.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
               <div className="space-y-4">
                  <Label>Profile Picture</Label>
                  <div className="flex items-center gap-6">
                     <div className="w-20 h-20 rounded-full bg-purple-50 border-2 border-purple-100 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
                        {formData.avatarUrl ? (
                           <img src={formData.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                           <span className="text-3xl font-bold text-purple-300">{formData.displayName.charAt(0)}</span>
                        )}
                     </div>
                     <div className="flex-1 space-y-2">
                        <Input 
                           value={formData.avatarUrl}
                           onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                           placeholder="Enter Image URL (e.g., https://...)"
                           className="rounded-xl border-purple-100 focus-visible:ring-purple-600"
                        />
                        <p className="text-[10px] text-gray-400 italic">Provide a link to an image. Use services like Imgur or Unsplash.</p>
                     </div>
                  </div>
               </div>

               <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input 
                    id="displayName" 
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    placeholder="Your Name"
                    className="rounded-xl border-purple-100 focus-visible:ring-purple-600"
                  />
               </div>

               <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea 
                    id="bio" 
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell the world about yourself..."
                    className="resize-none h-24"
                  />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="xHandle">X Handle (Optional)</Label>
                    <Input 
                      id="xHandle" 
                      value={formData.xHandle}
                      onChange={(e) => setFormData({ ...formData, xHandle: e.target.value })}
                      placeholder="@username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telegramHandle">Telegram Handle (Optional)</Label>
                    <Input 
                      id="telegramHandle" 
                      value={formData.telegramHandle}
                      onChange={(e) => setFormData({ ...formData, telegramHandle: e.target.value })}
                      placeholder="@username"
                    />
                  </div>
               </div>

               <Button disabled={isSaving} type="submit" className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700">
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Save Profile Changes
               </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
               <Shield className="w-4 h-4" />
               <span className="text-xs font-bold uppercase tracking-wider">Account Security</span>
            </div>
            <CardTitle>Security & Email</CardTitle>
            <CardDescription>Manage your account credentials and security preferences.</CardDescription>
          </CardHeader>
          <CardContent>
             <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                   <Label htmlFor="email">Email Address</Label>
                   <Input 
                     id="email" 
                     type="email"
                     value={formData.email}
                     onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                     placeholder="email@example.com"
                   />
                </div>

                <div className="space-y-2">
                   <Label htmlFor="password">Change Password</Label>
                   <Input 
                     id="password" 
                     type="password"
                     value={formData.password}
                     onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                     placeholder="New password (leave blank to keep current)"
                   />
                </div>

                <Button disabled={isSaving} type="submit" variant="outline" className="w-full sm:w-auto border-gray-200">
                   {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                   Update Security Settings
                </Button>
             </form>
          </CardContent>
        </Card>

        {/* Wallet Information */}
        <Card className="border-gray-100 shadow-sm bg-gray-50/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
               <Wallet className="w-4 h-4" />
               <span className="text-xs font-bold uppercase tracking-wider">Blockchain Info</span>
            </div>
            <CardTitle>Wallet Address</CardTitle>
            <CardDescription>Your permanent custodial Solana wallet address for this account.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="p-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between">
                <code className="text-xs font-mono text-purple-700 break-all select-all">{user.walletAddress}</code>
             </div>
             <p className="text-[10px] text-gray-400 mt-2 italic px-1">
                * Note: This wallet is generated uniquely for you. Never share your private keys if exported.
             </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
