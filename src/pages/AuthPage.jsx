
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

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      if (!success) {
        toast.error("Identifiants invalides", {
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
        description: "Une erreur est survenue lors de la connexion.",
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
          <p className="mt-2 text-gray-500">Connectez-vous à votre compte</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Connexion</CardTitle>
            <CardDescription>
              Entrez vos identifiants pour accéder à votre compte
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
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
            </CardContent>
            
            <CardFooter>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Connexion en cours..." : "Se connecter"}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="text-center text-sm text-gray-500">
          <p>Pour tester l'API Laravel, vous devrez configurer le backend et créer un utilisateur.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
