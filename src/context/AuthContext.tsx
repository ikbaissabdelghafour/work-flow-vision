import React, { useState, useEffect, createContext } from "react";
import { User } from "../types";
import { authApi } from "../lib/api";
import { useToast } from "@/hooks/use-toast";
import { createContextHook } from "@/lib/contextUtils";

// Define the auth context type
interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the hook
export const useAuth = createContextHook(AuthContext, 'useAuth');

// Create the provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await authApi.login(email, password);
      
      if (response && response.token) {
        setCurrentUser(response.user);
        localStorage.setItem("currentUser", JSON.stringify(response.user));
        localStorage.setItem("auth_token", response.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      try {
        await authApi.logout(token);
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("auth_token");
  };

  return (
    <AuthContext.Provider 
      value={{ 
        currentUser, 
        login, 
        logout, 
        isAuthenticated: !!currentUser,
        isLoading 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Export the context for testing purposes
export { AuthContext };
