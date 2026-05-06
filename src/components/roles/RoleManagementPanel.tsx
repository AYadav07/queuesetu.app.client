"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Plus, Trash2, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  rolesApi,
  type RoleEntry,
  type ScopeType,
  type UserSearchResult,
} from "@/lib/api/roles";
import { toast } from "@/store/use-toast-store";

// ── Types ──────────────────────────────────────────────────────────────────

type RoleOption = {
  value: string;
  label: string;
};

type Props = {
  /** Scope context for this panel */
  scopeType: ScopeType;
  scopeId: string;
  /** Roles to show/assign in this panel */
  roles: RoleOption[];
  /** Scope IDs to pass when assigning (so BFF can do RBAC) */
  tenantId?: string;
  branchId?: string;
  serviceId?: string;
  queueId?: string;
  accessToken: string;
};

// ── Role label display ─────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  TENANT_ADMIN: "Tenant Admin",
  BRANCH_ADMIN: "Branch Admin",
  SERVICE_MANAGER: "Service Manager",
  STAFF: "Staff",
};

function roleBadgeClass(role: string) {
  switch (role) {
    case "TENANT_ADMIN":
      return "bg-purple-100 text-purple-700";
    case "BRANCH_ADMIN":
      return "bg-blue-100 text-blue-700";
    case "SERVICE_MANAGER":
      return "bg-teal-100 text-teal-700";
    case "STAFF":
      return "bg-green-100 text-green-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

// ── Add Role Modal ─────────────────────────────────────────────────────────

type AddRoleModalProps = {
  roles: RoleOption[];
  scopeType: ScopeType;
  scopeId: string;
  tenantId?: string;
  branchId?: string;
  serviceId?: string;
  queueId?: string;
  accessToken: string;
  onClose: () => void;
  onAdded: (entry: RoleEntry) => void;
};

function AddRoleModal({
  roles,
  scopeType,
  scopeId,
  tenantId,
  branchId,
  serviceId,
  queueId,
  accessToken,
  onClose,
  onAdded,
}: AddRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState(roles[0]?.value ?? "");
  const [emailInput, setEmailInput] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(
    null,
  );
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    if (emailInput.trim().length < 2) return;
    setSearching(true);
    try {
      const results = await rolesApi.searchUsers(
        emailInput.trim(),
        accessToken,
      );
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [emailInput, accessToken]);

  useEffect(() => {
    const timer = setTimeout(handleSearch, 400);
    return () => clearTimeout(timer);
  }, [handleSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      setError("Please select a user from the search results");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const entry = await rolesApi.assignRole(
        {
          userId: selectedUser.id,
          role: selectedRole,
          tenantId,
          branchId,
          serviceId,
          queueId,
        },
        accessToken,
      );
      toast.success(`Role assigned to ${selectedUser.email}`);
      onAdded(entry);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to assign role";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Assign Role</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {/* Role selector */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {roles.map((r) => (
                <option key={r.value} value={r.value}>
                  {ROLE_LABELS[r.value] ?? r.label}
                </option>
              ))}
            </select>
          </div>

          {/* User search */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              User (search by email)
            </label>
            <div className="relative">
              <input
                type="text"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  setSelectedUser(null);
                }}
                placeholder="Type email address..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              {searching && (
                <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-slate-400" />
              )}
            </div>

            {/* Search results */}
            {searchResults.length > 0 && !selectedUser && (
              <ul className="mt-1 max-h-40 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-sm">
                {searchResults.map((u) => (
                  <li key={u.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUser(u);
                        setEmailInput(u.email);
                        setSearchResults([]);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                    >
                      <span className="font-medium text-slate-800">
                        {u.name}
                      </span>
                      <span className="ml-2 text-slate-500">{u.email}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {selectedUser && (
              <div className="mt-1 flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2 text-sm">
                <span className="font-medium text-slate-800">
                  {selectedUser.name}
                </span>
                <span className="text-slate-500">{selectedUser.email}</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUser(null);
                    setEmailInput("");
                  }}
                  className="ml-auto text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !selectedUser}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Assign Role
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Panel ─────────────────────────────────────────────────────────────

export default function RoleManagementPanel({
  scopeType,
  scopeId,
  roles,
  tenantId,
  branchId,
  serviceId,
  queueId,
  accessToken,
}: Props) {
  const [entries, setEntries] = useState<RoleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const loadRoles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await rolesApi.listRoles(
        scopeType,
        scopeId,
        undefined,
        accessToken,
      );
      setEntries(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [scopeType, scopeId, accessToken]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const handleRevoke = async (entry: RoleEntry) => {
    if (
      !confirm(
        `Remove ${entry.userEmail ?? entry.userId} from ${ROLE_LABELS[entry.role] ?? entry.role}?`,
      )
    )
      return;
    setRevokingId(entry.id);
    try {
      await rolesApi.revokeRole(entry.id, scopeType, scopeId, accessToken);
      setEntries((prev) => prev.filter((e) => e.id !== entry.id));
      toast.success("Role removed");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to remove role";
      toast.error(msg);
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-800">
              Access & Roles
            </h3>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAddModal(true)}
            className="h-7 gap-1 px-2.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        </div>

        <div className="divide-y divide-slate-50">
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          ) : entries.length === 0 ? (
            <p className="px-5 py-4 text-sm text-slate-400">
              No role assignments yet.
            </p>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between gap-3 px-5 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {entry.userName ?? entry.userId}
                  </p>
                  {entry.userEmail && (
                    <p className="truncate text-xs text-slate-500">
                      {entry.userEmail}
                    </p>
                  )}
                </div>
                <span
                  className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${roleBadgeClass(entry.role)}`}
                >
                  {ROLE_LABELS[entry.role] ?? entry.role}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  disabled={revokingId === entry.id}
                  onClick={() => handleRevoke(entry)}
                >
                  {revokingId === entry.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-destructive" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  )}
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {showAddModal && (
        <AddRoleModal
          roles={roles}
          scopeType={scopeType}
          scopeId={scopeId}
          tenantId={tenantId}
          branchId={branchId}
          serviceId={serviceId}
          queueId={queueId}
          accessToken={accessToken}
          onClose={() => setShowAddModal(false)}
          onAdded={(entry) => setEntries((prev) => [...prev, entry])}
        />
      )}
    </>
  );
}
