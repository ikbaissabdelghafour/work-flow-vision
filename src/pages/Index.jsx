
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Layout, CheckCircle, Users } from "lucide-react";

// Redirect to dashboard if authenticated, otherwise show welcome page
const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // While checking authentication status, show loading spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-jira-blue border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // If user is already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Otherwise show a welcome page
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-10">
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">WorkFlow Vision</h1>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto">Gérez vos projets et équipes efficacement avec notre solution moderne et intuitive</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-effect border-opacity-40 shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in" style={{animationDelay: "0.1s"}}>
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-gradient-blue flex items-center justify-center mb-2">
                <Layout className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Projets</CardTitle>
              <CardDescription>Organisez votre travail</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Créez et gérez des projets</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Établissez des délais clairs</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Suivez la progression</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="glass-effect border-opacity-40 shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in" style={{animationDelay: "0.2s"}}>
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-gradient-purple flex items-center justify-center mb-2">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Tâches</CardTitle>
              <CardDescription>Suivez votre progression</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Tableau Kanban intuitif</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Organisez les priorités</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Statuts personnalisables</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="glass-effect border-opacity-40 shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in" style={{animationDelay: "0.3s"}}>
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-gradient-indigo flex items-center justify-center mb-2">
                <Users className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">Équipes</CardTitle>
              <CardDescription>Collaborez efficacement</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Gérez les membres</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Assignez aux projets</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Suivez les performances</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-center mt-8 animate-fade-in" style={{animationDelay: "0.4s"}}>
          <Link to="/login">
            <Button variant="gradient" size="lg" className="px-8 py-6 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300">
              <span>Commencez maintenant</span>
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
