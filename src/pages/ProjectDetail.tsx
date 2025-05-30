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
  CardFooter,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { format } from "date-fns";
import { Task, TaskStatus } from "@/types";
import { 
  Plus, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  Edit, 
  Trash, 
  Loader2, 
  Calendar, 
  User, 
  Clock, 
  DollarSign, 
  CheckCircle, 
  AlertCircle, 
  MoreHorizontal 
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams();
  const { 
    getProjectById, 
    getTasksByProject, 
    getTeamById, 
    getEmployeeById, 
    addTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    employees
  } = useApp();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";
  const isEmployee = currentUser?.role !== "admin";
  
  const project = getProjectById(projectId || "");
  
  // State for task management
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [isDeleteTaskOpen, setIsDeleteTaskOpen] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);
  const [isDeletingTask, setIsDeletingTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  
  const [newTask, setNewTask] = useState<Omit<Task, "id" | "createdAt">>({
    title: "",
    description: "",
    status: "todo",
    projectId: projectId || "",
    assignedEmployees: [],
    tjm: project?.tjm || 0,
    daysSpent: 0,
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
  
  // Toggle task expansion
  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };
  
  // Open edit task dialog
  const openEditTaskDialog = (task: Task) => {
    setSelectedTask(task);
    setIsEditTaskOpen(true);
  };
  
  // Open delete task dialog
  const openDeleteTaskDialog = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteTaskOpen(true);
  };
  
  // Handle task creation
  const handleCreateTask = async () => {
    if (!newTask.title) {
      toast.error("Task title is required");
      return;
    }
    
    setIsCreatingTask(true);
    
    try {
      await addTask(newTask);
      
      setNewTask({
        title: "",
        description: "",
        status: "todo",
        projectId: projectId || "",
        assignedEmployees: [],
        tjm: project?.tjm || 0,
        daysSpent: 0,
      });
      
      toast.success("Task created successfully");
      setIsNewTaskOpen(false);
    } catch (error) {
      toast.error("Failed to create task");
      console.error("Error creating task:", error);
    } finally {
      setIsCreatingTask(false);
    }
  };
  
  // Handle task update
  const handleUpdateTask = async () => {
    if (!selectedTask || !selectedTask.title) {
      toast.error("Task title is required");
      return;
    }
    
    setIsUpdatingTask(true);
    
    try {
      await updateTask(selectedTask.id, selectedTask);
      toast.success("Task updated successfully");
      setIsEditTaskOpen(false);
    } catch (error) {
      toast.error("Failed to update task");
      console.error("Error updating task:", error);
    } finally {
      setIsUpdatingTask(false);
    }
  };
  
  // Handle task deletion
  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    
    setIsDeletingTask(true);
    
    try {
      await deleteTask(selectedTask.id);
      toast.success("Task deleted successfully");
      setIsDeleteTaskOpen(false);
    } catch (error) {
      toast.error("Failed to delete task");
      console.error("Error deleting task:", error);
    } finally {
      setIsDeletingTask(false);
    }
  };
  
  // Handle task status change
  const handleChangeStatus = (taskId: string, newStatus: TaskStatus) => {
    updateTaskStatus(taskId, newStatus);
  };
  
  // Render task card with collapsible content
  const renderTaskCard = (task: Task) => {
    const assignedEmployeeNames = task.assignedEmployees
      .map(employeeId => getEmployeeById(employeeId)?.name || "Unknown")
      .join(", ");
    
    const isExpanded = expandedTasks[task.id] || false;
    
    // Status badge color
    const getStatusBadge = (status: TaskStatus) => {
      switch(status) {
        case "todo":
          return <Badge variant="outline" className="bg-gray-100">To Do</Badge>;
        case "in-progress":
          return <Badge variant="outline" className="bg-blue-100 text-blue-800">In Progress</Badge>;
        case "done":
          return <Badge variant="outline" className="bg-green-100 text-green-800">Done</Badge>;
        default:
          return <Badge variant="outline">Unknown</Badge>;
      }
    };
      
    return (
      <div key={task.id} className="mb-4">
        <Collapsible
          open={isExpanded}
          onOpenChange={() => toggleTaskExpansion(task.id)}
          className="border rounded-md overflow-hidden transition-all duration-200 hover:shadow-sm"
        >
          <div className="p-3 flex items-center justify-between bg-white">
            <div className="flex items-center space-x-2">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <span className="font-medium">{task.title}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {getStatusBadge(task.status)}
              
              {isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => openEditTaskDialog(task)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Task
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600 cursor-pointer"
                      onClick={() => openDeleteTaskDialog(task)}
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete Task
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          
          <CollapsibleContent>
            <div className="p-3 pt-0 border-t bg-gray-50">
              {task.description && (
                <div className="mb-3">
                  <p className="text-sm text-gray-700">{task.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                {task.assignedEmployees.length > 0 && (
                  <div className="flex items-start space-x-2">
                    <User className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Assigned to</p>
                      <p className="text-sm">{assignedEmployeeNames}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Created</p>
                    <p className="text-sm">{format(new Date(task.createdAt), "MMM d, yyyy")}</p>
                  </div>
                </div>
                
                {task.tjm > 0 && (
                  <div className="flex items-start space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600 font-medium">TJM</p>
                      <p className="text-sm">€{task.tjm}</p>
                    </div>
                  </div>
                )}
                
                {task.daysSpent > 0 && (
                  <div className="flex items-start space-x-2">
                    <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Days Required</p>
                      <p className="text-sm">{task.daysSpent} day{task.daysSpent !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                )}
                
                {task.daysSpent > 0 && task.tjm > 0 && (
                  <div className="flex items-start space-x-2 col-span-full">
                    <DollarSign className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Total Cost</p>
                      <p className="text-sm font-medium">€{(task.daysSpent * task.tjm).toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Status change buttons - only visible to employees assigned to this task */}
              {isEmployee && task.assignedEmployees.includes(currentUser?.id || '') && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-600 mb-2">Update Status</p>
                  <div className="flex flex-wrap gap-2">
                    {task.status !== "todo" && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleChangeStatus(task.id, "todo")}
                        className="bg-gray-100 hover:bg-gray-200"
                      >
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Mark as To Do
                      </Button>
                    )}
                    
                    {task.status !== "in-progress" && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleChangeStatus(task.id, "in-progress")}
                        className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                      >
                        <ArrowRight className="h-3 w-3 mr-1" />
                        Mark as In Progress
                      </Button>
                    )}
                    
                    {task.status !== "done" && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleChangeStatus(task.id, "done")}
                        className="bg-green-100 text-green-800 hover:bg-green-200"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Mark as Done
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
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
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
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
                  
                  <div className="mb-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="assignAllEmployees"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        onChange={(e) => {
                          if (e.target.checked) {
                            // Select all team members' IDs
                            const allTeamMemberIds = teamEmployees.map(emp => emp.id);
                            setNewTask(prev => ({ 
                              ...prev, 
                              assignedEmployees: allTeamMemberIds
                            }));
                          } else {
                            // Clear all selections
                            setNewTask(prev => ({
                              ...prev,
                              assignedEmployees: []
                            }));
                          }
                        }}
                        checked={teamEmployees.length > 0 && newTask.assignedEmployees.length === teamEmployees.length && teamEmployees.every(emp => newTask.assignedEmployees.includes(emp.id))}
                      />
                      <Label htmlFor="assignAllEmployees" className="font-medium text-sm">
                        Assign to all team members
                      </Label>
                    </div>
                    {teamEmployees.length > 0 && 
                     newTask.assignedEmployees.length === teamEmployees.length && 
                     teamEmployees.every(emp => newTask.assignedEmployees.includes(emp.id)) && (
                      <p className="text-xs text-gray-500 mt-1">
                        This task will be assigned to all team members
                      </p>
                    )}
                  </div>
                  
                  <div className="border rounded-md p-3 max-h-60 overflow-y-auto">
                      {teamEmployees.length > 0 ? (
                        <div className="space-y-2">
                          {teamEmployees.map(employee => (
                            <div key={employee.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`employee-${employee.id}`}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                checked={newTask.assignedEmployees.includes(employee.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    // Add employee to selection
                                    setNewTask(prev => ({
                                      ...prev,
                                      assignedEmployees: [...prev.assignedEmployees, employee.id]
                                    }));
                                  } else {
                                    // Remove employee from selection
                                    setNewTask(prev => ({
                                      ...prev,
                                      assignedEmployees: prev.assignedEmployees.filter(id => id !== employee.id)
                                    }));
                                  }
                                }}
                              />
                              <label 
                                htmlFor={`employee-${employee.id}`}
                                className="text-sm font-medium text-gray-700 flex-1"
                              >
                                {employee.name}
                              </label>
                              <span className="text-xs text-gray-500">{employee.role}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">
                          No employees available in this team
                        </p>
                      )}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tjm">TJM (€)</Label>
                    <Input 
                      id="tjm" 
                      type="number"
                      placeholder="Daily rate"
                      value={newTask.tjm || ""}
                      onChange={(e) => setNewTask(prev => ({ ...prev, tjm: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="daysSpent">Estimated Days</Label>
                    <Input 
                      id="daysSpent" 
                      type="number"
                      placeholder="Days required"
                      value={newTask.daysSpent || ""}
                      onChange={(e) => setNewTask(prev => ({ ...prev, daysSpent: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewTaskOpen(false)} disabled={isCreatingTask}>Cancel</Button>
                <Button onClick={handleCreateTask} disabled={isCreatingTask}>
                  {isCreatingTask ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Task'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        
        {/* Edit Task Dialog */}
        <Dialog open={isEditTaskOpen} onOpenChange={setIsEditTaskOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
              <DialogDescription>
                Update task details
              </DialogDescription>
            </DialogHeader>
            {selectedTask && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Task Title</Label>
                  <Input 
                    id="edit-title" 
                    placeholder="Enter task title"
                    value={selectedTask.title}
                    onChange={(e) => setSelectedTask(prev => prev ? { ...prev, title: e.target.value } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea 
                    id="edit-description" 
                    placeholder="Describe the task"
                    value={selectedTask.description}
                    onChange={(e) => setSelectedTask(prev => prev ? { ...prev, description: e.target.value } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-assignedEmployees">Assign Employees</Label>
                  
                  <div className="mb-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="edit-assignAllEmployees"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        onChange={(e) => {
                          if (!selectedTask) return;
                          
                          if (e.target.checked) {
                            // Select all team members' IDs
                            const allTeamMemberIds = teamEmployees.map(emp => emp.id);
                            setSelectedTask({
                              ...selectedTask,
                              assignedEmployees: allTeamMemberIds
                            });
                          } else {
                            // Clear all selections
                            setSelectedTask({
                              ...selectedTask,
                              assignedEmployees: []
                            });
                          }
                        }}
                        checked={selectedTask && teamEmployees.length > 0 && selectedTask.assignedEmployees.length === teamEmployees.length && teamEmployees.every(emp => selectedTask.assignedEmployees.includes(emp.id))}
                      />
                      <Label htmlFor="edit-assignAllEmployees" className="font-medium text-sm">
                        Assign to all team members
                      </Label>
                    </div>
                    {selectedTask && teamEmployees.length > 0 && 
                     selectedTask.assignedEmployees.length === teamEmployees.length && 
                     teamEmployees.every(emp => selectedTask.assignedEmployees.includes(emp.id)) && (
                      <p className="text-xs text-gray-500 mt-1">
                        This task will be assigned to all team members
                      </p>
                    )}
                  </div>
                  
                  <div className="border rounded-md p-3 max-h-60 overflow-y-auto">
                    {teamEmployees.length > 0 ? (
                      <div className="space-y-2">
                        {teamEmployees.map(employee => (
                          <div key={employee.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`edit-employee-${employee.id}`}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              checked={selectedTask?.assignedEmployees.includes(employee.id)}
                              onChange={(e) => {
                                if (!selectedTask) return;
                                
                                if (e.target.checked) {
                                  // Add employee to selection
                                  setSelectedTask({
                                    ...selectedTask,
                                    assignedEmployees: [...selectedTask.assignedEmployees, employee.id]
                                  });
                                } else {
                                  // Remove employee from selection
                                  setSelectedTask({
                                    ...selectedTask,
                                    assignedEmployees: selectedTask.assignedEmployees.filter(id => id !== employee.id)
                                  });
                                }
                              }}
                            />
                            <label 
                              htmlFor={`edit-employee-${employee.id}`}
                              className="text-sm font-medium text-gray-700 flex-1"
                            >
                              {employee.name}
                            </label>
                            <span className="text-xs text-gray-500">{employee.role}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No employees available in this team
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-tjm">TJM (€)</Label>
                    <Input 
                      id="edit-tjm" 
                      type="number"
                      placeholder="Daily rate"
                      value={selectedTask.tjm || ""}
                      onChange={(e) => setSelectedTask(prev => prev ? { ...prev, tjm: parseInt(e.target.value) || 0 } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-daysSpent">Estimated Days</Label>
                    <Input 
                      id="edit-daysSpent" 
                      type="number"
                      placeholder="Days required"
                      value={selectedTask.daysSpent || ""}
                      onChange={(e) => setSelectedTask(prev => prev ? { ...prev, daysSpent: parseInt(e.target.value) || 0 } : null)}
                    />
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditTaskOpen(false)} disabled={isUpdatingTask}>Cancel</Button>
              <Button onClick={handleUpdateTask} disabled={isUpdatingTask}>
                {isUpdatingTask ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Task'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Delete Task Dialog */}
        <Dialog open={isDeleteTaskOpen} onOpenChange={setIsDeleteTaskOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Task</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this task? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {selectedTask && (
              <div className="p-4 my-4 border rounded-md bg-gray-50">
                <h3 className="font-medium">{selectedTask.title}</h3>
                {selectedTask.description && (
                  <p className="text-sm text-gray-500 mt-1">{selectedTask.description}</p>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteTaskOpen(false)} disabled={isDeletingTask}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteTask} disabled={isDeletingTask}>
                {isDeletingTask ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Task'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="kanban" className="mt-6">
        <TabsList>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
        </TabsList>
        
        <TabsContent value="kanban" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-t-4 border-t-gray-400">
              <CardHeader className="bg-gray-50">
                <CardTitle className="text-gray-700 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 text-gray-500" />
                  To Do
                </CardTitle>
                <CardDescription>{todoTasks.length} task{todoTasks.length !== 1 ? 's' : ''}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                {todoTasks.length > 0 ? (
                  todoTasks.map(task => renderTaskCard(task))
                ) : (
                  <div className="text-center py-8 text-gray-400 italic">
                    No tasks to do
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="border-t-4 border-t-blue-400">
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-blue-700 flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2 text-blue-500" />
                  In Progress
                </CardTitle>
                <CardDescription>{inProgressTasks.length} task{inProgressTasks.length !== 1 ? 's' : ''}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                {inProgressTasks.length > 0 ? (
                  inProgressTasks.map(task => renderTaskCard(task))
                ) : (
                  <div className="text-center py-8 text-gray-400 italic">
                    No tasks in progress
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="border-t-4 border-t-green-400">
              <CardHeader className="bg-green-50">
                <CardTitle className="text-green-700 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Done
                </CardTitle>
                <CardDescription>{doneTasks.length} task{doneTasks.length !== 1 ? 's' : ''}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                {doneTasks.length > 0 ? (
                  doneTasks.map(task => renderTaskCard(task))
                ) : (
                  <div className="text-center py-8 text-gray-400 italic">
                    No completed tasks
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="list" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>All Tasks</CardTitle>
              <CardDescription>
                {tasks.length} task{tasks.length !== 1 ? 's' : ''} in this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.length > 0 ? (
                  tasks.map(task => renderTaskCard(task))
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new task.</p>
                    {isAdmin && (
                      <div className="mt-6">
                        <Button
                          onClick={() => setIsNewTaskOpen(true)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          New Task
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetail;
