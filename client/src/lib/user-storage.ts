export const userStorage = {
  getUser: (): string | null => {
    try {
      return localStorage.getItem("ratio_user");
    } catch {
      return null;
    }
  },

  setUser: (username: string): void => {
    try {
      localStorage.setItem("ratio_user", username);
    } catch {}
  },

  clearUser: (): void => {
    try {
      localStorage.removeItem("ratio_user");
    } catch {}
  },
};
