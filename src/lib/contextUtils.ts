import { createContext, useContext } from 'react';

// Simple helper to create a typed context hook
export function createContextHook<T>(context: React.Context<T>, hookName: string) {
  return () => {
    const value = useContext(context);
    if (value === undefined) {
      throw new Error(`${hookName} must be used within its Provider`);
    }
    return value;
  };
}

// Create a context with undefined as default value
export function createTypedContext<T>() {
  return createContext<T | undefined>(undefined);
}
