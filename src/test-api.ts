import { authApi, teamsApi, employeesApi, projectsApi, tasksApi } from './lib/api';

// Test function to verify API integration
async function testApiIntegration() {
  console.log('🧪 Starting API integration test...');
  
  try {
    // Step 1: Test API connection
    console.log('Step 1: Testing API connection...');
    const response = await fetch('/api/test');
    if (!response.ok) {
      throw new Error(`API test failed with status: ${response.status}`);
    }
    const data = await response.json();
    console.log('✅ API connection successful:', data);
    
    // Step 2: Test login
    console.log('Step 2: Testing login...');
    const loginResult = await authApi.login('admin@example.com', 'password');
    if (!loginResult || !loginResult.token) {
      throw new Error('Login failed');
    }
    console.log('✅ Login successful:', loginResult.user);
    
    const token = loginResult.token;
    
    // Step 3: Test teams API
    console.log('Step 3: Testing teams API...');
    const teams = await teamsApi.getAll(token);
    console.log(`✅ Teams API successful. Retrieved ${teams.length} teams:`, teams);
    
    // Step 4: Test employees API
    console.log('Step 4: Testing employees API...');
    const employees = await employeesApi.getAll(token);
    console.log(`✅ Employees API successful. Retrieved ${employees.length} employees:`, employees);
    
    // Step 5: Test projects API
    console.log('Step 5: Testing projects API...');
    const projects = await projectsApi.getAll(token);
    console.log(`✅ Projects API successful. Retrieved ${projects.length} projects:`, projects);
    
    // Step 6: Test tasks API
    console.log('Step 6: Testing tasks API...');
    const tasks = await tasksApi.getAll(token);
    console.log(`✅ Tasks API successful. Retrieved ${tasks.length} tasks:`, tasks);
    
    // Step 7: Test logout
    console.log('Step 7: Testing logout...');
    await authApi.logout(token);
    console.log('✅ Logout successful');
    
    console.log('🎉 All API tests passed successfully!');
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

// Run the test
testApiIntegration();

export {};
