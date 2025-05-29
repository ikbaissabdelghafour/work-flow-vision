
import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Users, UserPlus } from "lucide-react";
import { Employee, Team } from "@/types";

const Teams: React.FC = () => {
  const { teams, employees, addEmployee, addTeam, isLoading } = useApp();
  const { currentUser } = useAuth();
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNewTeamOpen, setIsNewTeamOpen] = useState(false);
  const [isNewEmployeeOpen, setIsNewEmployeeOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [newEmployee, setNewEmployee] = useState<Omit<Employee, "id" | "avatar"> & { teamId: string }>({
    email: "",
    role: "",
    teamId: "",
  });
  const [newTeam, setNewTeam] = useState<Omit<Team, "id">>({
    name: "",
    employeeIds: [],
  });
  
  const handleAddEmployee = async () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.role || !newEmployee.teamId) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsAddingEmployee(true);
    setError(null);
    
    try {
      await addEmployee(newEmployee);
      
      setNewEmployee({
        name: "",
        email: "",
        role: "",
        teamId: "",
      });
      
      setIsNewEmployeeOpen(false);
      toast.success(`Employee "${newEmployee.name}" has been added successfully`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add employee');
      toast.error("Failed to add employee", {
        description: err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    } finally {
      setIsAddingEmployee(false);
    }
  };
  
  const handleAddTeam = async () => {
    if (!newTeam.name) {
      toast.error("Please enter a team name");
      return;
    }
    
    setIsAddingTeam(true);
    setError(null);
    
    try {
      await addTeam(newTeam);
      
      setNewTeam({
        name: "",
        employeeIds: [],
      });
      
      setIsNewTeamOpen(false);
      toast.success(`Team "${newTeam.name}" has been created successfully`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create team');
      toast.error("Failed to create team", {
        description: err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    } finally {
      setIsAddingTeam(false);
    }
  };
  
  const openNewEmployeeDialog = (team: Team) => {
    setSelectedTeam(team);
    setNewEmployee(prev => ({ ...prev, teamId: team.id }));
    setIsNewEmployeeOpen(true);
  };
  
  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Teams</h1>
        
        <Dialog open={isNewTeamOpen} onOpenChange={setIsNewTeamOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              <span>Create Team</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>
                Add a new team to your organization
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="teamName">Team Name</Label>
                <Input 
                  id="teamName" 
                  placeholder="Enter team name"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewTeamOpen(false)}>Cancel</Button>
              <Button onClick={handleAddTeam} disabled={isAddingTeam}>
                {isAddingTeam ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    Creating...
                  </>
                ) : (
                  'Create Team'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={isNewEmployeeOpen} onOpenChange={setIsNewEmployeeOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Team Member</DialogTitle>
              <DialogDescription>
                Add a new employee to {selectedTeam?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Employee Name</Label>
                <Input 
                  id="name" 
                  placeholder="Full name"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email"
                  placeholder="Email address"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input 
                  id="role" 
                  placeholder="Job title or role"
                  value={newEmployee.role}
                  onChange={(e) => setNewEmployee(prev => ({ ...prev, role: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teamId">Team</Label>
                <select
                  id="teamId"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newEmployee.teamId}
                  onChange={(e) => setNewEmployee(prev => ({ ...prev, teamId: e.target.value }))}
                >
                  <option value="">Select a team</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewEmployeeOpen(false)}>Cancel</Button>
              <Button onClick={handleAddEmployee} disabled={isAddingEmployee}>
                {isAddingEmployee ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    Adding...
                  </>
                ) : (
                  'Add Employee'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3">Loading teams...</span>
        </div>
      ) : teams.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-500">No teams found</h3>
          <p className="mt-2 text-sm text-gray-400">Get started by creating a new team</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map(team => {
          const teamEmployees = employees.filter(employee => employee.teamId === team.id);
          
          return (
            <Card key={team.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-jira-blue/20 flex items-center justify-center">
                      <Users className="h-4 w-4 text-jira-blue" />
                    </div>
                    <div>
                      <CardTitle>{team.name}</CardTitle>
                      <CardDescription>{teamEmployees.length} members</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teamEmployees.map(employee => (
                    <div key={employee.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50">
                      <Avatar>
                        <AvatarImage src={employee.avatar} />
                        <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-xs text-gray-500">{employee.role}</p>
                      </div>
                    </div>
                  ))}
                  
                  {teamEmployees.length === 0 && (
                    <p className="text-center py-4 text-gray-500">No team members yet</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full flex items-center gap-1"
                  onClick={() => openNewEmployeeDialog(team)}
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Add Member</span>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
        </div>
      )}
    </div>
  );
};

export default Teams;
