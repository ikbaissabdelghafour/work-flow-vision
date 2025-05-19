
import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import TaskCard from "./TaskCard";
import { toast } from "sonner";

const KanbanBoard = () => {
  const { tasks, updateTaskStatus } = useApp();
  const [todoTasks, setTodoTasks] = useState([]);
  const [inProgressTasks, setInProgressTasks] = useState([]);
  const [doneTasks, setDoneTasks] = useState([]);

  useEffect(() => {
    // Filter tasks based on their status
    setTodoTasks(tasks.filter(task => task.status === "todo"));
    setInProgressTasks(tasks.filter(task => task.status === "in-progress"));
    setDoneTasks(tasks.filter(task => task.status === "done"));
  }, [tasks]);

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Allow drop
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    
    // Only update if the status actually changes
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== status) {
      updateTaskStatus(taskId, status);
      toast.success(`Task moved to ${status.replace('-', ' ')}`);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tasks Board</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* To Do Column */}
        <div 
          className="bg-gray-50 rounded-md p-3"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, "todo")}
        >
          <div className="flex items-center mb-2">
            <div className="h-2.5 w-2.5 rounded-full bg-status-todo mr-2"></div>
            <h2 className="font-semibold text-lg">To Do</h2>
            <span className="text-xs bg-gray-200 rounded px-2 py-1 ml-2">{todoTasks.length}</span>
          </div>
          <Separator className="my-2" />
          <div className="space-y-2 mt-4">
            {todoTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onDragStart={(e) => handleDragStart(e, task.id)}
              />
            ))}
            
            {todoTasks.length === 0 && (
              <Card className="border-dashed border-2 bg-transparent">
                <CardContent className="p-3 text-center text-gray-400 text-sm">
                  No tasks to do
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
        {/* In Progress Column */}
        <div 
          className="bg-gray-50 rounded-md p-3"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, "in-progress")}
        >
          <div className="flex items-center mb-2">
            <div className="h-2.5 w-2.5 rounded-full bg-status-in-progress mr-2"></div>
            <h2 className="font-semibold text-lg">In Progress</h2>
            <span className="text-xs bg-gray-200 rounded px-2 py-1 ml-2">{inProgressTasks.length}</span>
          </div>
          <Separator className="my-2" />
          <div className="space-y-2 mt-4">
            {inProgressTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onDragStart={(e) => handleDragStart(e, task.id)}
              />
            ))}
            
            {inProgressTasks.length === 0 && (
              <Card className="border-dashed border-2 bg-transparent">
                <CardContent className="p-3 text-center text-gray-400 text-sm">
                  No tasks in progress
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
        {/* Done Column */}
        <div 
          className="bg-gray-50 rounded-md p-3" 
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, "done")}
        >
          <div className="flex items-center mb-2">
            <div className="h-2.5 w-2.5 rounded-full bg-status-done mr-2"></div>
            <h2 className="font-semibold text-lg">Done</h2>
            <span className="text-xs bg-gray-200 rounded px-2 py-1 ml-2">{doneTasks.length}</span>
          </div>
          <Separator className="my-2" />
          <div className="space-y-2 mt-4">
            {doneTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onDragStart={(e) => handleDragStart(e, task.id)}
              />
            ))}
            
            {doneTasks.length === 0 && (
              <Card className="border-dashed border-2 bg-transparent">
                <CardContent className="p-3 text-center text-gray-400 text-sm">
                  No completed tasks
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;
