import { 
  User, Team, Employee, Project, Task,
  ApiUser, ApiTeam, ApiEmployee, ApiProject, ApiTask,
  mapApiUserToUser, mapApiTeamToTeam, mapApiEmployeeToEmployee, 
  mapApiProjectToProject, mapApiTaskToTask 
} from '../types';

// Use relative URL for development with Vite proxy, or absolute URL for production
const API_URL = import.meta.env.DEV ? '/api' : 'http://localhost:8000/api';

// Helper function for making API requests
async function apiRequest<T>(
  endpoint: string, 
  method: string = 'GET', 
  data?: Record<string, unknown>,
  token?: string
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
    credentials: 'include',
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const url = `${API_URL}${endpoint}`;
  console.log(`🚀 API Request: ${method} ${url}`, data ? { data } : '');
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      // Try to get error message from response
      try {
        const errorData = await response.json();
        console.error(`❌ API Error: ${response.status}`, errorData);
        throw new Error(errorData.message || `API error: ${response.status}`);
      } catch (e) {
        console.error(`❌ API Error: ${response.status}`, e);
        throw new Error(`API error: ${response.status}`);
      }
    }
    
    const responseData = await response.json();
    console.log(`✅ API Response: ${method} ${url}`, responseData);
    return responseData;
  } catch (error) {
    console.error(`❌ API Request Failed: ${method} ${url}`, error);
    throw error;
  }
}

// Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<{user: User, token: string}> => {
    const response = await apiRequest<{user: ApiUser, token: string}>('/login', 'POST', { email, password });
    return {
      user: mapApiUserToUser(response.user),
      token: response.token
    };
  },
  
  logout: async (token: string): Promise<void> => {
    return apiRequest('/logout', 'POST', undefined, token);
  },
  
  getCurrentUser: async (token: string): Promise<User> => {
    const apiUser = await apiRequest<ApiUser>('/user', 'GET', undefined, token);
    return mapApiUserToUser(apiUser);
  }
};

// Teams API
export const teamsApi = {
  getAll: async (token: string): Promise<Team[]> => {
    const apiTeams = await apiRequest<ApiTeam[]>('/teams', 'GET', undefined, token);
    return apiTeams.map(mapApiTeamToTeam);
  },
  
  getById: async (id: number, token: string): Promise<Team> => {
    const apiTeam = await apiRequest<ApiTeam>(`/teams/${id}`, 'GET', undefined, token);
    return mapApiTeamToTeam(apiTeam);
  },
  
  getTeamEmployees: async (id: number, token: string): Promise<Employee[]> => {
    const apiEmployees = await apiRequest<ApiEmployee[]>(`/teams/${id}/employees`, 'GET', undefined, token);
    return apiEmployees.map(mapApiEmployeeToEmployee);
  },
  
  getTeamProjects: async (id: number, token: string): Promise<Project[]> => {
    const apiProjects = await apiRequest<ApiProject[]>(`/teams/${id}/projects`, 'GET', undefined, token);
    return apiProjects.map(mapApiProjectToProject);
  },
  
  create: async (team: Partial<Team>, token: string): Promise<Team> => {
    const apiTeam = await apiRequest<ApiTeam>('/teams', 'POST', team, token);
    return mapApiTeamToTeam(apiTeam);
  },
  
  update: async (id: number, team: Partial<Team>, token: string): Promise<Team> => {
    const apiTeam = await apiRequest<ApiTeam>(`/teams/${id}`, 'PUT', team, token);
    return mapApiTeamToTeam(apiTeam);
  },
  
  delete: async (id: number, token: string): Promise<void> => {
    return apiRequest(`/teams/${id}`, 'DELETE', undefined, token);
  }
};

// Employees API
export const employeesApi = {
  getAll: async (token: string): Promise<Employee[]> => {
    const apiEmployees = await apiRequest<ApiEmployee[]>('/employees', 'GET', undefined, token);
    return apiEmployees.map(mapApiEmployeeToEmployee);
  },
  
  getById: async (id: number, token: string): Promise<Employee> => {
    const apiEmployee = await apiRequest<ApiEmployee>(`/employees/${id}`, 'GET', undefined, token);
    return mapApiEmployeeToEmployee(apiEmployee);
  },
  
  create: async (employee: Partial<Employee>, token: string): Promise<Employee> => {
    // Convert camelCase to snake_case for API
    const apiData = {
      name: employee.name,
      email: employee.email,
      role: employee.role,
      team_id: employee.teamId ? parseInt(employee.teamId) : undefined,
      avatar: employee.avatar
    };
    
    const apiEmployee = await apiRequest<ApiEmployee>('/employees', 'POST', apiData, token);
    return mapApiEmployeeToEmployee(apiEmployee);
  },
  
  update: async (id: number, employee: Partial<Employee>, token: string): Promise<Employee> => {
    // Convert camelCase to snake_case for API
    const apiData = {
      name: employee.name,
      email: employee.email,
      role: employee.role,
      team_id: employee.teamId ? parseInt(employee.teamId) : undefined,
      avatar: employee.avatar
    };
    
    const apiEmployee = await apiRequest<ApiEmployee>(`/employees/${id}`, 'PUT', apiData, token);
    return mapApiEmployeeToEmployee(apiEmployee);
  },
  
  delete: async (id: number, token: string): Promise<void> => {
    return apiRequest(`/employees/${id}`, 'DELETE', undefined, token);
  }
};

// Projects API
export const projectsApi = {
  getAll: async (token: string): Promise<Project[]> => {
    const apiProjects = await apiRequest<ApiProject[]>('/projects', 'GET', undefined, token);
    return apiProjects.map(mapApiProjectToProject);
  },
  
  getById: async (id: number, token: string): Promise<Project> => {
    const apiProject = await apiRequest<ApiProject>(`/projects/${id}`, 'GET', undefined, token);
    return mapApiProjectToProject(apiProject);
  },
  
  getProjectTasks: async (id: number, token: string): Promise<Task[]> => {
    const apiTasks = await apiRequest<ApiTask[]>(`/projects/${id}/tasks`, 'GET', undefined, token);
    return apiTasks.map(mapApiTaskToTask);
  },
  
  calculateCost: async (id: number, token: string): Promise<{cost: number}> => {
    return apiRequest(`/projects/${id}/cost`, 'GET', undefined, token);
  },
  
  create: async (project: Partial<Project>, token: string): Promise<Project> => {
    // Convert camelCase to snake_case for API
    const apiData = {
      name: project.name,
      description: project.description,
      team_id: project.teamId ? parseInt(project.teamId) : undefined,
      tjm: project.tjm
    };
    
    const apiProject = await apiRequest<ApiProject>('/projects', 'POST', apiData, token);
    return mapApiProjectToProject(apiProject);
  },
  
  update: async (id: number, project: Partial<Project>, token: string): Promise<Project> => {
    // Convert camelCase to snake_case for API
    const apiData = {
      name: project.name,
      description: project.description,
      team_id: project.teamId ? parseInt(project.teamId) : undefined,
      tjm: project.tjm
    };
    
    const apiProject = await apiRequest<ApiProject>(`/projects/${id}`, 'PUT', apiData, token);
    return mapApiProjectToProject(apiProject);
  },
  
  delete: async (id: number, token: string): Promise<void> => {
    return apiRequest(`/projects/${id}`, 'DELETE', undefined, token);
  }
};

// Tasks API
export const tasksApi = {
  getAll: async (token: string): Promise<Task[]> => {
    const apiTasks = await apiRequest<ApiTask[]>('/tasks', 'GET', undefined, token);
    return apiTasks.map(mapApiTaskToTask);
  },
  
  getById: async (id: number, token: string): Promise<Task> => {
    const apiTask = await apiRequest<ApiTask>(`/tasks/${id}`, 'GET', undefined, token);
    return mapApiTaskToTask(apiTask);
  },
  
  create: async (task: Partial<Task>, token: string): Promise<Task> => {
    // Convert camelCase to snake_case for API
    const apiData = {
      title: task.title,
      description: task.description,
      status: task.status,
      project_id: task.projectId ? parseInt(task.projectId) : undefined,
      tjm: task.tjm,
      days_spent: task.daysSpent
    };
    
    const apiTask = await apiRequest<ApiTask>('/tasks', 'POST', apiData, token);
    return mapApiTaskToTask(apiTask);
  },
  
  update: async (id: number, task: Partial<Task>, token: string): Promise<Task> => {
    // Convert camelCase to snake_case for API
    const apiData = {
      title: task.title,
      description: task.description,
      status: task.status,
      project_id: task.projectId ? parseInt(task.projectId) : undefined,
      tjm: task.tjm,
      days_spent: task.daysSpent
    };
    
    const apiTask = await apiRequest<ApiTask>(`/tasks/${id}`, 'PUT', apiData, token);
    return mapApiTaskToTask(apiTask);
  },
  
  updateStatus: async (id: number, status: string, token: string): Promise<Task> => {
    const apiTask = await apiRequest<ApiTask>(`/tasks/${id}/status`, 'PATCH', { status }, token);
    return mapApiTaskToTask(apiTask);
  },
  
  assignEmployees: async (id: number, employeeIds: number[], token: string): Promise<Task> => {
    const apiTask = await apiRequest<ApiTask>(`/tasks/${id}/employees`, 'POST', { employee_ids: employeeIds }, token);
    return mapApiTaskToTask(apiTask);
  },
  
  delete: async (id: number, token: string): Promise<void> => {
    return apiRequest(`/tasks/${id}`, 'DELETE', undefined, token);
  }
};
