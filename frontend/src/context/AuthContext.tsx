import React, { createContext, useState, useEffect } from "react";
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
  avatarUrl?: string;
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

const isStringAllowEmpty = (value: unknown): value is string =>
  typeof value === "string";

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
    !isStringAllowEmpty(value.lastName) ||
    !isString(value.username) ||
    !isString(value.email) ||
    !isUserRole(value.role)
  ) {
    return false;
  }

  if (value.status !== undefined && !isUserStatus(value.status)) {
    return false;
  }

  if (value.avatarUrl !== undefined && typeof value.avatarUrl !== "string") {
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
  const [authState, setAuthState] = useState<{ user: AuthUser | null; token: string | null }>(
    () => getStoredAuth()
  );
  const [isValidating, setIsValidating] = useState(true);
  const { user, token } = authState;

  // Validate token on mount and periodically
  useEffect(() => {
    const validateToken = async () => {
      if (!token || !user) {
        setIsValidating(false);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:5050/api"}/auth/me`,
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          // Token is invalid or expired
          console.warn("Token validation failed, clearing auth state");
          setAuthState({ user: null, token: null });
          clearStoredAuth();
        }
      } catch (error) {
        console.error("Token validation error:", error);
        // On network error, keep the session but log the error
        // This prevents logout on temporary network issues
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token, user]);

  const login = (newUser: AuthUser, newToken: string) => {
    // Write to localStorage synchronously FIRST so apiFetch can read it
    // even if React hasn't re-rendered yet.
    localStorage.setItem("ae_user", JSON.stringify(newUser));
    localStorage.setItem("ae_token", newToken);
    setAuthState({ user: newUser, token: newToken });
  };

  const logout = () => {
    setAuthState({ user: null, token: null });
    clearStoredAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading: isValidating,
        login,
        logout,
        isLoggedIn: !!user && !!token && !isValidating,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
