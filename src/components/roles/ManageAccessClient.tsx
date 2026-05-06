"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronDown,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import { Container } from "@/components/layout/container";
import Footer from "@/components/layout/Footer";
import { useAuthStore } from "@/store/use-auth-store";
import { toast } from "@/store/use-toast-store";
import { accountApi } from "@/lib/api/account";
import { bookingApi } from "@/lib/api/booking";
import { queueApi } from "@/lib/api/queue";
import {
  rolesApi,
  type RoleEntry,
  type ScopeType,
  type UserSearchResult,
} from "@/lib/api/roles";

// ── Types ──────────────────────────────────────────────────────────────────

type RoleOption = { value: string; label: string };

type StagedAddition = {
  localId: string;
  user: UserSearchResult;
  role: string;
};

export type ManageAccessProps = {
  scopeType: ScopeType;
  scopeId: string;
  backHref: string;
  availableRoles: RoleOption[];
};

// ── Helpers ────────────────────────────────────────────────────────────────

const ROLE_BADGE: Record<string, string> = {
  TENANT_ADMIN: "bg-purple-100 text-purple-700",
  BRANCH_ADMIN: "bg-blue-100 text-blue-700",
  SERVICE_MANAGER: "bg-amber-100 text-amber-700",
  STAFF: "bg-emerald-100 text-emerald-700",
};

const ROLE_LABELS: Record<string, string> = {
  TENANT_ADMIN: "Tenant Admin",
  BRANCH_ADMIN: "Branch Admin",
  SERVICE_MANAGER: "Service Manager",
  STAFF: "Staff",
};

function roleLabel(role: string) {
  return ROLE_LABELS[role] ?? role;
}

function roleBadge(role: string) {
  return ROLE_BADGE[role] ?? "bg-slate-100 text-slate-700";
}

// ── Component ──────────────────────────────────────────────────────────────

export default function ManageAccessClient({
  scopeType,
  scopeId,
  backHref,
  availableRoles,
}: ManageAccessProps) {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(() =>
    useAuthStore.persist.hasHydrated(),
  );
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);

  // Scope context ── loaded to get name + parent IDs
  const [scopeName, setScopeName] = useState<string>("");
  const [scopeContext, setScopeContext] = useState<{
    tenantId?: string;
    branchId?: string;
    serviceId?: string;
  }>({});
  const [contextLoading, setContextLoading] = useState(true);

  // Existing assignments
  const [entries, setEntries] = useState<RoleEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Staged changes
  const [stagedAdditions, setStagedAdditions] = useState<StagedAddition[]>([]);
  const [markedForDelete, setMarkedForDelete] = useState<Set<string>>(
    new Set(),
  );
  const [roleChanges, setRoleChanges] = useState<Map<string, string>>(
    new Map(),
  );

  // Add-user form state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(
    null,
  );
  const [selectedRole, setSelectedRole] = useState(
    availableRoles[0]?.value ?? "",
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Saving
  const [saving, setSaving] = useState(false);

  // ── Hydration ────────────────────────────────────────────────────────────

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() =>
      setHydrated(true),
    );
    return unsub;
  }, []);

  useEffect(() => {
    if (hydrated && (!user || !accessToken)) router.replace("/login");
  }, [hydrated, user, accessToken, router]);

  // ── Load scope context ───────────────────────────────────────────────────

  useEffect(() => {
    if (!accessToken || !hydrated) return;
    setContextLoading(true);
    const load = async () => {
      try {
        if (scopeType === "TENANT") {
          const t = await accountApi.getTenant(scopeId, accessToken);
          setScopeName(t.name);
          setScopeContext({ tenantId: scopeId });
        } else if (scopeType === "BRANCH") {
          const b = await accountApi.getBranch(scopeId, accessToken);
          setScopeName(b.name);
          setScopeContext({ tenantId: b.tenantId, branchId: scopeId });
        } else if (scopeType === "SERVICE") {
          const s = await bookingApi.getService(scopeId, accessToken);
          setScopeName(s.name);
          setScopeContext({
            tenantId: s.tenantId,
            branchId: s.branchId,
            serviceId: scopeId,
          });
        } else if (scopeType === "QUEUE") {
          const q = await queueApi.getQueueDetail(scopeId, accessToken);
          setScopeName(q.name);
          setScopeContext({
            tenantId: q.tenantId ?? undefined,
            branchId: q.branchId ?? undefined,
            serviceId: q.serviceId ?? undefined,
          });
        }
      } catch {
        // Fallback: use raw ID as display name
        setScopeName(scopeId);
      } finally {
        setContextLoading(false);
      }
    };
    load();
  }, [accessToken, hydrated, scopeType, scopeId]);

  // ── Load assignments ──────────────────────────────────────────────────────

  const loadEntries = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const data = await rolesApi.listRoles(
        scopeType,
        scopeId,
        undefined,
        accessToken,
      );
      setEntries(data);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load assignments",
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken, scopeType, scopeId]);

  useEffect(() => {
    if (hydrated && accessToken) loadEntries();
  }, [hydrated, accessToken, loadEntries]);

  // ── User search ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2 || !accessToken) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    const t = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await rolesApi.searchUsers(searchQuery, accessToken);
        setSearchResults(results);
        setShowDropdown(results.length > 0);
      } catch {
        // Silently ignore search errors
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery, accessToken]);

  // Close search dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const buildScopeIds = () => {
    if (scopeType === "TENANT") return { tenantId: scopeId };
    if (scopeType === "BRANCH")
      return { tenantId: scopeContext.tenantId, branchId: scopeId };
    if (scopeType === "SERVICE")
      return {
        tenantId: scopeContext.tenantId,
        branchId: scopeContext.branchId,
        serviceId: scopeId,
      };
    // QUEUE
    return {
      tenantId: scopeContext.tenantId,
      branchId: scopeContext.branchId,
      serviceId: scopeContext.serviceId,
      queueId: scopeId,
    };
  };

  const hasPendingChanges =
    stagedAdditions.length > 0 ||
    markedForDelete.size > 0 ||
    roleChanges.size > 0;

  // ── Staged-change actions ─────────────────────────────────────────────────

  const handleSelectUser = (u: UserSearchResult) => {
    setSelectedUser(u);
    setSearchQuery(u.email);
    setShowDropdown(false);
    setSearchResults([]);
  };

  const handleStageAddition = () => {
    if (!selectedUser) {
      toast.error("Please select a user first");
      return;
    }
    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }
    const alreadyExists = entries.some(
      (e) =>
        e.userId === selectedUser.id &&
        e.role === selectedRole &&
        !markedForDelete.has(e.id),
    );
    const alreadyStaged = stagedAdditions.some(
      (a) => a.user.id === selectedUser.id && a.role === selectedRole,
    );
    if (alreadyExists || alreadyStaged) {
      toast.error("This user already has this role");
      return;
    }
    setStagedAdditions((prev) => [
      ...prev,
      {
        localId: `local-${Date.now()}`,
        user: selectedUser,
        role: selectedRole,
      },
    ]);
    setSelectedUser(null);
    setSearchQuery("");
    setSelectedRole(availableRoles[0]?.value ?? "");
  };

  const handleRemoveStagedAddition = (localId: string) => {
    setStagedAdditions((prev) => prev.filter((a) => a.localId !== localId));
  };

  const handleMarkDelete = (id: string) => {
    setMarkedForDelete((prev) => new Set([...prev, id]));
  };

  const handleUnmarkDelete = (id: string) => {
    setMarkedForDelete((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleRoleChange = (
    id: string,
    newRole: string,
    originalRole: string,
  ) => {
    setRoleChanges((prev) => {
      const next = new Map(prev);
      if (newRole === originalRole) next.delete(id);
      else next.set(id, newRole);
      return next;
    });
  };

  const handleDiscard = () => {
    setStagedAdditions([]);
    setMarkedForDelete(new Set());
    setRoleChanges(new Map());
  };

  // ── Save ─────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!accessToken || !hasPendingChanges) return;
    setSaving(true);
    const errors: string[] = [];

    // 1. Delete marked entries
    for (const id of markedForDelete) {
      try {
        await rolesApi.revokeRole(id, scopeType, scopeId, accessToken);
      } catch (e) {
        errors.push(
          `Remove failed: ${e instanceof Error ? e.message : "unknown"}`,
        );
      }
    }

    // 2. Role updates (delete old + assign new)
    for (const [id, newRole] of roleChanges) {
      const entry = entries.find((e) => e.id === id);
      if (!entry || markedForDelete.has(id)) continue;
      try {
        await rolesApi.revokeRole(id, scopeType, scopeId, accessToken);
        await rolesApi.assignRole(
          { userId: entry.userId, role: newRole, ...buildScopeIds() },
          accessToken,
        );
      } catch (e) {
        errors.push(
          `Update failed: ${e instanceof Error ? e.message : "unknown"}`,
        );
      }
    }

    // 3. Staged additions
    for (const addition of stagedAdditions) {
      try {
        await rolesApi.assignRole(
          { userId: addition.user.id, role: addition.role, ...buildScopeIds() },
          accessToken,
        );
      } catch (e) {
        errors.push(
          `Assign failed for ${addition.user.email}: ${e instanceof Error ? e.message : "unknown"}`,
        );
      }
    }

    setSaving(false);

    if (errors.length > 0) {
      toast.error(`Some changes failed:\n${errors.join("\n")}`);
    } else {
      toast.success("Access changes saved successfully");
      setStagedAdditions([]);
      setMarkedForDelete(new Set());
      setRoleChanges(new Map());
      await loadEntries();
    }
  };

  // ── Scope label ──────────────────────────────────────────────────────────

  const scopeTypeLabel: Record<ScopeType, string> = {
    TENANT: "Tenant",
    BRANCH: "Branch",
    SERVICE: "Service",
    QUEUE: "Queue",
  };

  // ── Rendering ─────────────────────────────────────────────────────────────

  return (
    <>
      <Navbar />
      <main className="py-10 sm:py-16 lg:py-20">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mx-auto max-w-4xl"
          >
            {/* Back link */}
            <button
              type="button"
              onClick={() => router.push(backHref)}
              className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </button>

            {/* Page heading */}
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Users className="h-7 w-7" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Manage Access
                </h1>
                <p className="mt-0.5 text-sm text-slate-500">
                  {contextLoading ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Loading…
                    </span>
                  ) : (
                    <>
                      {scopeTypeLabel[scopeType]}
                      {scopeName ? ` · ${scopeName}` : ""}
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* ── Add user card ────────────────────────────────────────── */}
            <Card className="mb-6 rounded-2xl border-slate-200/80 shadow-sm">
              <div className="h-1 w-full overflow-hidden rounded-t-2xl bg-primary" />
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <UserPlus
                    className="h-4 w-4 text-primary"
                    aria-hidden="true"
                  />
                  Add User
                </CardTitle>
                <CardDescription className="text-xs">
                  Search for a user by email and assign them a role for this{" "}
                  {scopeTypeLabel[scopeType].toLowerCase()}.
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  {/* User search */}
                  <div ref={searchRef} className="relative flex-1">
                    <label
                      htmlFor="user-search"
                      className="mb-1 block text-xs font-medium text-slate-700"
                    >
                      Search user by email
                    </label>
                    <div className="relative">
                      <input
                        id="user-search"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          if (selectedUser) setSelectedUser(null);
                        }}
                        placeholder="Type email to search…"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-8 text-sm placeholder-slate-400 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        autoComplete="off"
                      />
                      {searchLoading && (
                        <Loader2 className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
                      )}
                      {!searchLoading && selectedUser && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUser(null);
                            setSearchQuery("");
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          aria-label="Clear selected user"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {/* Search results dropdown */}
                    {showDropdown && searchResults.length > 0 && (
                      <ul className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-md">
                        {searchResults.map((u) => (
                          <li key={u.id}>
                            <button
                              type="button"
                              className="flex w-full flex-col px-3 py-2.5 text-left text-sm hover:bg-slate-50"
                              onClick={() => handleSelectUser(u)}
                            >
                              <span className="font-medium text-slate-800">
                                {u.name}
                              </span>
                              <span className="text-xs text-slate-500">
                                {u.email}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Role select */}
                  <div className="sm:w-52">
                    <label
                      htmlFor="role-select"
                      className="mb-1 block text-xs font-medium text-slate-700"
                    >
                      Role
                    </label>
                    <div className="relative">
                      <select
                        id="role-select"
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 pr-8 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        {availableRoles.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  {/* Add button */}
                  <Button
                    onClick={handleStageAddition}
                    disabled={!selectedUser}
                    className="sm:mb-0"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* ── Assignments table ────────────────────────────────────── */}
            <Card className="mb-6 overflow-hidden rounded-2xl border-slate-200/80 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Current Access</CardTitle>
                  {hasPendingChanges && (
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                      {stagedAdditions.length +
                        markedForDelete.size +
                        roleChanges.size}{" "}
                      pending change
                      {stagedAdditions.length +
                        markedForDelete.size +
                        roleChanges.size !==
                      1
                        ? "s"
                        : ""}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-7 w-7 animate-spin text-primary" />
                  </div>
                ) : entries.length === 0 && stagedAdditions.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                      <Users className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-slate-600">
                      No users assigned yet
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Use the form above to add the first user.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                          >
                            User
                          </th>
                          <th
                            scope="col"
                            className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                          >
                            Privilege
                          </th>
                          <th
                            scope="col"
                            className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                          >
                            Status
                          </th>
                          <th
                            scope="col"
                            className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500"
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {/* Staged additions (pending, not yet saved) */}
                        {stagedAdditions.map((addition) => (
                          <tr
                            key={addition.localId}
                            className="bg-emerald-50/60"
                          >
                            <td className="px-5 py-3.5">
                              <div>
                                <p className="text-sm font-medium text-slate-800">
                                  {addition.user.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {addition.user.email}
                                </p>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBadge(addition.role)}`}
                              >
                                {roleLabel(addition.role)}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                New · Pending
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveStagedAddition(addition.localId)
                                }
                                className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                                aria-label="Remove staged addition"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}

                        {/* Existing entries */}
                        {entries.map((entry) => {
                          const isDeleted = markedForDelete.has(entry.id);
                          const pendingRole = roleChanges.get(entry.id);
                          const displayRole = pendingRole ?? entry.role;
                          return (
                            <tr
                              key={entry.id}
                              className={
                                isDeleted
                                  ? "bg-red-50/60 opacity-60"
                                  : pendingRole
                                    ? "bg-amber-50/40"
                                    : ""
                              }
                            >
                              <td className="px-5 py-3.5">
                                <div>
                                  <p
                                    className={`text-sm font-medium ${isDeleted ? "line-through text-slate-400" : "text-slate-800"}`}
                                  >
                                    {entry.userName ?? "Unknown"}
                                  </p>
                                  <p
                                    className={`text-xs ${isDeleted ? "line-through text-slate-400" : "text-slate-500"}`}
                                  >
                                    {entry.userEmail ?? entry.userId}
                                  </p>
                                </div>
                              </td>
                              <td className="px-5 py-3.5">
                                {isDeleted ? (
                                  <span
                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium line-through ${roleBadge(entry.role)}`}
                                  >
                                    {roleLabel(entry.role)}
                                  </span>
                                ) : availableRoles.length > 1 ? (
                                  // Editable role dropdown when multiple roles available
                                  <div className="relative w-44">
                                    <select
                                      value={displayRole}
                                      onChange={(e) =>
                                        handleRoleChange(
                                          entry.id,
                                          e.target.value,
                                          entry.role,
                                        )
                                      }
                                      className="w-full appearance-none rounded-md border border-slate-200 bg-white py-1 pl-2 pr-7 text-xs shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                    >
                                      {availableRoles.map((r) => (
                                        <option key={r.value} value={r.value}>
                                          {r.label}
                                        </option>
                                      ))}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                                  </div>
                                ) : (
                                  <span
                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBadge(displayRole)}`}
                                  >
                                    {roleLabel(displayRole)}
                                    {pendingRole && (
                                      <span className="ml-1 text-amber-600">
                                        *
                                      </span>
                                    )}
                                  </span>
                                )}
                              </td>
                              <td className="px-5 py-3.5">
                                {isDeleted ? (
                                  <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                                    Removing
                                  </span>
                                ) : pendingRole ? (
                                  <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                                    Modified
                                  </span>
                                ) : (
                                  <span
                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                      entry.status === "ACTIVE"
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-slate-100 text-slate-500"
                                    }`}
                                  >
                                    {entry.status}
                                  </span>
                                )}
                              </td>
                              <td className="px-5 py-3.5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {isDeleted ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleUnmarkDelete(entry.id)
                                      }
                                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                                      aria-label="Undo remove"
                                    >
                                      <RotateCcw className="h-3.5 w-3.5" />
                                    </button>
                                  ) : (
                                    <>
                                      {pendingRole && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleRoleChange(
                                              entry.id,
                                              entry.role,
                                              entry.role,
                                            )
                                          }
                                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50"
                                          aria-label="Undo role change"
                                        >
                                          <RotateCcw className="h-3.5 w-3.5" />
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleMarkDelete(entry.id)
                                        }
                                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                                        aria-label="Remove user access"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ── Action bar ──────────────────────────────────────────── */}
            <div className="flex items-center justify-end gap-3">
              {hasPendingChanges && (
                <Button
                  variant="outline"
                  onClick={handleDiscard}
                  disabled={saving}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  Discard Changes
                </Button>
              )}
              <Button
                onClick={handleSave}
                disabled={!hasPendingChanges || saving}
                className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {saving ? (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Save className="h-4 w-4" aria-hidden="true" />
                )}
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </motion.div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
