
// Types for our project management application

export type UserRole = "admin" | "client";

// Backend API response types (snake_case)
export interface ApiUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Frontend types (camelCase)
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export type TaskStatus = "todo" | "in-progress" | "done";

// Backend API response types (snake_case)
export interface ApiTask {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  project_id: number;
  tjm?: number;
  days_spent?: number;
  created_at?: string;
  updated_at?: string;
  employees?: ApiEmployee[];
}

// Frontend types (camelCase)
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  projectId: string;
  assignedEmployees: string[];
  createdAt: string;
  tjm?: number; // Taux Journalier Moyen (Daily Rate)
  daysSpent?: number;
}

// Backend API response types (snake_case)
export interface ApiEmployee {
  id: number;
  name: string;
  email: string;
  role: string;
  team_id: number;
  avatar?: string;
  created_at?: string;
  updated_at?: string;
  team?: ApiTeam;
}

// Frontend types (camelCase)
export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  teamId: string;
  taskId?: string;
  avatar?: string;
}

// Backend API response types (snake_case)
export interface ApiProject {
  id: number;
  name: string;
  description: string;
  team_id: number;
  tjm?: number;
  created_at?: string;
  updated_at?: string;
  team?: ApiTeam;
  tasks?: ApiTask[];
}

// Frontend types (camelCase)
export interface Project {
  id: string;
  name: string;
  description: string;
  teamId: string;
  tasks: string[]; // Task IDs
  createdAt: string;
  tjm?: number; // Project level TJM
}

// Backend API response types (snake_case)
export interface ApiTeam {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
  employees?: ApiEmployee[];
  projects?: ApiProject[];
}

// Frontend types (camelCase)
export interface Team {
  id: string;
  name: string;
  employeeIds: string[];
}

export interface AppState {
  currentUser: User | null;
  projects: Project[];
  tasks: Task[];
  employees: Employee[];
  teams: Team[];
}

// Helper functions to convert between API and frontend types
export const mapApiUserToUser = (apiUser: ApiUser): User => ({
  id: apiUser.id.toString(),
  name: apiUser.name,
  email: apiUser.email,
  role: apiUser.role,
  avatar: apiUser.avatar
});

export const mapApiTeamToTeam = (apiTeam: ApiTeam): Team => ({
  id: apiTeam.id.toString(),
  name: apiTeam.name,
  employeeIds: apiTeam.employees?.map(e => e.id.toString()) || []
});

export const mapApiEmployeeToEmployee = (apiEmployee: ApiEmployee): Employee => ({
  id: apiEmployee.id.toString(),
  name: apiEmployee.name,
  email: apiEmployee.email,
  role: apiEmployee.role,
  teamId: apiEmployee.team_id.toString(),
  avatar: apiEmployee.avatar
});

export const mapApiProjectToProject = (apiProject: ApiProject): Project => ({
  id: apiProject.id.toString(),
  name: apiProject.name,
  description: apiProject.description,
  teamId: apiProject.team_id.toString(),
  tasks: apiProject.tasks?.map(t => t.id.toString()) || [],
  createdAt: apiProject.created_at || new Date().toISOString(),
  tjm: apiProject.tjm
});

export const mapApiTaskToTask = (apiTask: ApiTask): Task => ({
  id: apiTask.id.toString(),
  title: apiTask.title,
  description: apiTask.description,
  status: apiTask.status,
  projectId: apiTask.project_id.toString(),
  assignedEmployees: apiTask.employees?.map(e => e.id.toString()) || [],
  createdAt: apiTask.created_at || new Date().toISOString(),
  tjm: apiTask.tjm,
  daysSpent: apiTask.days_spent
});
