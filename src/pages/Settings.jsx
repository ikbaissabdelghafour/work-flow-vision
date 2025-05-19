
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const Settings = () => {
  const { currentUser } = useAuth();
  
  // Only admins can access this page
  if (currentUser?.role !== "admin") {
    return <Navigate to="/" />;
  }
  
  const handleSaveGeneral = (e) => {
    e.preventDefault();
    toast.success("Settings saved", {
      description: "Your changes have been saved successfully."
    });
  };
  
  const handleSaveNotifications = (e) => {
    e.preventDefault();
    toast.success("Notification settings saved", {
      description: "Your notification preferences have been updated."
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>
      
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage your workspace settings</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveGeneral} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    <Input id="company" defaultValue="Acme Corporation" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" type="url" defaultValue="https://example.com" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Company Description</Label>
                    <Textarea id="description" defaultValue="A company that creates innovative solutions for modern problems." />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Default Timezone</Label>
                    <select
                      id="timezone"
                      defaultValue="UTC+1"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="UTC">UTC</option>
                      <option value="UTC+1">UTC+1 (Central European Time)</option>
                      <option value="UTC-5">UTC-5 (Eastern Standard Time)</option>
                      <option value="UTC-8">UTC-8 (Pacific Standard Time)</option>
                    </select>
                  </div>
                </div>
                
                <Button type="submit">Save Changes</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveNotifications} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                    <input 
                      type="checkbox" 
                      id="email-notifications" 
                      defaultChecked={true}
                      className="h-4 w-4 rounded border-gray-300 text-jira-blue focus:ring-jira-blue"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="task-updates">Task Updates</Label>
                      <p className="text-sm text-gray-500">Get notified when task status changes</p>
                    </div>
                    <input 
                      type="checkbox" 
                      id="task-updates" 
                      defaultChecked={true}
                      className="h-4 w-4 rounded border-gray-300 text-jira-blue focus:ring-jira-blue"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="project-updates">Project Updates</Label>
                      <p className="text-sm text-gray-500">Get notified about project changes</p>
                    </div>
                    <input 
                      type="checkbox" 
                      id="project-updates" 
                      defaultChecked={true}
                      className="h-4 w-4 rounded border-gray-300 text-jira-blue focus:ring-jira-blue"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="mentions">Mentions</Label>
                      <p className="text-sm text-gray-500">Get notified when you're mentioned</p>
                    </div>
                    <input 
                      type="checkbox" 
                      id="mentions" 
                      defaultChecked={true}
                      className="h-4 w-4 rounded border-gray-300 text-jira-blue focus:ring-jira-blue"
                    />
                  </div>
                </div>
                
                <Button type="submit">Save Preferences</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue={currentUser?.name} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue={currentUser?.email} />
                  </div>
                  
                  <div className="pb-4 border-b">
                    <p className="text-sm text-gray-500">Account Type</p>
                    <p className="font-medium capitalize">{currentUser?.role}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <Button
                    onClick={() => {
                      toast.success("Password changed", {
                        description: "Your password has been changed successfully."
                      });
                    }}
                  >
                    Update Password
                  </Button>
                  
                  <Button variant="outline">Cancel</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
