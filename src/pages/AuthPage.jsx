
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
import { Mail, Lock, LogIn, ArrowRight } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-page p-4 overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center opacity-5" style={{backgroundImage: "url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80')"}}></div>
      
      <div className="w-full max-w-md space-y-8 animate-fade-in relative z-10">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-indigo flex items-center justify-center shadow-lg animate-float">
            <span className="text-white font-bold text-3xl">WV</span>
          </div>
          <h1 className="mt-6 text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 bg-clip-text text-transparent">
            WorkFlow Vision
          </h1>
          <p className="mt-2 text-gray-500">Connectez-vous à votre compte</p>
        </div>
        
        <Card className="glass-effect border-opacity-40 shadow-xl">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl text-center">Connexion</CardTitle>
            <CardDescription className="text-center">
              Entrez vos identifiants pour accéder à votre compte
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit} className="animate-slide-in">
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11"
                    required
                  />
                </div>
                <div className="text-right">
                  <a href="#" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                    Mot de passe oublié?
                  </a>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full font-medium"
                variant="gradient"
                size="lg"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connexion en cours...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="h-5 w-5" />
                    Se connecter
                  </span>
                )}
              </Button>
              
              <div className="text-center">
                <span className="text-sm text-gray-500">Vous n'avez pas de compte? </span>
                <Button variant="link" className="p-0 h-auto text-blue-600 hover:text-blue-800">
                  Créer un compte
                </Button>
              </div>
            </CardFooter>
          </form>
        </Card>
        
        <div className="text-center text-sm text-gray-500 animate-fade-in mt-4 p-3 bg-white/50 rounded-xl backdrop-blur-sm" style={{animationDelay: "0.2s"}}>
          <p>Demo: email: demo@example.com / password: password</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
