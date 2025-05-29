import React, { useState, useEffect, createContext } from "react";
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

  // Fetch data when user is authenticated
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      
      const token = localStorage.getItem("auth_token");
      if (!token) return;
      
      setIsLoading(true);
      try {
        // Fetch all data in parallel
        const [teamsData, employeesData, projectsData, tasksData] = await Promise.all([
          teamsApi.getAll(token),
          employeesApi.getAll(token),
          projectsApi.getAll(token),
          tasksApi.getAll(token)
        ]);
        
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
    };
    
    fetchData();
  }, [currentUser, toast]);

  // Generate a new ID (in a real app would be handled by the backend)
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Task operations
  const addTask = (task: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = {
      ...task,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    
    setTasks(prev => [...prev, newTask]);
    
    // Update the associated project
    setProjects(prev => 
      prev.map(project => 
        project.id === task.projectId 
          ? { ...project, tasks: [...project.tasks, newTask.id] } 
          : project
      )
    );

    toast({
      title: "Task Created",
      description: `Task "${newTask.title}" has been created.`
    });
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
    
    toast({
      title: "Task Updated",
      description: "The task has been updated successfully."
    });
  };

  const deleteTask = (taskId: string) => {
    // Get the task to be deleted for reference
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;

    // Remove the task
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
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, status } : task
      )
    );
    
    toast({
      title: "Status Updated",
      description: `Task status changed to ${status}.`
    });
  };

  // Project operations
  const addProject = (project: Omit<Project, "id" | "createdAt">) => {
    const newProject: Project = {
      ...project,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    
    setProjects(prev => [...prev, newProject]);
    
    toast({
      title: "Project Created",
      description: `Project "${newProject.name}" has been created.`
    });
  };

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    setProjects(prev => 
      prev.map(project => 
        project.id === projectId ? { ...project, ...updates } : project
      )
    );
    
    toast({
      title: "Project Updated",
      description: "The project has been updated successfully."
    });
  };

  const deleteProject = (projectId: string) => {
    // Get the project for reference
    const projectToDelete = projects.find(p => p.id === projectId);
    if (!projectToDelete) return;

    // Remove the project
    setProjects(prev => prev.filter(project => project.id !== projectId));
    
    // Remove all tasks associated with the project
    setTasks(prev => prev.filter(task => task.projectId !== projectId));
    
    toast({
      title: "Project Deleted",
      description: `Project "${projectToDelete.name}" has been deleted.`
    });
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
  const addEmployee = async (employee: Omit<Employee, "id">) => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    // Generate avatar if not provided
    const employeeWithAvatar = {
      ...employee,
      avatar: employee.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.name.toLowerCase().replace(/\s/g, '')}`
    };

    try {
      const newEmployee = await employeesApi.create(employeeWithAvatar, token);
      setEmployees(prev => [...prev, newEmployee]);

      // Update teams in local state to reflect the new employee
      // This is needed because our API might not return the updated team immediately
      if (newEmployee.team_id) {
        const teamId = newEmployee.team_id.toString();
        setTeams(prev =>
          prev.map(team =>
            team.id === teamId
              ? { ...team, employeeIds: [...(team.employeeIds || []), newEmployee.id] }
              : team
          )
        );
      }

      toast({
        title: "Employee Added",
        description: `${newEmployee.name} has been added to the team.`
      });
    } catch (error) {
      console.error("Error creating employee:", error);
      toast({
        title: "Error",
        description: "Failed to add employee. Please try again.",
        variant: "destructive"
      });
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
        calculateProjectCost
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Export the context for testing purposes
export { AppContext };
