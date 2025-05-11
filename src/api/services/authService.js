
// Mock authentication service
const authService = {
  // Mock login function that returns a promise
  login: async (email, password) => {
    console.log("Mock login called with:", email, password);
    
    // Check credentials for demo users
    if (email === "admin@example.com" && password === "admin123") {
      return {
        user: {
          id: 1,
          name: "Admin User",
          email: "admin@example.com",
          role: "admin",
          avatar: null
        }
      };
    } else if (email === "employee@example.com" && password === "employee123") {
      return {
        user: {
          id: 2,
          name: "Employee User",
          email: "employee@example.com",
          role: "employee",
          avatar: null
        }
      };
    }
    
    // Return null for invalid credentials
    return null;
  },

  // Mock logout function
  logout: async () => {
    console.log("Mock logout called");
    return true;
  },

  // Mock getCurrentUser function
  getCurrentUser: async () => {
    console.log("Mock getCurrentUser called");
    // Return null to simulate no active user session
    return null;
  }
};

export { authService };
