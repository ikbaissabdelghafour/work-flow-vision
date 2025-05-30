import { 
  User, Team, Employee, Project, Task, EmployerRegistration,
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
    
    // For 204 No Content responses, return null without trying to parse JSON
    if (response.status === 204) {
      console.log(`✅ API Response: ${method} ${url} (No Content)`);
      return null as T;
    }
    
    // Check if there's content to parse
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      // Only try to parse as JSON if there's actual content
      const responseData = text.trim() ? JSON.parse(text) : null;
      console.log(`✅ API Response: ${method} ${url}`, responseData);
      return responseData;
    }
    
    console.log(`✅ API Response: ${method} ${url} (No JSON content)`);
    return null as T;
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
  },
  
  registerEmployer: async (employerData: EmployerRegistration): Promise<{user: User, token: string}> => {
    const data = {
      name: employerData.name,
      email: employerData.email,
      password: employerData.password,
      role: 'employer',
      team_id: parseInt(employerData.teamId)
    };
    
    const response = await apiRequest<{user: ApiUser, token: string}>('/register', 'POST', data);
    return {
      user: mapApiUserToUser(response.user),
      token: response.token
    };
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
// Define pagination response type
interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
}

// Define project pagination response type
interface ProjectPaginationResponse {
  projects: Project[];
  pagination: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
}

export const projectsApi = {
  getAll: async (
    token: string, 
    page: number = 1, 
    perPage: number = 10, 
    search: string = '',
    sortField: string = 'created_at',
    sortDirection: 'asc' | 'desc' = 'desc'
  ): Promise<Project[] | ProjectPaginationResponse> => {
    // Build query parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      sort_field: sortField,
      sort_direction: sortDirection
    });
    
    if (search) {
      queryParams.append('search', search);
    }
    
    const url = `/projects?${queryParams.toString()}`;
    
    try {
      // Get response from API
      const response = await apiRequest<PaginatedResponse<ApiProject> | ApiProject[]>(url, 'GET', undefined, token);
      
      // Handle both array and paginated response formats
      if (Array.isArray(response)) {
        // If response is an array, map directly
        return response.map(mapApiProjectToProject);
      } else if (response && 'data' in response) {
        // If response is paginated, extract data and pagination info
        const projects = response.data.map(mapApiProjectToProject);
        
        return {
          projects,
          pagination: {
            currentPage: response.current_page,
            lastPage: response.last_page,
            perPage: response.per_page,
            total: response.total
          }
        };
      } else {
        // Fallback for unexpected response format
        console.error('Unexpected response format:', response);
        return [];
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
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
    try {
      // Convert camelCase to snake_case for API
      const apiData: Record<string, unknown> = {
        title: task.title,
        description: task.description,
        status: task.status,
        project_id: task.projectId ? parseInt(task.projectId.toString()) : undefined,
        tjm: task.tjm,
        days_spent: task.daysSpent
      };
      
      // Add team_id if the task is assigned to a team
      if (task.teamId) {
        apiData.team_id = parseInt(task.teamId.toString());
      }
      
      // Handle employee assignments only if not assigned to team
      if (!task.teamId && task.assignedEmployees && task.assignedEmployees.length > 0) {
        // Convert string employee IDs to numbers
        const employeeIds = task.assignedEmployees
          .map(id => typeof id === 'string' ? parseInt(id) : id)
          .filter(id => !isNaN(id));
        
        if (employeeIds.length > 0) {
          apiData.employee_ids = employeeIds;
        }
      }
      
      // Clean up undefined values
      Object.keys(apiData).forEach(key => {
        if (apiData[key] === undefined) {
          delete apiData[key];
        }
      });
      
      console.log('Creating task with data:', JSON.stringify(apiData, null, 2));
      
      // Make the API request
      const apiTask = await apiRequest<ApiTask>('/tasks', 'POST', apiData, token);
      console.log('API response for task creation:', apiTask);
      
      if (!apiTask) {
        throw new Error('No response received from the server');
      }
      
      return mapApiTaskToTask(apiTask);
    } catch (error) {
      console.error('Error in tasksApi.create:', error);
      throw error; // Re-throw to allow handling in the component
    }
  },
  
  update: async (id: number, task: Partial<Task>, token: string): Promise<Task> => {
    try {
      // Convert camelCase to snake_case for API
      const apiData: Record<string, unknown> = {
        title: task.title,
        description: task.description,
        status: task.status,
        project_id: task.projectId ? parseInt(task.projectId.toString()) : undefined,
        tjm: task.tjm,
        days_spent: task.daysSpent
      };
      
      // Add team_id if the task is assigned to a team
      if (task.teamId) {
        apiData.team_id = parseInt(task.teamId.toString());
        // When assigning to a team, we should clear any individual employee assignments
        apiData.employee_ids = [];
      }
      // Handle employee assignments only if not assigned to team
      else if (task.assignedEmployees && task.assignedEmployees.length > 0) {
        // Convert string employee IDs to numbers
        const employeeIds = task.assignedEmployees
          .map(id => typeof id === 'string' ? parseInt(id) : id)
          .filter(id => !isNaN(id));
        
        if (employeeIds.length > 0) {
          apiData.employee_ids = employeeIds;
        }
      }
      
      // Clean up undefined values
      Object.keys(apiData).forEach(key => {
        if (apiData[key] === undefined) {
          delete apiData[key];
        }
      });
      
      console.log('Updating task with data:', JSON.stringify(apiData, null, 2));
      
      const apiTask = await apiRequest<ApiTask>(`/tasks/${id}`, 'PUT', apiData, token);
      return mapApiTaskToTask(apiTask);
    } catch (error) {
      console.error('Error in tasksApi.update:', error);
      throw error; // Re-throw to allow handling in the component
    }
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
