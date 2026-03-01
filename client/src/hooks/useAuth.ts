import { useState, useCallback, useEffect } from "react";
import { User } from "../types";

export interface UseAuthReturn {
  currentUser: User | null;
  users: User[];
  email: string;
  password: string;
  username: string;
  confirmPassword: string;
  authError: string;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setUsername: (username: string) => void;
  setConfirmPassword: (confirmPassword: string) => void;
  handleSignUp: () => void;
  handleLogin: () => void;
  handleLogout: () => void;
}

export function useAuth(): UseAuthReturn {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Load users from localStorage
  useEffect(() => {
    const storedUsers = localStorage.getItem("users");
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }
  }, []);

  // Save users to localStorage
  const saveUsers = useCallback((updatedUsers: User[]) => {
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  }, []);

  const handleSignUp = useCallback(() => {
    setAuthError("");
    if (!email || !password || !username) {
      setAuthError("All fields are required");
      return;
    }
    if (password !== confirmPassword) {
      setAuthError("Passwords do not match");
      return;
    }
    if (users.find((u) => u.email === email)) {
      setAuthError("Email already registered");
      return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      username,
      email,
      password,
    };

    saveUsers([...users, newUser]);
    setCurrentUser(newUser);
    setEmail("");
    setPassword("");
    setUsername("");
    setConfirmPassword("");
  }, [email, password, username, confirmPassword, users, saveUsers]);

  const handleLogin = useCallback(() => {
    setAuthError("");
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) {
      setAuthError("Invalid email or password");
      return;
    }
    setCurrentUser(user);
    setEmail("");
    setPassword("");
  }, [email, password, users]);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setEmail("");
    setPassword("");
    setUsername("");
    setConfirmPassword("");
  }, []);

  return {
    currentUser,
    users,
    email,
    password,
    username,
    confirmPassword,
    authError,
    setEmail,
    setPassword,
    setUsername,
    setConfirmPassword,
    handleSignUp,
    handleLogin,
    handleLogout,
  };
}
