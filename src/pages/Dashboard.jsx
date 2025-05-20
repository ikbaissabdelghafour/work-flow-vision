
import React from "react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { 
    projects = [], 
    tasks = [], 
    employees = [], 
    teams = [],
    calculateProjectCost 
  } = useApp();

  console.log("Dashboard loaded with app data:", {
    projectsCount: projects.length,
    tasksCount: tasks.length,
    calculateProjectCost: typeof calculateProjectCost
  });

  const isAdmin = currentUser?.role === "admin";

  // Filter tasks based on user role
  const filteredTasks = isAdmin 
    ? tasks 
    : tasks.filter(task => task.assignedEmployees?.includes(currentUser?.id || ""));

  // Calculate totals
  const totalProjects = projects.length;
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(task => task.status === "done").length;
  const totalEmployees = employees.length;
  const totalTeams = teams.length;
  
  // Task status distribution for pie chart
  const taskStatusData = [
    { name: "To Do", value: filteredTasks.filter(t => t.status === "todo").length },
    { name: "In Progress", value: filteredTasks.filter(t => t.status === "in-progress").length },
    { name: "Done", value: filteredTasks.filter(t => t.status === "done").length },
  ];
  
  const COLORS = ["#5E5ED4", "#A35EC2", "#25A56A"];
  
  // Project costs data for bar chart
  const projectCostData = projects.map(project => ({
    name: project.name,
    cost: calculateProjectCost ? calculateProjectCost(project.id) : 0,
  }));

  // Recent tasks
  const recentTasks = [...filteredTasks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
  
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "todo":
        return "status-badge status-todo";
      case "in-progress":
        return "status-badge status-in-progress";
      case "done":
        return "status-badge status-done";
      default:
        return "status-badge";
    }
  };
  
  const getStatusLabel = (status) => {
    switch (status) {
      case "todo":
        return "To Do";
      case "in-progress":
        return "In Progress";
      case "done":
        return "Done";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {isAdmin && (
          <Link to="/projects/new">
            <Button className="bg-jira-blue hover:bg-jira-blue/90 text-white">
              New Project
            </Button>
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedTasks}/{totalTasks}
            </div>
          </CardContent>
        </Card>
        
        {isAdmin && (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Teams</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTeams}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Employees</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalEmployees}</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Task Status</CardTitle>
            <CardDescription>Distribution of tasks by status</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Project Costs</CardTitle>
              <CardDescription>Based on TJM and days spent</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={projectCostData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`€${value}`, "Cost"]} />
                  <Bar dataKey="cost" fill="#0052CC" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
          <CardDescription>Latest tasks across all projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTasks.length > 0 ? (
              recentTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <h3 className="font-medium">{task.title}</h3>
                    <p className="text-sm text-gray-500">{task.description.substring(0, 60)}...</p>
                    <div className="mt-2 text-xs text-gray-400">
                      {format(new Date(task.createdAt), "MMM d, yyyy")}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={getStatusBadgeClass(task.status)}>
                      {getStatusLabel(task.status)}
                    </span>
                    {task.tjm && task.daysSpent ? (
                      <span className="text-sm font-medium">
                        €{task.tjm * task.daysSpent}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-4 text-gray-500">No tasks available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
