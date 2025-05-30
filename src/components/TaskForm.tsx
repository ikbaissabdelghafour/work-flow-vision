import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import axios from 'axios';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { toast } from './ui/use-toast';

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

interface Employee {
  id: number;
  name: string;
  email: string;
  team_id: number;
}

interface TaskFormProps {
  task?: Task;
  onSave: (task: Task) => void;
  projects: Project[];
  teams: Team[];
}

// Form validation schema
const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().min(5, {
    message: "Description must be at least 5 characters.",
  }),
  status: z.enum(['todo', 'in-progress', 'done']),
  project_id: z.string(),
  team_id: z.string().optional(),
  tjm: z.coerce.number().optional(),
  days_spent: z.coerce.number().optional(),
  employee_ids: z.array(z.string()).optional(),
  assign_all_team_members: z.boolean().default(false),
});

const TaskForm: React.FC<TaskFormProps> = ({ task, onSave, projects, teams }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [teamEmployees, setTeamEmployees] = useState<Employee[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  // API base URL
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  // Initialize form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: task ? {
      title: task.title,
      description: task.description,
      status: task.status,
      project_id: task.project_id.toString(),
      team_id: task.team_id ? task.team_id.toString() : undefined,
      tjm: task.tjm || undefined,
      days_spent: task.days_spent || undefined,
      employee_ids: task.employees.map(emp => emp.id.toString()),
      assign_all_team_members: false,
    } : {
      title: '',
      description: '',
      status: 'todo',
      project_id: '',
      employee_ids: [],
      assign_all_team_members: false,
    },
  });

  // Get the watch function to track form changes
  const watchedFields = form.watch(['project_id', 'team_id', 'assign_all_team_members']);
  
  // Load all employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get(`${API_URL}/employees`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setEmployees(response.data);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    fetchEmployees();
  }, [API_URL]);

  // Update team based on selected project
  useEffect(() => {
    const projectId = watchedFields.project_id;
    if (!projectId) return;

    const selectedProject = projects.find(p => p.id.toString() === projectId);
    if (selectedProject) {
      // Set the project's team_id
      form.setValue('team_id', selectedProject.team_id.toString());
      setSelectedTeamId(selectedProject.team_id.toString());
      setSelectedProjectId(projectId);
    }
  }, [watchedFields.project_id, projects, form]);

  // Filter employees by team
  useEffect(() => {
    const teamId = watchedFields.team_id;
    if (!teamId) {
      setTeamEmployees([]);
      return;
    }

    const filteredEmployees = employees.filter(emp => emp.team_id.toString() === teamId);
    setTeamEmployees(filteredEmployees);
    
    // If assign all team members is checked, select all team employees
    if (watchedFields.assign_all_team_members) {
      form.setValue('employee_ids', filteredEmployees.map(emp => emp.id.toString()));
    }
  }, [watchedFields.team_id, employees, watchedFields.assign_all_team_members, form]);

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: 'Authentication Error',
          description: 'You must be logged in to perform this action.',
          variant: 'destructive',
        });
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      let response;

      // Prepare data for API
      const apiData = {
        title: values.title,
        description: values.description,
        status: values.status,
        project_id: parseInt(values.project_id),
        team_id: values.team_id ? parseInt(values.team_id) : null,
        tjm: values.tjm || null,
        days_spent: values.days_spent || null,
        employee_ids: values.employee_ids || [],
      };

      if (task) {
        // Update existing task
        response = await axios.put(`${API_URL}/tasks/${task.id}`, apiData, { headers });
      } else {
        // Create new task
        response = await axios.post(`${API_URL}/tasks`, apiData, { headers });
      }

      // Call onSave with the updated/created task
      onSave(response.data);
    } catch (error) {
      console.error('Error saving task:', error);
      toast({
        title: 'Error',
        description: 'Failed to save task. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle assign all team members checkbox
  const handleAssignAllTeamMembers = (checked: boolean) => {
    form.setValue('assign_all_team_members', checked);
    
    if (checked && teamEmployees.length > 0) {
      // Select all team employees
      form.setValue('employee_ids', teamEmployees.map(emp => emp.id.toString()));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Task Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter task title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the task details"
                  className="min-h-[120px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Project */}
          <FormField
            control={form.control}
            name="project_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Selecting a project will automatically set the team.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Team */}
          <FormField
            control={form.control}
            name="team_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Team</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={true} // Team is auto-selected based on project
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Team is set by project" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {teams.map(team => (
                      <SelectItem key={team.id} value={team.id.toString()}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Team is automatically set based on the selected project.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* TJM (Daily Rate) */}
          <FormField
            control={form.control}
            name="tjm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Daily Rate (TJM)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0.00"
                    {...field} 
                    onChange={(e) => {
                      const value = e.target.value === '' ? undefined : e.target.value;
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Optional: Daily rate for this task.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Days Spent */}
          <FormField
            control={form.control}
            name="days_spent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Days Spent</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0"
                    {...field} 
                    onChange={(e) => {
                      const value = e.target.value === '' ? undefined : e.target.value;
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Optional: Number of days spent on this task.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Assign to all team members checkbox */}
        {teamEmployees.length > 0 && (
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox 
              id="assign-all" 
              checked={form.watch('assign_all_team_members')}
              onCheckedChange={handleAssignAllTeamMembers}
            />
            <label
              htmlFor="assign-all"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Assign to all team members ({teamEmployees.length})
            </label>
          </div>
        )}

        {/* Employee Assignment */}
        {teamEmployees.length > 0 && (
          <FormField
            control={form.control}
            name="employee_ids"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="text-base">Assign Employees</FormLabel>
                  <FormDescription>
                    Select the employees who will work on this task.
                  </FormDescription>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {teamEmployees.map((employee) => (
                    <FormField
                      key={employee.id}
                      control={form.control}
                      name="employee_ids"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={employee.id}
                            className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(employee.id.toString())}
                                onCheckedChange={(checked) => {
                                  const currentValues = field.value || [];
                                  const employeeId = employee.id.toString();
                                  
                                  if (checked) {
                                    field.onChange([...currentValues, employeeId]);
                                  } else {
                                    field.onChange(
                                      currentValues.filter((value) => value !== employeeId)
                                    );
                                    // Uncheck "assign all" if any employee is unchecked
                                    form.setValue('assign_all_team_members', false);
                                  }
                                }}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-medium">
                                {employee.name}
                              </FormLabel>
                              <FormDescription className="text-xs">
                                {employee.email}
                              </FormDescription>
                            </div>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {selectedProjectId && teamEmployees.length === 0 && (
          <div className="p-4 border rounded-md bg-amber-50 text-amber-800">
            No employees are assigned to this team. Please add employees to the team before assigning tasks.
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              {task ? 'Update Task' : 'Create Task'}
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default TaskForm;