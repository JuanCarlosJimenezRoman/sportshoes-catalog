const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export const auth = {
  login: (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = '/login';
  },

  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  getUser: () => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  isAuthenticated: () => {
    return !!auth.getToken();
  },

  isAdmin: () => {
    const user = auth.getUser();
    return user?.role === 'ADMIN';
  },
};