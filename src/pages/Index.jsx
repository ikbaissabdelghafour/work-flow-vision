
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Layout, CheckCircle, Users, Sparkles, Clock, ChartBar } from "lucide-react";

// Redirect to dashboard if authenticated, otherwise show welcome page
const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // While checking authentication status, show loading spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-jira-blue border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // If user is already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Otherwise show a welcome page
  return (
    <div className="min-h-screen bg-gradient-page flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{backgroundImage: "url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80')"}}></div>
      
      <div className="max-w-5xl w-full space-y-14 relative z-10">
        <div className="text-center space-y-6 animate-fade-in">
          <div className="inline-block mb-2">
            <div className="px-4 py-1 text-sm bg-gradient-blue text-white rounded-full shadow-sm">
              La solution pour gérer vos projets efficacement
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 bg-clip-text text-transparent leading-tight sm:text-6xl md:text-7xl">
            WorkFlow Vision
          </h1>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto">
            Gérez vos projets et équipes efficacement avec notre solution moderne et intuitive
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="glass-effect border-opacity-40 shadow-lg hover-lift animate-fade-in overflow-hidden" style={{animationDelay: "0.1s"}}>
            <div className="absolute top-0 right-0 w-24 h-24 -mt-8 -mr-8 bg-gradient-blue rounded-full opacity-10"></div>
            <CardHeader>
              <div className="w-14 h-14 rounded-2xl bg-gradient-blue flex items-center justify-center mb-3 shadow-md">
                <Layout className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Projets
              </CardTitle>
              <CardDescription>Organisez votre travail</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Créez et gérez des projets</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Établissez des délais clairs</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Suivez la progression</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="glass-effect border-opacity-40 shadow-lg hover-lift animate-fade-in overflow-hidden" style={{animationDelay: "0.2s"}}>
            <div className="absolute top-0 right-0 w-24 h-24 -mt-8 -mr-8 bg-gradient-purple rounded-full opacity-10"></div>
            <CardHeader>
              <div className="w-14 h-14 rounded-2xl bg-gradient-purple flex items-center justify-center mb-3 shadow-md">
                <ChartBar className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Tâches
              </CardTitle>
              <CardDescription>Suivez votre progression</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Tableau Kanban intuitif</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Organisez les priorités</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Statuts personnalisables</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="glass-effect border-opacity-40 shadow-lg hover-lift animate-fade-in overflow-hidden" style={{animationDelay: "0.3s"}}>
            <div className="absolute top-0 right-0 w-24 h-24 -mt-8 -mr-8 bg-gradient-indigo rounded-full opacity-10"></div>
            <CardHeader>
              <div className="w-14 h-14 rounded-2xl bg-gradient-indigo flex items-center justify-center mb-3 shadow-md">
                <Users className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                Équipes
              </CardTitle>
              <CardDescription>Collaborez efficacement</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Gérez les membres</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Assignez aux projets</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Suivez les performances</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-center mt-10 animate-fade-in" style={{animationDelay: "0.4s"}}>
          <Link to="/login">
            <Button variant="indigo" size="lg" className="px-8 py-6 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300 group">
              <span>Commencez maintenant</span>
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
        
        <div className="animate-fade-in text-center mt-10">
          <div className="text-sm text-gray-500">Plateforme utilisée par des milliers d'entreprises dans le monde</div>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-6 mt-5 opacity-70">
            <div className="text-xl font-bold">Company 1</div>
            <div className="text-xl font-bold">Company 2</div>
            <div className="text-xl font-bold">Company 3</div>
            <div className="text-xl font-bold">Company 4</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
