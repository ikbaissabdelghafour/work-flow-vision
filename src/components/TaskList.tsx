import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Edit, Trash2, Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { toast } from './ui/use-toast';
import TaskForm from './TaskForm';

// Types
interface Task {
  id: number;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  project_id: number;
  team_id: number | null;
  tjm: number | null;
  days_spent: number | null;
  created_at: string;
  updated_at: string;
  project?: {
    id: number;
    name: string;
  };
  team?: {
    id: number;
    name: string;
  };
  employees: Array<{
    id: number;
    name: string;
  }>;
}

interface Project {
  id: number;
  name: string;
  team_id: number;
}

interface Team {
  id: number;
  name: string;
}

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [openTaskId, setOpenTaskId] = useState<number | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const navigate = useNavigate();
  
  // API base URL - adjust based on your Laravel API endpoint
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  // Fetch all tasks, projects, and teams on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Get the token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/login');
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        // Fetch tasks, projects, and teams in parallel
        const [tasksRes, projectsRes, teamsRes] = await Promise.all([
          axios.get(`${API_URL}/tasks`, { headers }),
          axios.get(`${API_URL}/projects`, { headers }),
          axios.get(`${API_URL}/teams`, { headers }),
        ]);

        setTasks(tasksRes.data);
        setProjects(projectsRes.data);
        setTeams(teamsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load tasks. Please try again later.',
          variant: 'destructive',
        });
        
        // If unauthorized, redirect to login
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate, API_URL]);

  // Filter tasks by project and team
  const filteredTasks = tasks.filter((task) => {
    const matchesProject = selectedProject === 'all' || task.project_id.toString() === selectedProject;
    const matchesTeam = selectedTeam === 'all' || (task.team_id && task.team_id.toString() === selectedTeam);
    return matchesProject && matchesTeam;
  });

  // Handle task deletion
  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove task from state
      setTasks(tasks.filter((task) => task.id !== taskId));

      toast({
        title: 'Success',
        description: 'Task deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete task',
        variant: 'destructive',
      });
    }
  };

  // Handle task status update
  const handleStatusChange = async (taskId: number, newStatus: 'todo' | 'in-progress' | 'done') => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${API_URL}/tasks/${taskId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update task in state
      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );

      toast({
        title: 'Success',
        description: 'Task status updated',
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task status',
        variant: 'destructive',
      });
    }
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'todo':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> To Do</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1"><Clock className="h-3 w-3" /> In Progress</Badge>;
      case 'done':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Done</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // After task is created or updated
  const handleTaskSaved = (savedTask: Task) => {
    // Check if it's an update or a new task
    const isUpdate = tasks.some((task) => task.id === savedTask.id);
    
    if (isUpdate) {
      // Update the task in the state
      setTasks(tasks.map((task) => (task.id === savedTask.id ? savedTask : task)));
    } else {
      // Add the new task to the state
      setTasks([...tasks, savedTask]);
    }
    
    // Close the dialogs
    setOpenAddDialog(false);
    setEditTask(null);
    
    toast({
      title: 'Success',
      description: `Task ${isUpdate ? 'updated' : 'created'} successfully`,
    });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading tasks...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <TaskForm 
              onSave={handleTaskSaved} 
              projects={projects} 
              teams={teams}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Filter by Project</label>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger>
              <SelectValue placeholder="Select Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id.toString()}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Filter by Team</label>
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger>
              <SelectValue placeholder="Select Team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id.toString()}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center py-10 border rounded-lg bg-gray-50">
          <p className="text-gray-500">No tasks found. Create a new task to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <Card key={task.id} className="overflow-hidden border-l-4" style={{ 
              borderLeftColor: task.status === 'todo' 
                ? '#3b82f6' 
                : task.status === 'in-progress' 
                ? '#f59e0b' 
                : '#10b981' 
            }}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-medium">{task.title}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Dialog>
                        <DialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => {
                            e.preventDefault();
                            setEditTask(task);
                          }}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>Edit Task</DialogTitle>
                          </DialogHeader>
                          {editTask && (
                            <TaskForm
                              task={editTask}
                              onSave={handleTaskSaved}
                              projects={projects}
                              teams={teams}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                      <DropdownMenuItem onSelect={(e) => {
                        e.preventDefault();
                        handleDeleteTask(task.id);
                      }}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={(e) => {
                        e.preventDefault();
                        if (task.status !== 'todo') {
                          handleStatusChange(task.id, 'todo');
                        }
                      }} disabled={task.status === 'todo'}>
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Mark as To Do
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={(e) => {
                        e.preventDefault();
                        if (task.status !== 'in-progress') {
                          handleStatusChange(task.id, 'in-progress');
                        }
                      }} disabled={task.status === 'in-progress'}>
                        <Clock className="mr-2 h-4 w-4" />
                        Mark as In Progress
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={(e) => {
                        e.preventDefault();
                        if (task.status !== 'done') {
                          handleStatusChange(task.id, 'done');
                        }
                      }} disabled={task.status === 'done'}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Done
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex gap-2 mt-2">
                  {getStatusBadge(task.status)}
                  {task.project && (
                    <Badge variant="secondary">
                      {task.project.name}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="text-gray-600 line-clamp-2">{task.description}</p>
                
                {task.employees?.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users className="h-4 w-4" />
                      <span>Assigned to:</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {task.employees.map(employee => (
                        <Badge key={employee.id} variant="outline" className="bg-gray-50">
                          {employee.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0 text-xs text-gray-500">
                {task.team ? (
                  <div>Team: {task.team.name}</div>
                ) : null}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Task edit dialog */}
      {editTask && (
        <Dialog open={!!editTask} onOpenChange={(open) => !open && setEditTask(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
            </DialogHeader>
            <TaskForm
              task={editTask}
              onSave={handleTaskSaved}
              projects={projects}
              teams={teams}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TaskList;