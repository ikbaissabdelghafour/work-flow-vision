import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AlertCircle, MoreHorizontal, Plus, Trash, Edit, Loader2, RefreshCw, FileText, Users, Calendar, Search } from "lucide-react";
import { Project, Employee } from "@/types";

const Projects: React.FC = () => {
  const { 
    projects, 
    teams, 
    employees,
    addProject, 
    updateProject, 
    deleteProject, 
    isLoading: contextLoading,
    getTeamById,
    getTasksByProject,
    getEmployeesByTeam,
    calculateProjectCost,
    fetchData
  } = useApp();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";
  
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [localLoading, setLocalLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{id: string, name: string} | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    teamId: teams[0]?.id || "",
    tjm: 0,
  });
  
  // Reset project form when teams change
  useEffect(() => {
    if (teams.length > 0 && !newProject.teamId) {
      setNewProject(prev => ({
        ...prev,
        teamId: teams[0]?.id || ""
      }));
    }
  }, [teams, newProject.teamId]);
  
  useEffect(() => {
    // Reset form when dialog closes
    if (!isNewProjectOpen) {
      setNewProject({
        name: "",
        description: "",
        teamId: "",
        tjm: 0
      });
    }
  }, [isNewProjectOpen]);
  
  // Function to refresh data
  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      await fetchData();
      console.log('Projects after refresh:', projects);
      toast.success("Data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await fetchData();
        console.log('Projects after fetchData:', projects);
      } catch (error) {
        console.error("Error loading initial data:", error);
        toast.error("Failed to load projects. Please refresh the page.");
      } finally {
        setLocalLoading(false);
      }
    };
    
    loadInitialData();
    // We're only running this on mount and when fetchData changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData]);
  
  // Filter projects based on search query
  const filterProjects = () => {
    if (!searchQuery.trim()) {
      setFilteredProjects(projects);
      return;
    }
    
    const query = searchQuery.toLowerCase().trim();
    const filtered = projects.filter(project => {
      const team = getTeamById(project.teamId);
      return (
        project.name.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        (team && team.name.toLowerCase().includes(query))
      );
    });
    
    setFilteredProjects(filtered);
  };
  
  // Update filtered projects when projects or search query changes
  useEffect(() => {
    filterProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, searchQuery]);
  
  const handleCreateProject = async () => {
    if (!newProject.name || !newProject.teamId) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setLocalLoading(true);
    
    try {
      await addProject({
        ...newProject,
        tasks: [],
      });
      
      setNewProject({
        name: "",
        description: "",
        teamId: teams[0]?.id || "",
        tjm: 0,
      });
      
      setIsNewProjectOpen(false);
      toast.success("Project created successfully", {
        description: "The project has been added to the database."
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
      toast.error("Failed to create project", {
        description: err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    } finally {
      setIsSubmitting(false);
      setLocalLoading(false);
    }
  };
  
  const handleEditProject = async () => {
    if (!selectedProject || !selectedProject.name || !selectedProject.teamId) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setLocalLoading(true);
    
    try {
      await updateProject(selectedProject.id, selectedProject);
      setIsEditProjectOpen(false);
      toast.success("Project updated successfully", {
        description: "The project has been updated in the database."
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
      toast.error("Failed to update project", {
        description: err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    } finally {
      setIsSubmitting(false);
      setLocalLoading(false);
    }
  };
  
  const openDeleteDialog = (projectId: string, projectName: string) => {
    setProjectToDelete({ id: projectId, name: projectName });
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    
    try {
      setLocalLoading(true);
      await deleteProject(projectToDelete.id);
      setIsDeleteDialogOpen(false);
      toast.success("Project deleted successfully");
    } catch (error) {
      console.error("Error deleting project:", error);
      setError("Failed to delete project. Please try again.");
      toast.error("Failed to delete project. Please try again.");
    } finally {
      setLocalLoading(false);
    }
  };
  
  const openEditProjectDialog = (project: Project) => {
    setSelectedProject({
      ...project
    });
    setIsEditProjectOpen(true);
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline ml-1">{error}</span>
          </div>
        </div>
      )}
      
      <Card>
        <CardHeader className="flex flex-col space-y-4">
          <div className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Projects</CardTitle>
              <CardDescription>
                Manage your organization's projects and tasks.
              </CardDescription>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={refreshData} 
                disabled={isRefreshing || contextLoading || localLoading}
              >
                {isRefreshing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </>
                )}
              </Button>
              
              {isAdmin && (
                <Dialog open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      <span>Add Project</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Project</DialogTitle>
                      <DialogDescription>
                        Add a new project to your organization.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Project Name <span className="text-red-500">*</span></Label>
                        <Input 
                          id="name" 
                          placeholder="Enter project name"
                          value={newProject.name}
                          onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea 
                          id="description" 
                          placeholder="Describe the project"
                          value={newProject.description}
                          onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="team">Assign Team <span className="text-red-500">*</span></Label>
                        <select
                          id="team"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={newProject.teamId}
                          onChange={(e) => setNewProject(prev => ({ ...prev, teamId: e.target.value }))}
                        >
                          <option value="">Select a team</option>
                          {teams.map(team => (
                            <option key={team.id} value={team.id}>{team.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tjm">TJM (€)</Label>
                        <Input 
                          id="tjm" 
                          type="number"
                          placeholder="Daily rate"
                          value={newProject.tjm}
                          onChange={(e) => setNewProject(prev => ({ ...prev, tjm: Number(e.target.value) }))}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsNewProjectOpen(false)}>Cancel</Button>
                      <Button onClick={handleCreateProject} disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          'Create Project'
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
          
          {/* Search input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search projects by name, description, or team..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {contextLoading || localLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <span className="text-lg font-medium">Loading projects...</span>
              <p className="text-sm text-gray-500 mt-2">Please wait while we fetch your data</p>
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>TJM</TableHead>
                    <TableHead>Tasks</TableHead>
                    <TableHead>Cost</TableHead>
                    {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map(project => {
                    const team = getTeamById(project.teamId);
                    const projectTasks = getTasksByProject(project.id);
                    const teamEmployees = getEmployeesByTeam(project.teamId);
                    const cost = calculateProjectCost(project.id);
                    const completedTasks = projectTasks.filter(task => task.status === "done").length;
                    const progress = projectTasks.length > 0 
                      ? Math.round((completedTasks / projectTasks.length) * 100) 
                      : 0;
                    
                    return (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <Link to={`/projects/${project.id}`} className="hover:underline text-primary font-medium flex items-center">
                              <FileText className="h-4 w-4 mr-1 text-gray-500" />
                              {project.name}
                            </Link>
                            {project.description && (
                              <p className="text-xs text-gray-500 mt-1">{project.description}</p>
                            )}
                            {projectTasks.length > 0 && (
                              <div className="mt-2">
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className={`h-1.5 rounded-full ${progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                    style={{ width: `${progress}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-500 mt-1">{progress}% complete</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1 text-gray-500" />
                              <span className="font-medium">{team?.name || "No team"}</span>
                            </div>
                            {teamEmployees.length > 0 && (
                              <div className="mt-1 text-xs text-gray-500">
                                {teamEmployees.length} team member{teamEmployees.length !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                            <span>{project.createdAt ? format(new Date(project.createdAt), 'MMM d, yyyy') : "N/A"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {project.tjm ? `€${project.tjm}` : "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge>
                            {projectTasks.length} task{projectTasks.length !== 1 ? 's' : ''}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            €{cost.toLocaleString()}
                          </Badge>
                        </TableCell>
                        {isAdmin && (
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="cursor-pointer"
                                  onClick={() => openEditProjectDialog(project)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600 cursor-pointer"
                                  onClick={() => openDeleteDialog(project.id, project.name)}
                                >
                                  <Trash className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-500">
                {searchQuery.trim() ? "No matching projects found" : "No projects found"}
              </h3>
              <p className="mt-2 text-sm text-gray-400">
                {searchQuery.trim() 
                  ? "Try adjusting your search query or clear it to see all projects" 
                  : "Get started by creating a new project"}
              </p>
              <div className="flex justify-center mt-4 space-x-2">
                {searchQuery.trim() && (
                  <Button 
                    variant="outline"
                    onClick={() => setSearchQuery("")}
                  >
                    Clear Search
                  </Button>
                )}
                <Button 
                  variant="outline"
                  onClick={refreshData}
                  disabled={isRefreshing}
                >
                  {isRefreshing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </>
                  )}
                </Button>
                {isAdmin && (
                  <Button 
                    onClick={() => setIsNewProjectOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Project
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Edit Project Dialog */}
      <Dialog open={isEditProjectOpen} onOpenChange={setIsEditProjectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update the project details.
            </DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Project Name <span className="text-red-500">*</span></Label>
                <Input 
                  id="edit-name" 
                  placeholder="Enter project name"
                  value={selectedProject.name}
                  onChange={(e) => setSelectedProject(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea 
                  id="edit-description" 
                  placeholder="Describe the project"
                  value={selectedProject.description}
                  onChange={(e) => setSelectedProject(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-team">Assign Team <span className="text-red-500">*</span></Label>
                <select
                  id="edit-team"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedProject.teamId}
                  onChange={(e) => setSelectedProject(prev => prev ? ({ ...prev, teamId: e.target.value }) : null)}
                >
                  <option value="">Select a team</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tjm">TJM (€)</Label>
                <Input 
                  id="edit-tjm" 
                  type="number"
                  placeholder="Daily rate"
                  value={selectedProject.tjm}
                  onChange={(e) => setSelectedProject(prev => prev ? ({ ...prev, tjm: Number(e.target.value) }) : null)}
                />
              </div>
              
              {selectedProject.createdAt && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span>Created on {format(new Date(selectedProject.createdAt), 'MMMM d, yyyy')}</span>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditProjectOpen(false)}>Cancel</Button>
            <Button onClick={handleEditProject} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Project'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete project "{projectToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteProject} disabled={isSubmitting || localLoading}>
              {isSubmitting || localLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Project'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Projects;
