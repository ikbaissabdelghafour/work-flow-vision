
import React from "react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const TaskCard = ({ task, onDragStart }) => {
  const { updateTaskStatus, getEmployeeById } = useApp();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";
  
  // Get assigned employee names
  const assignedEmployees = task.assignedEmployees
    .map(id => {
      const employee = getEmployeeById(id);
      return employee ? employee.name : "Unknown";
    })
    .join(", ");

  const getBadgeClass = () => {
    switch (task.status) {
      case "todo": return "bg-status-todo/20 text-status-todo border-status-todo/30";
      case "in-progress": return "bg-status-in-progress/20 text-status-in-progress border-status-in-progress/30";
      case "done": return "bg-status-done/20 text-status-done border-status-done/30";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const handleStatusChange = (newStatus) => {
    updateTaskStatus(task.id, newStatus);
  };

  return (
    <Card 
      className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
      draggable
      onDragStart={onDragStart}
    >
      <CardContent className="p-3">
        <div className="space-y-2">
          {/* Task Title */}
          <div className="font-medium">{task.title}</div>
          
          {/* Task Description */}
          <p className="text-xs text-gray-500">{task.description}</p>
          
          {/* Task Details */}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className={`px-2 py-0.5 rounded-sm border ${getBadgeClass()}`}>
              {task.status === "todo" ? "To Do" : 
               task.status === "in-progress" ? "In Progress" : 
               "Done"}
            </span>
            
            <span className="text-gray-500">
              {format(new Date(task.createdAt), "MMM d")}
            </span>
          </div>
          
          {/* Assigned Employees */}
          {assignedEmployees && (
            <div className="text-xs text-gray-600 mt-1">
              <span className="font-medium">Assigned to:</span> {assignedEmployees}
            </div>
          )}
          
          {/* Admin Controls */}
          {isAdmin && (
            <div className="flex justify-end gap-1 mt-2">
              {task.status === "todo" && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => handleStatusChange("in-progress")}
                >
                  <ArrowRight className="h-3 w-3 mr-1" />
                  Start
                </Button>
              )}
              
              {task.status === "in-progress" && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => handleStatusChange("done")}
                >
                  <ArrowRight className="h-3 w-3 mr-1" />
                  Complete
                </Button>
              )}
              
              {task.status === "done" && task.status !== "todo" && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => handleStatusChange("todo")}
                >
                  <ArrowRight className="h-3 w-3 mr-1" />
                  Reopen
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
