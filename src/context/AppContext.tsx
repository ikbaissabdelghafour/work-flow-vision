import React, { useState, useEffect, createContext, useCallback } from "react";
import { AppState, Project, Task, Employee, Team, TaskStatus } from "../types";
import { teamsApi, employeesApi, projectsApi, tasksApi } from "../lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./AuthContext";
import { createContextHook } from "@/lib/contextUtils";

// Define the app context type
interface AppContextType extends AppState {
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  
  addProject: (project: Omit<Project, "id" | "createdAt">) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;

  addTeam: (team: Omit<Team, "id">) => void;
  
  addEmployee: (employee: Omit<Employee, "id">) => void;
  updateEmployee: (employeeId: string, updates: Partial<Employee>) => void;
  deleteEmployee: (employeeId: string) => void;

  getProjectById: (projectId: string) => Project | undefined;
  getTaskById: (taskId: string) => Task | undefined;
  getEmployeeById: (employeeId: string) => Employee | undefined;
  getTeamById: (teamId: string) => Team | undefined;
  
  getTasksByProject: (projectId: string) => Task[];
  getEmployeesByTeam: (teamId: string) => Employee[];
  getProjectsByTeam: (teamId: string) => Project[];
  
  calculateProjectCost: (projectId: string) => number;
  isLoading: boolean;
  fetchData: () => Promise<void>;
}

// Create the context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Create the hook
export const useApp = createContextHook(AppContext, 'useApp');

// Create the provider
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { toast } = useToast();
  const { currentUser } = useAuth();

  // Fetch data function to load all data from API
  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    
    setIsLoading(true);
    try {
      // Fetch teams and employees first
      const [teamsData, employeesData] = await Promise.all([
        teamsApi.getAll(token),
        employeesApi.getAll(token),
      ]);
      
      // Fetch projects with pagination handling
      const projectsResponse = await projectsApi.getAll(token);
      // Extract projects from the paginated response
      const projectsData = Array.isArray(projectsResponse) 
        ? projectsResponse 
        : projectsResponse.projects || [];
      
      // Fetch tasks
      const tasksData = await tasksApi.getAll(token);
      
      console.log('Fetched data:', {
        teams: teamsData,
        employees: employeesData,
        projects: projectsData,
        tasks: tasksData
      });
      
      setTeams(teamsData);
      setEmployees(employeesData);
      setProjects(projectsData);
      setTasks(tasksData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, toast]);
  
  // Fetch data when user is authenticated
  useEffect(() => {
    fetchData();
  }, [currentUser, fetchData]);

  // Generate a new ID (in a real app would be handled by the backend)
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Task operations
  const addTask = async (task: Omit<Task, "id" | "createdAt">) => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    
    setIsLoading(true);
    
    try {
      // Pass the task object directly to the API function
      const createdTask = await tasksApi.create(task, token);
      
      if (!createdTask) {
        throw new Error("Failed to create task");
      }
      
      // After task creation, refresh all tasks to get the latest data
      const tasksData = await tasksApi.getAll(token);
      setTasks(tasksData);
      
      // Refresh projects data to get updated associations
      const projectsResponse = await projectsApi.getAll(token);
      // Extract projects from the paginated response
      const projectsData = Array.isArray(projectsResponse) 
        ? projectsResponse 
        : projectsResponse.projects || [];
      setProjects(projectsData);
      
      toast({
        title: "Task Created",
        description: `Task "${createdTask.title}" has been created.`
      });
      
      return createdTask;
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    
    try {
      // Get the existing task to merge with updates
      const existingTask = tasks.find(t => t.id === taskId);
      if (!existingTask) {
        throw new Error("Task not found");
      }
      
      // Combine existing task with updates
      const mergedTask = { ...existingTask, ...updates };
      
      // Convert string ID to number for API
      const numericId = parseInt(taskId);
      if (isNaN(numericId)) throw new Error("Invalid task ID");
      
      // Call the API to update the task - passing the complete merged task
      // The API layer will handle the conversion and team vs employee assignments
      const updatedTask = await tasksApi.update(numericId, mergedTask, token);
      
      // Update local state with the updated task
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId ? { ...task, ...updatedTask } : task
        )
      );
      
      toast({
        title: "Task Updated",
        description: "The task has been updated successfully."
      });
      
      return updatedTask;
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive"
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    
    // Get the task to be deleted for reference
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;
    
    try {
      // Convert string ID to number for API
      const numericId = parseInt(taskId);
      if (isNaN(numericId)) throw new Error("Invalid task ID");
      
      // Call API to delete the task
      await tasksApi.delete(numericId, token);
      
      // Remove the task from local state
      setTasks(prev => prev.filter(task => task.id !== taskId));
      
      // Update the associated project
      setProjects(prev => 
        prev.map(project => 
          project.id === taskToDelete.projectId 
            ? { ...project, tasks: project.tasks.filter(id => id !== taskId) } 
            : project
        )
      );
      
      toast({
        title: "Task Deleted",
        description: `Task "${taskToDelete.title}" has been deleted.`
      });
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    
    try {
      // Convert string ID to number for API
      const numericId = parseInt(taskId);
      if (isNaN(numericId)) throw new Error("Invalid task ID");
      
      // Call API to update the task status
      await tasksApi.updateStatus(numericId, status, token);
      
      // Update local state
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId ? { ...task, status } : task
        )
      );
      
      toast({
        title: "Status Updated",
        description: `Task status changed to ${status}.`
      });
    } catch (error) {
      console.error("Error updating task status:", error);
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Project operations
  const addProject = async (project: Omit<Project, "id" | "createdAt">) => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    
    setIsLoading(true);
    
    try {
      // Call the API to create the project
      const createdProject = await projectsApi.create(project, token);
      
      // Update local state with the new project
      setProjects(prev => [...prev, createdProject]);
      
      toast({
        title: "Project Created",
        description: `Project "${createdProject.name}" has been created.`
      });
      
      return createdProject;
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    
    setIsLoading(true);
    
    try {
      // Convert string ID to number for API
      const numericId = parseInt(projectId);
      if (isNaN(numericId)) throw new Error("Invalid project ID");
      
      // Call the API to update the project
      const updatedProject = await projectsApi.update(numericId, updates, token);
      
      // Update local state
      setProjects(prev => 
        prev.map(project => 
          project.id === projectId ? { ...project, ...updatedProject } : project
        )
      );
      
      toast({
        title: "Project Updated",
        description: "The project has been updated successfully."
      });
      
      return updatedProject;
    } catch (error) {
      console.error("Error updating project:", error);
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    
    // Get the project for reference
    const projectToDelete = projects.find(p => p.id === projectId);
    if (!projectToDelete) return;
    
    setIsLoading(true);
    
    try {
      // Convert string ID to number for API
      const numericId = parseInt(projectId);
      if (isNaN(numericId)) throw new Error("Invalid project ID");
      
      // Call the API to delete the project
      await projectsApi.delete(numericId, token);
      
      // Update local state
      setProjects(prev => prev.filter(project => project.id !== projectId));
      
      // Refresh tasks to remove any associated with the deleted project
      const tasksData = await tasksApi.getAll(token);
      setTasks(tasksData);
      
      toast({
        title: "Project Deleted",
        description: `Project "${projectToDelete.name}" has been deleted.`
      });
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Team operations
  const addTeam = async (team: Omit<Team, "id">) => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    try {
      const newTeam = await teamsApi.create(team, token);
      setTeams(prev => [...prev, newTeam]);

      toast({
        title: "Team Created",
        description: `Team "${newTeam.name}" has been created.`
      });
    } catch (error) {
      console.error("Error creating team:", error);
      toast({
        title: "Error",
        description: "Failed to create team. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Employee operations
  const addEmployee = async (employee: Omit<Employee, "id"> & { createUser?: boolean }) => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    
    setIsLoading(true);
    
    try {
      // Prepare employee data for API
      const apiData: Record<string, unknown> = {
        name: employee.name,
        email: employee.email,
        role: employee.role,
        team_id: employee.teamId ? parseInt(employee.teamId) : undefined,
        avatar: employee.avatar
      };
      
      // Call the API to create the employee
      const createdEmployee = await employeesApi.create(apiData, token);
      
      // Update local state with the new employee
      const newEmployee: Employee = {
        id: createdEmployee.id.toString(),
        name: createdEmployee.name,
        email: createdEmployee.email,
        role: createdEmployee.role,
        teamId: createdEmployee.team_id.toString(),
        avatar: createdEmployee.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.name}`,
      };
      
      setEmployees(prev => [...prev, newEmployee]);
      
      // Refresh teams data to get updated associations
      const teamsData = await teamsApi.getAll(token);
      setTeams(teamsData);
      
      toast({
        title: employee.createUser ? "Client Added" : "Employee Added",
        description: `${newEmployee.name} has been ${employee.createUser ? 'added as a client' : 'added to the team'}.`
      });
      
      return newEmployee;
    } catch (error) {
      console.error("Error adding employee:", error);
      toast({
        title: "Error",
        description: `Failed to add ${employee.createUser ? 'client' : 'employee'}. Please try again.`,
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateEmployee = async (employeeId: string, updates: Partial<Employee>) => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    try {
      // Convert string ID to number for API
      const numericId = parseInt(employeeId);
      if (isNaN(numericId)) throw new Error("Invalid employee ID");
      
      const updatedEmployee = await employeesApi.update(numericId, updates, token);
      
      // Update local state
      setEmployees(prev => 
        prev.map(employee => 
          employee.id === employeeId ? { ...employee, ...updatedEmployee } : employee
        )
      );
      
      // If team changed, update team associations in local state
      const employeeToUpdate = employees.find(e => e.id === employeeId);
      const isTeamChanging = employeeToUpdate && 
                            updates.teamId && 
                            updates.teamId !== employeeToUpdate.teamId;
      
      if (isTeamChanging && employeeToUpdate && updates.teamId) {
        // Refresh teams data to get updated associations
        const teamsData = await teamsApi.getAll(token);
        setTeams(teamsData);
      }
      
      toast({
        title: "Employee Updated",
        description: "Employee information has been updated."
      });
    } catch (error) {
      console.error("Error updating employee:", error);
      toast({
        title: "Error",
        description: "Failed to update employee. Please try again.",
        variant: "destructive"
      });
    }
  };

  const deleteEmployee = async (employeeId: string) => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    
    // Get the employee for reference
    const employeeToDelete = employees.find(e => e.id === employeeId);
    if (!employeeToDelete) return;
    
    try {
      // Convert string ID to number for API
      const numericId = parseInt(employeeId);
      if (isNaN(numericId)) throw new Error("Invalid employee ID");
      
      await employeesApi.delete(numericId, token);
      
      // Update local state
      setEmployees(prev => prev.filter(employee => employee.id !== employeeId));
      
      // Refresh teams data to get updated associations
      const teamsData = await teamsApi.getAll(token);
      setTeams(teamsData);
      
      toast({
        title: "Employee Removed",
        description: `${employeeToDelete.name} has been removed.`
      });
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast({
        title: "Error",
        description: "Failed to remove employee. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Getter functions
  const getProjectById = (projectId: string) => projects.find(p => p.id === projectId);
  const getTaskById = (taskId: string) => tasks.find(t => t.id === taskId);
  const getEmployeeById = (employeeId: string) => employees.find(e => e.id === employeeId);
  const getTeamById = (teamId: string) => teams.find(t => t.id === teamId);
  
  const getTasksByProject = (projectId: string) => tasks.filter(task => task.projectId === projectId);
  const getEmployeesByTeam = (teamId: string) => employees.filter(employee => employee.teamId === teamId);
  const getProjectsByTeam = (teamId: string) => projects.filter(project => project.teamId === teamId);
  
  // TJM calculations
  const calculateProjectCost = (projectId: string) => {
    const projectTasks = tasks.filter(task => task.projectId === projectId);
    
    return projectTasks.reduce((total, task) => {
      const tjm = task.tjm || getProjectById(projectId)?.tjm || 0;
      const daysSpent = task.daysSpent || 0;
      return total + (tjm * daysSpent);
    }, 0);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser: currentUser,
        projects,
        tasks,
        employees,
        teams,
        addTask,
        updateTask,
        deleteTask,
        updateTaskStatus,
        addProject,
        updateProject,
        deleteProject,
        addTeam,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        getProjectById,
        getTaskById,
        getEmployeeById,
        getTeamById,
        getTasksByProject,
        getEmployeesByTeam,
        getProjectsByTeam,
        calculateProjectCost,
        isLoading,
        fetchData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Export the context for testing purposes
export { AppContext };
