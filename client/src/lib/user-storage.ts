export interface RegisteredUser {
  username: string;
  password: string;
  registeredAt: string;
}

export const userStorage = {
  // Get currently logged in user
  getUser: (): string | null => {
    try {
      return localStorage.getItem("ratio_current_user");
    } catch {
      return null;
    }
  },

  // Set current logged in user
  setUser: (username: string): void => {
    try {
      localStorage.setItem("ratio_current_user", username);
    } catch {}
  },

  // Logout current user (preserves all data)
  clearUser: (): void => {
    try {
      localStorage.removeItem("ratio_current_user");
    } catch {}
  },

  // Get all registered users
  getRegisteredUsers: (): RegisteredUser[] => {
    try {
      const data = localStorage.getItem("ratio_registered_users");
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  // Register new user
  registerUser: (username: string, password: string): boolean => {
    try {
      const users = userStorage.getRegisteredUsers();
      if (users.some(u => u.username === username)) {
        return false; // User already exists
      }
      users.push({
        username,
        password,
        registeredAt: new Date().toISOString(),
      });
      localStorage.setItem("ratio_registered_users", JSON.stringify(users));
      return true;
    } catch {
      return false;
    }
  },

  // Check if user is registered
  userExists: (username: string): boolean => {
    const users = userStorage.getRegisteredUsers();
    return users.some(u => u.username === username);
  },

  // Get user by username
  getUserByUsername: (username: string): RegisteredUser | null => {
    const users = userStorage.getRegisteredUsers();
    return users.find(u => u.username === username) || null;
  },

  // Verify password
  verifyPassword: (username: string, password: string): boolean => {
    const user = userStorage.getUserByUsername(username);
    return user !== null && user.password === password;
  },

  // Login user (verify exists and password matches)
  loginUser: (username: string, password: string): boolean => {
    if (userStorage.verifyPassword(username, password)) {
      userStorage.setUser(username);
      return true;
    }
    return false;
  },
};
