import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../lib/api";

type UserRole = "STUDENT" | "ADMIN" | "SUPER_ADMIN";
type UserStatus = "PENDING_VERIFICATION" | "ACTIVE" | "SUSPENDED" | "DEACTIVATED";

interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string | null;
  emailVerifiedAt?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

const ROLES: ReadonlyArray<UserRole> = ["STUDENT", "ADMIN", "SUPER_ADMIN"];
const STATUSES: ReadonlyArray<UserStatus> = [
  "PENDING_VERIFICATION",
  "ACTIVE",
  "SUSPENDED",
  "DEACTIVATED"
];

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isRole = (value: unknown): value is UserRole =>
  typeof value === "string" && ROLES.includes(value as UserRole);

const isStatus = (value: unknown): value is UserStatus =>
  typeof value === "string" && STATUSES.includes(value as UserStatus);

const isAdminUser = (value: unknown): value is AdminUser => {
  if (!isObject(value) || !isRole(value.role) || !isStatus(value.status)) {
    return false;
  }

  const baseValid =
    typeof value.id === "string" &&
    typeof value.firstName === "string" &&
    typeof value.lastName === "string" &&
    typeof value.username === "string" &&
    typeof value.email === "string" &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string";

  if (!baseValid) {
    return false;
  }

  if (value.avatarUrl !== undefined && value.avatarUrl !== null && typeof value.avatarUrl !== "string") {
    return false;
  }
  if (
    value.emailVerifiedAt !== undefined &&
    value.emailVerifiedAt !== null &&
    typeof value.emailVerifiedAt !== "string"
  ) {
    return false;
  }
  if (
    value.lastLoginAt !== undefined &&
    value.lastLoginAt !== null &&
    typeof value.lastLoginAt !== "string"
  ) {
    return false;
  }

  return true;
};

const isUsersResponse = (value: unknown): value is AdminUser[] =>
  Array.isArray(value) && value.every((user) => isAdminUser(user));

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
};

const getStatusStyle = (status: UserStatus): string => {
  if (status === "ACTIVE") {
    return "bg-emerald-500/15 text-emerald-300 border border-emerald-400/30";
  }
  if (status === "SUSPENDED" || status === "DEACTIVATED") {
    return "bg-rose-500/15 text-rose-300 border border-rose-400/30";
  }
  return "bg-amber-500/15 text-amber-200 border border-amber-400/30";
};

export default function ViewUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [updatingIds, setUpdatingIds] = useState<Record<string, boolean>>({});

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((user) => user.status === "ACTIVE").length;
    const admins = users.filter((user) => user.role === "ADMIN" || user.role === "SUPER_ADMIN").length;
    return { total, active, admins };
  }, [users]);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiFetch("/admin/users");
      if (!isUsersResponse(response)) {
        throw new Error("Unexpected users response shape.");
      }
      setUsers(response);
    } catch (fetchError: unknown) {
      setError(getErrorMessage(fetchError));
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const updateUserAccess = async (user: AdminUser, role: UserRole, status: UserStatus) => {
    setUpdatingIds((prev) => ({ ...prev, [user.id]: true }));
    setActionError(null);
    setSuccessMessage(null);

    try {
      await apiFetch(`/admin/users/${user.id}/access`, {
        method: "PATCH",
        body: JSON.stringify({ role, status })
      });
      setSuccessMessage(`Updated access for ${user.username}.`);
      await loadUsers();
    } catch (updateError: unknown) {
      setActionError(getErrorMessage(updateError));
    } finally {
      setUpdatingIds((prev) => {
        const next = { ...prev };
        delete next[user.id];
        return next;
      });
    }
  };

  return (
    <div className="pt-24 px-6 min-h-screen bg-[#050020] text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h1 className="text-3xl font-bold text-purple-300 mb-2">View Users</h1>
          <p className="text-gray-300">Inspect registered users and adjust role/status access.</p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-xs uppercase text-gray-400">Total Users</p>
            <p className="text-2xl font-semibold">{stats.total}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-xs uppercase text-gray-400">Active</p>
            <p className="text-2xl font-semibold">{stats.active}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-xs uppercase text-gray-400">Admins</p>
            <p className="text-2xl font-semibold">{stats.admins}</p>
          </div>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
          {actionError ? (
            <p className="text-sm text-rose-200 bg-rose-500/10 border border-rose-400/30 rounded-lg p-3 mb-3">
              {actionError}
            </p>
          ) : null}
          {successMessage ? (
            <p className="text-sm text-emerald-200 bg-emerald-500/10 border border-emerald-400/30 rounded-lg p-3 mb-3">
              {successMessage}
            </p>
          ) : null}

          {isLoading ? <p className="text-gray-300">Loading users...</p> : null}
          {!isLoading && error ? (
            <div className="space-y-3">
              <p className="text-rose-200">{error}</p>
              <button
                type="button"
                onClick={() => void loadUsers()}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-400 rounded-lg font-medium"
              >
                Retry
              </button>
            </div>
          ) : null}
          {!isLoading && !error && users.length === 0 ? (
            <p className="text-gray-300">No users found.</p>
          ) : null}

          {!isLoading && !error && users.length > 0 ? (
            <div className="space-y-3">
              {users.map((user) => {
                const isUpdating = Boolean(updatingIds[user.id]);
                return (
                  <article
                    key={user.id}
                    className="rounded-xl border border-white/15 bg-white/5 p-4 space-y-3"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-medium">
                          {user.firstName} {user.lastName}
                        </h3>
                        <p className="text-sm text-gray-300">
                          @{user.username} • {user.email}
                        </p>
                        <p className="text-sm text-gray-400">
                          Joined: {new Date(user.createdAt).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-400">
                          Last login: {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never"}
                        </p>
                      </div>

                      <span className={`text-xs px-2.5 py-1 rounded-full w-fit ${getStatusStyle(user.status)}`}>
                        {user.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1" htmlFor={`role-${user.id}`}>
                          Role
                        </label>
                        <select
                          id={`role-${user.id}`}
                          value={user.role}
                          onChange={(event) =>
                            void updateUserAccess(
                              user,
                              event.target.value as UserRole,
                              user.status
                            )
                          }
                          disabled={isUpdating}
                          className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 disabled:opacity-60"
                        >
                          {ROLES.map((role) => (
                            <option key={role} value={role} className="text-black">
                              {role}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-400 mb-1" htmlFor={`status-${user.id}`}>
                          Status
                        </label>
                        <select
                          id={`status-${user.id}`}
                          value={user.status}
                          onChange={(event) =>
                            void updateUserAccess(
                              user,
                              user.role,
                              event.target.value as UserStatus
                            )
                          }
                          disabled={isUpdating}
                          className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 disabled:opacity-60"
                        >
                          {STATUSES.map((status) => (
                            <option key={status} value={status} className="text-black">
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
