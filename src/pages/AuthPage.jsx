
import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AuthPage = () => {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState("admin");
  const { login, isAuthenticated } = useAuth();

  const handleUserTypeChange = (type) => {
    setUserType(type);
    if (type === "admin") {
      setEmail("admin@example.com");
      setPassword("admin123");
    } else {
      setEmail("employee@example.com");
      setPassword("employee123");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      if (!success) {
        toast.error("Identifiants incorrects", {
          description: "Veuillez vérifier votre email et mot de passe.",
        });
      } else {
        toast.success("Connexion réussie", {
          description: "Bienvenue sur WorkFlow Vision!",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Erreur de connexion", {
        description: "Une erreur s'est produite lors de la connexion.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-lg bg-jira-blue flex items-center justify-center">
            <span className="text-white font-bold text-xl">WV</span>
          </div>
          <h1 className="mt-3 text-3xl font-bold">WorkFlow Vision</h1>
          <p className="mt-2 text-gray-500">Choisissez un rôle pour vous connecter</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Connexion</CardTitle>
            <CardDescription>
              Choisissez votre rôle et connectez-vous
            </CardDescription>
          </CardHeader>
          
          <Tabs defaultValue="admin" onValueChange={handleUserTypeChange}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="admin">Admin</TabsTrigger>
              <TabsTrigger value="employee">Employé</TabsTrigger>
            </TabsList>
            
            <TabsContent value="admin">
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="bg-blue-50 p-3 rounded-md border border-blue-100 text-sm">
                    <p className="font-medium text-blue-700">Identifiants Admin (Pré-remplis)</p>
                    <p className="text-blue-600">Email: admin@example.com</p>
                    <p className="text-blue-600">Mot de passe: admin123</p>
                    <p className="mt-1 text-blue-500 text-xs">Cliquez sur Connexion pour continuer</p>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? "Connexion en cours..." : "Connexion"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="employee">
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="employee@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="bg-blue-50 p-3 rounded-md border border-blue-100 text-sm">
                    <p className="font-medium text-blue-700">Identifiants Employé (Pré-remplis)</p>
                    <p className="text-blue-600">Email: employee@example.com</p>
                    <p className="text-blue-600">Mot de passe: employee123</p>
                    <p className="mt-1 text-blue-500 text-xs">Cliquez sur Connexion pour continuer</p>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? "Connexion en cours..." : "Connexion"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
        
        <div className="text-center text-sm text-gray-500">
          <p>Ceci est une application de démonstration avec des services API simulés.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
