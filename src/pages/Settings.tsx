
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { Navigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle2, Clock, Loader2, Settings as SettingsIcon, User, Users } from "lucide-react";

const Settings: React.FC = () => {
  const { currentUser } = useAuth();
  const { projects, tasks, employees, teams, getTasksByProject, getEmployeesByTeam, isLoading } = useApp();
  
  const [clientProjects, setClientProjects] = useState<any[]>([]);
  const [clientTasks, setClientTasks] = useState<any[]>([]);
  
  // Load client-specific data if the user is a client
  useEffect(() => {
    if (currentUser?.role === "client" && currentUser?.email) {
      // Find the employee record that matches the client's email
      const clientEmployee = employees.find(emp => emp.email === currentUser.email);
      
      if (clientEmployee) {
        // Get projects associated with the client's team
        const clientTeam = teams.find(team => team.id === clientEmployee.teamId);
        if (clientTeam) {
          const teamProjects = projects.filter(project => project.teamId === clientTeam.id);
          setClientProjects(teamProjects);
          
          // Get all tasks from these projects
          const allTasks = teamProjects.flatMap(project => getTasksByProject(project.id));
          setClientTasks(allTasks);
        }
      }
    }
  }, [currentUser, employees, teams, projects, tasks, getTasksByProject]);
  
  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Settings saved", {
      description: "Your changes have been saved successfully."
    });
  };
  
  const handleSaveNotifications = (e: React.FormEvent) => {
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
      
      <Tabs defaultValue={currentUser?.role === "client" ? "projects" : "general"}>
        <TabsList>
          {currentUser?.role === "client" && (
            <TabsTrigger value="projects">My Projects</TabsTrigger>
          )}
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        
        {currentUser?.role === "client" && (
          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>My Projects</CardTitle>
                <CardDescription>View and track your projects and tasks</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-3">Loading your projects...</span>
                  </div>
                ) : clientProjects.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Users className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium text-gray-500">No projects found</h3>
                    <p className="mt-2 text-sm text-gray-400">You don't have any projects assigned yet</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {clientProjects.map(project => {
                      const projectTasks = clientTasks.filter(task => task.projectId === project.id);
                      const completedTasks = projectTasks.filter(task => task.status === "done").length;
                      const progress = projectTasks.length > 0 
                        ? Math.round((completedTasks / projectTasks.length) * 100) 
                        : 0;
                      
                      return (
                        <div key={project.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold">{project.name}</h3>
                              <p className="text-sm text-gray-500">{project.description}</p>
                            </div>
                            <Badge variant={progress === 100 ? "success" : "default"}>
                              {progress}% Complete
                            </Badge>
                          </div>
                          
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          
                          <div className="mt-4">
                            <h4 className="font-medium mb-2">Tasks</h4>
                            {projectTasks.length === 0 ? (
                              <p className="text-sm text-gray-500">No tasks for this project yet</p>
                            ) : (
                              <div className="space-y-2">
                                {projectTasks.map(task => (
                                  <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <div className="flex items-center">
                                      {task.status === "done" ? (
                                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                                      ) : (
                                        <Clock className="h-4 w-4 text-amber-500 mr-2" />
                                      )}
                                      <span className="text-sm">{task.title}</span>
                                    </div>
                                    <Badge variant={task.status === "done" ? "success" : task.status === "in-progress" ? "default" : "outline"}>
                                      {task.status === "in-progress" ? "In Progress" : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
        
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
