import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();
const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [inactivityTimer, setInactivityTimer] = useState(null);
  const navigate = useNavigate();

  // Reset inactivity timer
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }

    const newTimer = setTimeout(() => {
      logout();
      navigate("/login?reason=timeout");
    }, SESSION_TIMEOUT);

    setInactivityTimer(newTimer);
  }, [inactivityTimer]);

  // Set up event listeners for user activity
  useEffect(() => {
    if (!user) return;

    const events = ["mousedown", "keydown", "scroll", "touchstart"];

    const handleUserActivity = () => {
      resetInactivityTimer();
    };

    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity);
    });

    // Initial timer setup
    resetInactivityTimer();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
    };
  }, [user, resetInactivityTimer]);

  // Load data from localStorage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    const storedUsers = localStorage.getItem("registeredUsers") || "[]";

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      // Check if session is still valid
      const lastActivity = localStorage.getItem("lastActivity");
      if (
        lastActivity &&
        Date.now() - parseInt(lastActivity) > SESSION_TIMEOUT
      ) {
        localStorage.removeItem("currentUser");
        localStorage.removeItem("lastActivity");
      } else {
        setUser(parsedUser);
        localStorage.setItem("lastActivity", Date.now().toString());
      }
    }
    setUsers(JSON.parse(storedUsers));
    setLoading(false);
  }, []);

  const register = (email, password, name) => {
    const userExists = users.some((u) => u.email === email);
    if (userExists) {
      throw new Error("User already exists");
    }

    const newUser = {
      id: Date.now().toString(),
      email,
      password,
      name,
      token: `fake-token-${Date.now()}`,
      refreshToken: `fake-refresh-${Date.now()}`,
    };

    const updatedUsers = [...users, newUser];

    setUsers(updatedUsers);
    localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));

    // Auto-login after registration
    loginUser(newUser);
  };

  const login = (email, password) => {
    const foundUser = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!foundUser) {
      throw new Error("Invalid credentials");
    }

    loginUser(foundUser);
  };

  const loginUser = (userData) => {
    setUser(userData);
    localStorage.setItem("currentUser", JSON.stringify(userData));
    localStorage.setItem("lastActivity", Date.now().toString());
    resetInactivityTimer();
    navigate("/dashboard");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("lastActivity");
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
    navigate("/login");
  };

  // Simulated token refresh
  const refreshToken = useCallback(() => {
    if (!user) return;

    // In a real app, this would call your backend
    const updatedUser = {
      ...user,
      token: `fake-token-${Date.now()}`,
      refreshToken: `fake-refresh-${Date.now()}`,
    };

    setUser(updatedUser);
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    localStorage.setItem("lastActivity", Date.now().toString());
    resetInactivityTimer();
  }, [user, resetInactivityTimer]);

  const value = {
    user,
    users,
    login,
    logout,
    register,
    refreshToken,
    sessionTimeout: SESSION_TIMEOUT,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
