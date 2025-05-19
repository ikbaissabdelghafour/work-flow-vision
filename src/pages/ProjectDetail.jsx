
import React, { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Plus, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const ProjectDetail = () => {
  const { projectId } = useParams();
  const { 
    getProjectById, 
    getTasksByProject, 
    getTeamById, 
    getEmployeeById, 
    addTask,
    updateTaskStatus,
    employees
  } = useApp();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";
  
  const project = getProjectById(projectId || "");
  
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "todo",
    projectId: projectId || "",
    assignedEmployees: [],
  });
  
  // Handle case when project doesn't exist
  if (!project) {
    return <Navigate to="/projects" />;
  }
  
  const tasks = getTasksByProject(project.id);
  const team = getTeamById(project.teamId);
  const teamEmployees = employees.filter(e => e.teamId === project.teamId);
  
  const todoTasks = tasks.filter(t => t.status === "todo");
  const inProgressTasks = tasks.filter(t => t.status === "in-progress");
  const doneTasks = tasks.filter(t => t.status === "done");
  
  const handleCreateTask = () => {
    if (!newTask.title) {
      toast.error("Task title is required");
      return;
    }
    
    addTask(newTask);
    
    setNewTask({
      title: "",
      description: "",
      status: "todo",
      projectId: projectId || "",
      assignedEmployees: [],
    });
    
    setIsNewTaskOpen(false);
  };
  
  const handleChangeStatus = (taskId, newStatus) => {
    updateTaskStatus(taskId, newStatus);
  };
  
  const renderTaskCard = (task) => {
    const assignedEmployeeNames = task.assignedEmployees
      .map(employeeId => getEmployeeById(employeeId)?.name || "Unknown")
      .join(", ");
      
    return (
      <div key={task.id} className="task-card mb-4">
        <h3 className="font-medium">{task.title}</h3>
        <p className="text-sm text-gray-500 mt-1">{task.description}</p>
        
        {task.assignedEmployees.length > 0 && (
          <div className="mt-3 text-xs text-gray-600">
            <span className="font-medium">Assigned to:</span> {assignedEmployeeNames}
          </div>
        )}
        
        <div className="mt-3 flex justify-between items-center">
          <span className="text-xs text-gray-400">
            {format(new Date(task.createdAt), "MMM d")}
          </span>
          
          {isAdmin && (
            <div className="flex gap-1">
              {task.status !== "in-progress" && task.status !== "done" && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleChangeStatus(task.id, "in-progress")}
                >
                  <ArrowRight className="h-3 w-3 mr-1" />
                  Start
                </Button>
              )}
              
              {task.status !== "done" && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleChangeStatus(task.id, "done")}
                >
                  <ArrowRight className="h-3 w-3 mr-1" />
                  Complete
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-gray-500">{project.description}</p>
        </div>
        
        {isAdmin && (
          <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
            <DialogTrigger asChild>
              <Button className="bg-jira-blue hover:bg-jira-blue/90 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                  Add a new task to {project.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Task Title</Label>
                  <Input 
                    id="title" 
                    placeholder="Enter task title"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe the task"
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assignedEmployees">Assign Employees</Label>
                  <select
                    id="assignedEmployees"
                    multiple
                    className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newTask.assignedEmployees}
                    onChange={(e) => {
                      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                      setNewTask(prev => ({ 
                        ...prev, 
                        assignedEmployees: selectedOptions 
                      }));
                    }}
                  >
                    {teamEmployees.map(employee => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name} - {employee.role}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500">Hold Ctrl/Cmd to select multiple employees</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewTaskOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateTask}>Create Task</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Team</CardTitle>
            <CardDescription>{team?.name || "No Team Assigned"}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {teamEmployees.length > 0 ? (
                teamEmployees.map(employee => (
                  <div key={employee.id} className="flex items-center gap-2 p-2 rounded-md border">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                      {employee.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-xs text-gray-500">{employee.role}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No team members assigned</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd>{format(new Date(project.createdAt), "MMM d, yyyy")}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Tasks</dt>
                <dd>
                  {tasks.length} total ({doneTasks.length} completed)
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Tasks Completed</span>
                    <span className="text-sm font-medium">{Math.round((doneTasks.length / (tasks.length || 1)) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-jira-green h-2 rounded-full" 
                      style={{ width: `${Math.round((doneTasks.length / (tasks.length || 1)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Tasks In Progress</span>
                    <span className="text-sm font-medium">{Math.round((inProgressTasks.length / (tasks.length || 1)) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-jira-purple h-2 rounded-full" 
                      style={{ width: `${Math.round((inProgressTasks.length / (tasks.length || 1)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div>
        <Tabs defaultValue="kanban">
          <TabsList>
            <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
            <TabsTrigger value="list">Task List</TabsTrigger>
          </TabsList>
          
          <TabsContent value="kanban">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <Card>
                <CardHeader className="bg-status-todo/30">
                  <CardTitle>To Do</CardTitle>
                  <CardDescription>{todoTasks.length} tasks</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {todoTasks.length > 0 ? (
                      todoTasks.map(task => renderTaskCard(task))
                    ) : (
                      <p className="text-center py-4 text-gray-500">No tasks</p>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="bg-status-in-progress/30">
                  <CardTitle>In Progress</CardTitle>
                  <CardDescription>{inProgressTasks.length} tasks</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {inProgressTasks.length > 0 ? (
                      inProgressTasks.map(task => renderTaskCard(task))
                    ) : (
                      <p className="text-center py-4 text-gray-500">No tasks</p>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="bg-status-done/30">
                  <CardTitle>Done</CardTitle>
                  <CardDescription>{doneTasks.length} tasks</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {doneTasks.length > 0 ? (
                      doneTasks.map(task => renderTaskCard(task))
                    ) : (
                      <p className="text-center py-4 text-gray-500">No tasks</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="list">
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>All Tasks</CardTitle>
                <CardDescription>{tasks.length} total tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks.length > 0 ? (
                    tasks.map(task => {
                      const status = (() => {
                        switch (task.status) {
                          case "todo": return <span className="status-badge status-todo">To Do</span>;
                          case "in-progress": return <span className="status-badge status-in-progress">In Progress</span>;
                          case "done": return <span className="status-badge status-done">Done</span>;
                          default: return null;
                        }
                      })();
                      
                      const assignedEmployeeNames = task.assignedEmployees
                        .map(employeeId => getEmployeeById(employeeId)?.name || "Unknown")
                        .join(", ");
                        
                      return (
                        <div key={task.id} className="p-4 border rounded-md">
                          <div className="flex justify-between">
                            <h3 className="font-medium">{task.title}</h3>
                            {status}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                            <div>
                              <p className="text-xs text-gray-600 font-medium">Created</p>
                              <p className="text-sm">{format(new Date(task.createdAt), "MMM d, yyyy")}</p>
                            </div>
                            
                            {assignedEmployeeNames && (
                              <div>
                                <p className="text-xs text-gray-600 font-medium">Assigned To</p>
                                <p className="text-sm">{assignedEmployeeNames}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-center py-4 text-gray-500">No tasks found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProjectDetail;
