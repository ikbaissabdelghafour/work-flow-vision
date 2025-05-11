
import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Link } from "react-router-dom";

const KanbanBoard = () => {
  const { tasks, getProjectById, getEmployeeById, updateTaskStatus } = useApp();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";
  
  // Filter tasks based on user role
  const filteredTasks = isAdmin 
    ? tasks 
    : tasks.filter(task => task.assignedEmployees.includes(currentUser?.id || ""));
  
  const todoTasks = filteredTasks.filter(task => task.status === "todo");
  const inProgressTasks = filteredTasks.filter(task => task.status === "in-progress");
  const doneTasks = filteredTasks.filter(task => task.status === "done");
  
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, newStatus) => {
    const taskId = e.dataTransfer.getData("taskId");
    updateTaskStatus(taskId, newStatus);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tableau Kanban</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* To Do Column */}
        <div 
          className="bg-slate-50 rounded-lg p-4 border border-slate-200"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, "todo")}
        >
          <h2 className="font-semibold text-lg mb-4 flex items-center">
            <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
            À Faire
            <span className="ml-2 bg-slate-200 text-slate-700 text-xs rounded-full px-2">
              {todoTasks.length}
            </span>
          </h2>
          <div className="space-y-3">
            {todoTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task}
                getProjectById={getProjectById}
                getEmployeeById={getEmployeeById}
                isAdmin={isAdmin}
                handleDragStart={handleDragStart}
                handleChangeStatus={updateTaskStatus}
              />
            ))}
            {todoTasks.length === 0 && (
              <div className="text-center py-8 text-gray-500 bg-slate-100 rounded-md border border-dashed border-slate-300">
                <p>Aucune tâche</p>
              </div>
            )}
          </div>
        </div>

        {/* In Progress Column */}
        <div 
          className="bg-slate-50 rounded-lg p-4 border border-slate-200"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, "in-progress")}
        >
          <h2 className="font-semibold text-lg mb-4 flex items-center">
            <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
            En Cours
            <span className="ml-2 bg-slate-200 text-slate-700 text-xs rounded-full px-2">
              {inProgressTasks.length}
            </span>
          </h2>
          <div className="space-y-3">
            {inProgressTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task}
                getProjectById={getProjectById}
                getEmployeeById={getEmployeeById}
                isAdmin={isAdmin}
                handleDragStart={handleDragStart}
                handleChangeStatus={updateTaskStatus}
              />
            ))}
            {inProgressTasks.length === 0 && (
              <div className="text-center py-8 text-gray-500 bg-slate-100 rounded-md border border-dashed border-slate-300">
                <p>Aucune tâche</p>
              </div>
            )}
          </div>
        </div>

        {/* Done Column */}
        <div 
          className="bg-slate-50 rounded-lg p-4 border border-slate-200"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, "done")}
        >
          <h2 className="font-semibold text-lg mb-4 flex items-center">
            <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
            Terminé
            <span className="ml-2 bg-slate-200 text-slate-700 text-xs rounded-full px-2">
              {doneTasks.length}
            </span>
          </h2>
          <div className="space-y-3">
            {doneTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task}
                getProjectById={getProjectById}
                getEmployeeById={getEmployeeById}
                isAdmin={isAdmin}
                handleDragStart={handleDragStart}
                handleChangeStatus={updateTaskStatus}
              />
            ))}
            {doneTasks.length === 0 && (
              <div className="text-center py-8 text-gray-500 bg-slate-100 rounded-md border border-dashed border-slate-300">
                <p>Aucune tâche</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TaskCard = ({ task, getProjectById, getEmployeeById, isAdmin, handleDragStart, handleChangeStatus }) => {
  const project = getProjectById(task.projectId);
  
  const status = (() => {
    switch (task.status) {
      case "todo": return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">À Faire</span>;
      case "in-progress": return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">En Cours</span>;
      case "done": return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Terminé</span>;
      default: return null;
    }
  })();
  
  return (
    <Card 
      className="bg-white shadow-sm hover:shadow-md transition-shadow"
      draggable={true}
      onDragStart={(e) => handleDragStart(e, task.id)}
    >
      <CardHeader className="p-3 pb-2">
        <div className="flex justify-between">
          <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
          {status}
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{task.description}</p>
        
        <div className="flex justify-between items-center text-xs">
          <Link to={`/projects/${project?.id}`} className="text-jira-blue hover:underline">
            {project?.name || "Projet Inconnu"}
          </Link>
          
          <div className="text-gray-500">
            {format(new Date(task.createdAt), "d MMM")}
          </div>
        </div>
        
        <div className="mt-3 flex justify-between items-center">
          <div className="flex -space-x-2">
            {task.assignedEmployees.slice(0, 3).map(employeeId => {
              const employee = getEmployeeById(employeeId);
              if (!employee) return null;
              
              return (
                <Avatar key={employeeId} className="h-6 w-6 border-2 border-white">
                  <AvatarImage src={employee.avatar} />
                  <AvatarFallback className="text-[10px] bg-slate-200">{employee.name.charAt(0)}</AvatarFallback>
                </Avatar>
              );
            })}
            
            {task.assignedEmployees.length > 3 && (
              <Avatar className="h-6 w-6 border-2 border-white">
                <AvatarFallback className="text-[10px] bg-slate-200">+{task.assignedEmployees.length - 3}</AvatarFallback>
              </Avatar>
            )}
          </div>
          
          {isAdmin && (
            <div className="flex gap-1">
              {task.status === "todo" && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => handleChangeStatus(task.id, "in-progress")}
                >
                  Démarrer
                </Button>
              )}
              
              {task.status === "in-progress" && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => handleChangeStatus(task.id, "done")}
                >
                  Terminer
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default KanbanBoard;
