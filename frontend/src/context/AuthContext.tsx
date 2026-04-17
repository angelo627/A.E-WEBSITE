import React, { createContext, useState } from "react";
import type { ReactNode } from "react";

export type UserRole = "STUDENT" | "ADMIN" | "SUPER_ADMIN";
export type UserStatus = "PENDING_VERIFICATION" | "ACTIVE" | "SUSPENDED" | "DEACTIVATED";

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: UserRole;
  status?: UserStatus;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_ROLES: ReadonlyArray<UserRole> = ["STUDENT", "ADMIN", "SUPER_ADMIN"];
const USER_STATUSES: ReadonlyArray<UserStatus> = [
  "PENDING_VERIFICATION",
  "ACTIVE",
  "SUSPENDED",
  "DEACTIVATED"
];

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isUserRole = (value: unknown): value is UserRole =>
  typeof value === "string" && USER_ROLES.includes(value as UserRole);

const isUserStatus = (value: unknown): value is UserStatus =>
  typeof value === "string" && USER_STATUSES.includes(value as UserStatus);

const isAuthUser = (value: unknown): value is AuthUser => {
  if (!isObject(value)) {
    return false;
  }

  if (
    !isString(value.id) ||
    !isString(value.firstName) ||
    !isString(value.lastName) ||
    !isString(value.username) ||
    !isString(value.email) ||
    !isUserRole(value.role)
  ) {
    return false;
  }

  if (value.status !== undefined && !isUserStatus(value.status)) {
    return false;
  }

  return true;
};

const clearStoredAuth = (): void => {
  localStorage.removeItem("ae_user");
  localStorage.removeItem("ae_token");
};

const getStoredAuth = (): { user: AuthUser | null; token: string | null } => {
  const savedUser = localStorage.getItem("ae_user");
  const savedToken = localStorage.getItem("ae_token");

  if (!savedUser || !savedToken) {
    return { user: null, token: null };
  }

  if (!isString(savedToken)) {
    clearStoredAuth();
    return { user: null, token: null };
  }

  try {
    const parsed = JSON.parse(savedUser) as unknown;
    if (!isAuthUser(parsed)) {
      clearStoredAuth();
      return { user: null, token: null };
    }
    return { user: parsed, token: savedToken };
  } catch (error) {
    console.error("Failed to parse saved user from localStorage:", error);
    clearStoredAuth();
    return { user: null, token: null };
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const storedAuth = getStoredAuth();
  const [user, setUser] = useState<AuthUser | null>(storedAuth.user);
  const [token, setToken] = useState<string | null>(storedAuth.token);

  const login = (newUser: AuthUser, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem("ae_user", JSON.stringify(newUser));
    localStorage.setItem("ae_token", newToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    clearStoredAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading: false,
        login,
        logout,
        isLoggedIn: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
