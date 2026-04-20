import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  UserCheck, 
  ShieldAlert, 
  Loader2, 
  AlertCircle,
  CheckCircle2
} from "lucide-react";

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
    return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
  }
  if (status === "SUSPENDED" || status === "DEACTIVATED") {
    return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
  }
  return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
} as const;

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 15 } }
} as const;

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

  // Clear success message automatically
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

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
    <div className="pt-24 px-6 min-h-screen bg-[#050020] text-white overflow-hidden relative">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        className="max-w-7xl mx-auto relative z-10 pb-20 space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.section variants={itemVariants} className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-blue-500/20 rounded-xl shadow-[0_0_30px_rgba(59,130,246,0.3)] border border-blue-500/30">
            <Users className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              View Users
            </h1>
            <p className="text-gray-400 text-sm md:text-base mt-2">
              Inspect registered users and manage role/status access.
            </p>
          </div>
        </motion.section>

        <motion.section variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <motion.div variants={itemVariants} className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] hover:border-blue-500/30 transition-colors rounded-3xl p-6 shadow-xl flex items-center gap-4">
             <div className="p-4 bg-blue-500/10 rounded-2xl">
                <Users className="w-8 h-8 text-blue-400" />
             </div>
             <div>
                <p className="text-xs uppercase font-medium tracking-wide text-gray-400">Total Users</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
             </div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] hover:border-emerald-500/30 transition-colors rounded-3xl p-6 shadow-xl flex items-center gap-4">
             <div className="p-4 bg-emerald-500/10 rounded-2xl">
                <UserCheck className="w-8 h-8 text-emerald-400" />
             </div>
             <div>
                <p className="text-xs uppercase font-medium tracking-wide text-gray-400">Active</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.active}</p>
             </div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] hover:border-purple-500/30 transition-colors rounded-3xl p-6 shadow-xl flex items-center gap-4">
             <div className="p-4 bg-purple-500/10 rounded-2xl">
                <ShieldAlert className="w-8 h-8 text-purple-400" />
             </div>
             <div>
                <p className="text-xs uppercase font-medium tracking-wide text-gray-400">Admins</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.admins}</p>
             </div>
          </motion.div>
        </motion.section>

        <motion.section variants={itemVariants} className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-3xl p-6 md:p-8 shadow-2xl relative">
          <AnimatePresence>
            {actionError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 mb-6 shadow-lg shadow-rose-500/5"
              >
                <AlertCircle className="w-5 h-5 text-rose-400" />
                <p className="text-sm font-medium text-rose-200">{actionError}</p>
              </motion.div>
            )}
            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6 shadow-lg shadow-emerald-500/5"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <p className="text-sm font-medium text-emerald-200">{successMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {isLoading ? (
             <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                <p className="text-blue-200">Loading user registry...</p>
             </div>
          ) : null}
          
          {!isLoading && error ? (
            <div className="flex flex-col items-center py-12 text-center">
              <AlertCircle className="w-12 h-12 text-rose-400 mb-4" />
              <p className="text-rose-200 mb-4">{error}</p>
              <button
                type="button"
                onClick={() => void loadUsers()}
                className="px-6 py-2.5 bg-rose-500 hover:bg-rose-400 rounded-xl font-medium shadow-lg shadow-rose-500/20"
              >
                Retry Connection
              </button>
            </div>
          ) : null}

          {!isLoading && !error && users.length === 0 ? (
            <div className="text-center py-12">
               <Users className="w-12 h-12 mx-auto text-gray-500 mb-4 opacity-50" />
               <p className="text-gray-400">No users found in the system.</p>
            </div>
          ) : null}

          {!isLoading && !error && users.length > 0 ? (
            <div className="space-y-4">
              {users.map((user) => {
                const isUpdating = Boolean(updatingIds[user.id]);
                return (
                  <motion.article
                    key={user.id}
                    variants={itemVariants}
                    className="group bg-white/[0.03] border border-white/[0.08] hover:border-blue-500/30 rounded-2xl p-5 md:p-6 transition-all duration-300 relative overflow-hidden flex flex-col md:flex-row gap-6 md:items-center justify-between"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    
                    <div className="flex-1 z-10">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md ${getStatusStyle(user.status)}`}>
                          {user.status}
                        </span>
                        <span className="text-xs text-gray-500 font-medium bg-white/5 px-2 py-1 rounded-md mb-[2px]">
                           {user.role}
                        </span>
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">
                        @{user.username} • {user.email}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 font-medium">
                        <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                        <span>Last Login: {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Never"}</span>
                      </div>
                    </div>

                    <div className="w-full md:w-auto grid grid-cols-2 gap-3 z-10 shrink-0 bg-black/20 p-3 rounded-xl border border-white/5">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1" htmlFor={`role-${user.id}`}>
                          Access Role
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
                          className="w-full rounded-lg bg-white/10 hover:bg-white/15 focus:ring-2 focus:ring-blue-500 outline-none border border-white/20 px-3 py-2 text-sm text-white disabled:opacity-50 transition-all appearance-none cursor-pointer"
                          style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="none" stroke="%239CA3AF" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>')`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1em 1em', paddingRight: '2rem' }}
                        >
                          {ROLES.map((role) => (
                            <option key={role} value={role} className="text-gray-900 bg-white">
                              {role}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1" htmlFor={`status-${user.id}`}>
                          Account Status
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
                          className="w-full rounded-lg bg-white/10 hover:bg-white/15 focus:ring-2 focus:ring-blue-500 outline-none border border-white/20 px-3 py-2 text-sm text-white disabled:opacity-50 transition-all appearance-none cursor-pointer"
                          style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="none" stroke="%239CA3AF" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>')`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1em 1em', paddingRight: '2rem' }}
                        >
                          {STATUSES.map((status) => (
                            <option key={status} value={status} className="text-gray-900 bg-white">
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {isUpdating && (
                       <div className="absolute top-4 right-4 z-20">
                          <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                       </div>
                    )}
                  </motion.article>
                );
              })}
            </div>
          ) : null}
        </motion.section>
      </motion.div>
    </div>
  );
}
