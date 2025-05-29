import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { authApi, teamsApi, employeesApi, projectsApi, tasksApi } from '@/lib/api';

const ApiTest: React.FC = () => {
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const addResult = (message: string) => {
    setResults(prev => [...prev, message]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const testApiConnection = async () => {
    try {
      addResult('Testing API connection...');
      const response = await fetch('/api/test');
      if (!response.ok) {
        throw new Error(`API test failed with status: ${response.status}`);
      }
      const data = await response.json();
      addResult(`✅ API connection successful: ${JSON.stringify(data)}`);
      return true;
    } catch (error) {
      addResult(`❌ API connection failed: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  };

  const testLogin = async () => {
    try {
      addResult('Testing login...');
      const loginResult = await authApi.login('admin@example.com', 'password');
      if (!loginResult || !loginResult.token) {
        throw new Error('Login failed');
      }
      addResult(`✅ Login successful: ${loginResult.user.name} (${loginResult.user.email})`);
      setToken(loginResult.token);
      return loginResult.token;
    } catch (error) {
      addResult(`❌ Login failed: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  };

  const testTeamsApi = async (token: string) => {
    try {
      addResult('Testing teams API...');
      const teams = await teamsApi.getAll(token);
      addResult(`✅ Teams API successful. Retrieved ${teams.length} teams.`);
      if (teams.length > 0) {
        addResult(`First team: ${teams[0].name}`);
      }
      return true;
    } catch (error) {
      addResult(`❌ Teams API failed: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  };

  const testEmployeesApi = async (token: string) => {
    try {
      addResult('Testing employees API...');
      const employees = await employeesApi.getAll(token);
      addResult(`✅ Employees API successful. Retrieved ${employees.length} employees.`);
      if (employees.length > 0) {
        addResult(`First employee: ${employees[0].name} (${employees[0].email})`);
      }
      return true;
    } catch (error) {
      addResult(`❌ Employees API failed: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  };

  const testProjectsApi = async (token: string) => {
    try {
      addResult('Testing projects API...');
      const projects = await projectsApi.getAll(token);
      addResult(`✅ Projects API successful. Retrieved ${projects.length} projects.`);
      if (projects.length > 0) {
        addResult(`First project: ${projects[0].name}`);
      }
      return true;
    } catch (error) {
      addResult(`❌ Projects API failed: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  };

  const testTasksApi = async (token: string) => {
    try {
      addResult('Testing tasks API...');
      const tasks = await tasksApi.getAll(token);
      addResult(`✅ Tasks API successful. Retrieved ${tasks.length} tasks.`);
      if (tasks.length > 0) {
        addResult(`First task: ${tasks[0].title}`);
      }
      return true;
    } catch (error) {
      addResult(`❌ Tasks API failed: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  };

  const testLogout = async (token: string) => {
    try {
      addResult('Testing logout...');
      await authApi.logout(token);
      addResult('✅ Logout successful');
      setToken(null);
      return true;
    } catch (error) {
      addResult(`❌ Logout failed: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  };

  const runAllTests = async () => {
    setIsLoading(true);
    clearResults();
    addResult('🧪 Starting API integration tests...');
    
    const apiConnected = await testApiConnection();
    if (!apiConnected) {
      addResult('❌ Tests aborted: API connection failed');
      setIsLoading(false);
      return;
    }
    
    const authToken = await testLogin();
    if (!authToken) {
      addResult('❌ Tests aborted: Authentication failed');
      setIsLoading(false);
      return;
    }
    
    await testTeamsApi(authToken);
    await testEmployeesApi(authToken);
    await testProjectsApi(authToken);
    await testTasksApi(authToken);
    await testLogout(authToken);
    
    addResult('🎉 All API tests completed!');
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>API Integration Test</CardTitle>
          <CardDescription>
            Test the integration between the React frontend and Laravel backend
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-4">
              <Button onClick={runAllTests} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    Running Tests...
                  </>
                ) : (
                  'Run All Tests'
                )}
              </Button>
              <Button variant="outline" onClick={clearResults} disabled={isLoading}>
                Clear Results
              </Button>
            </div>
            <div className="bg-gray-50 p-4 rounded-md h-96 overflow-y-auto">
              {results.length === 0 ? (
                <p className="text-gray-500 italic">Test results will appear here...</p>
              ) : (
                <div className="space-y-2">
                  {results.map((result, index) => (
                    <div key={index} className="font-mono text-sm">
                      {result}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="text-sm text-gray-500">
          Make sure both the Laravel backend and React frontend servers are running.
        </CardFooter>
      </Card>
    </div>
  );
};

export default ApiTest;
