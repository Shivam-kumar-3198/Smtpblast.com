"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Inbox,
  CalendarClock,
  TrendingUp,
  Trash2,
  Download,
  Search,
} from "lucide-react";
import {
  deleteLead,
  subscribeToLeads,
  updateLeadStatus,
  type LeadRecord,
  type LeadStatus,
} from "@/lib/leads";

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  closed: "Closed",
};

const STATUS_BADGE_CLASSES: Record<LeadStatus, string> = {
  new: "bg-accent-50 text-accent-600",
  contacted: "bg-blue-50 text-blue-600",
  closed: "bg-slate-100 text-slate-500",
};

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isWithinDays(date: Date, days: number) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return date >= cutoff;
}

function formatDateTime(date: Date | null) {
  if (!date) return "—";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function toCsv(leads: LeadRecord[]): string {
  const headers = [
    "Name",
    "Email",
    "Phone",
    "Company",
    "Plan interest",
    "Message",
    "Source",
    "Status",
    "Submitted",
  ];
  const rows = leads.map((lead) => [
    lead.name,
    lead.email ?? "",
    lead.phone ?? "",
    lead.company ?? "",
    lead.planInterest ?? "",
    lead.message ?? "",
    lead.source,
    lead.status,
    lead.createdAt ? lead.createdAt.toISOString() : "",
  ]);
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  return [headers, ...rows].map((row) => row.map(escape).join(",")).join("\n");
}

export default function AdminDashboardPage() {
  const [leads, setLeads] = useState<LeadRecord[] | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");

  useEffect(() => {
    const unsubscribe = subscribeToLeads(
      (data) => setLeads(data),
      () => setError("Couldn't load leads. Check your connection and try again.")
    );
    return () => unsubscribe();
  }, []);

  const stats = useMemo(() => {
    const list = leads ?? [];
    const now = new Date();
    return {
      total: list.length,
      new: list.filter((l) => l.status === "new").length,
      today: list.filter((l) => l.createdAt && isSameDay(l.createdAt, now)).length,
      thisWeek: list.filter((l) => l.createdAt && isWithinDays(l.createdAt, 7)).length,
    };
  }, [leads]);

  const filteredLeads = useMemo(() => {
    const list = leads ?? [];
    const term = search.trim().toLowerCase();
    return list.filter((lead) => {
      if (statusFilter !== "all" && lead.status !== statusFilter) return false;
      if (!term) return true;
      return (
        lead.name.toLowerCase().includes(term) ||
        (lead.email ?? "").toLowerCase().includes(term) ||
        (lead.phone ?? "").toLowerCase().includes(term) ||
        (lead.company ?? "").toLowerCase().includes(term)
      );
    });
  }, [leads, search, statusFilter]);

  function handleExport() {
    const csv = toCsv(filteredLeads);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `smtpblast-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleStatusChange(id: string, status: LeadStatus) {
    setLeads((prev) => prev?.map((l) => (l.id === id ? { ...l, status } : l)) ?? prev);
    try {
      await updateLeadStatus(id, status);
    } catch {
      setError("Couldn't update that lead's status. Try again.");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this lead? This can't be undone.")) return;
    setLeads((prev) => prev?.filter((l) => l.id !== id) ?? prev);
    try {
      await deleteLead(id);
    } catch {
      setError("Couldn't delete that lead. Try again.");
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-1">
        <h1 className="text-h4 font-semibold tracking-tight text-ink-950">Leads</h1>
        <p className="text-sm text-slate-500">
          Every submission from the site&apos;s lead forms and popup, in one place.
        </p>
      </div>

      {error && (
        <p
          className="mt-4 rounded-lg border border-danger-500/20 bg-danger-50 px-4 py-3 text-sm text-danger-600"
          role="alert"
        >
          {error}
        </p>
      )}

      {/* ================= Stat tiles ================= */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total leads", value: stats.total, icon: Users },
          { label: "New", value: stats.new, icon: Inbox },
          { label: "Today", value: stats.today, icon: CalendarClock },
          { label: "This week", value: stats.thisWeek, icon: TrendingUp },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex items-center justify-between gap-3 rounded-2xl bg-white p-5 ring-1 ring-slate-900/8 shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
          >
            <div>
              <div className="font-numeric text-2xl font-semibold text-ink-950">
                {leads === null ? "—" : value}
              </div>
              <div className="mt-1 text-xs font-medium text-slate-500">{label}</div>
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-50 text-accent-600">
              <Icon className="h-4 w-4" strokeWidth={1.75} />
            </span>
          </div>
        ))}
      </div>

      {/* ================= Filters ================= */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              strokeWidth={1.75}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, phone, company…"
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-ink-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10 sm:w-64"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as LeadStatus | "all")}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-ink-950 shadow-sm outline-none transition focus:border-accent-600 focus:ring-4 focus:ring-accent-600/10"
          >
            <option value="all">All statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleExport}
          disabled={filteredLeads.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-ink-800 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
          Export CSV
        </button>
      </div>

      {/* ================= Table ================= */}
      <div className="mt-4 overflow-hidden overflow-x-auto rounded-2xl bg-white ring-1 ring-slate-900/8 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
        <table className="w-full min-w-[880px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-surface-50">
              <th className="px-5 py-3 text-small font-medium text-slate-400">Contact</th>
              <th className="px-5 py-3 text-small font-medium text-slate-400">Source</th>
              <th className="px-5 py-3 text-small font-medium text-slate-400">Message</th>
              <th className="px-5 py-3 text-small font-medium text-slate-400">Submitted</th>
              <th className="px-5 py-3 text-small font-medium text-slate-400">Status</th>
              <th className="px-5 py-3 text-small font-medium text-slate-400">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {leads === null && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">
                  Loading leads…
                </td>
              </tr>
            )}
            {leads !== null && filteredLeads.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">
                  {leads.length === 0 ? "No leads yet." : "No leads match your filters."}
                </td>
              </tr>
            )}
            {filteredLeads.map((lead) => (
              <tr key={lead.id} className="border-b border-slate-100 align-top last:border-0">
                <td className="px-5 py-4">
                  <div className="text-sm font-medium text-ink-950">{lead.name}</div>
                  {lead.email && (
                    <a
                      href={`mailto:${lead.email}`}
                      className="mt-0.5 block text-sm text-accent-600 hover:underline"
                    >
                      {lead.email}
                    </a>
                  )}
                  {lead.phone && (
                    <a
                      href={`tel:${lead.phone}`}
                      className={`mt-0.5 block text-sm hover:underline ${
                        lead.email ? "text-slate-500" : "text-accent-600"
                      }`}
                    >
                      {lead.phone}
                    </a>
                  )}
                  {lead.company && (
                    <div className="mt-0.5 text-xs text-slate-400">{lead.company}</div>
                  )}
                </td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-1 text-small font-medium text-slate-500">
                    {lead.source}
                  </span>
                  {lead.planInterest && (
                    <div className="mt-1.5 text-xs text-slate-400">{lead.planInterest}</div>
                  )}
                </td>
                <td className="max-w-xs px-5 py-4 text-sm text-slate-600">
                  {lead.message || <span className="text-slate-300">—</span>}
                </td>
                <td className="px-5 py-4 text-sm text-slate-500">
                  {formatDateTime(lead.createdAt)}
                </td>
                <td className="px-5 py-4">
                  <select
                    value={lead.status}
                    onChange={(e) =>
                      handleStatusChange(lead.id, e.target.value as LeadStatus)
                    }
                    className={`rounded-full border-0 px-2.5 py-1 text-small font-medium outline-none focus:ring-2 focus:ring-accent-600/30 ${STATUS_BADGE_CLASSES[lead.status]}`}
                  >
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => handleDelete(lead.id)}
                    aria-label={`Delete lead from ${lead.name}`}
                    className="rounded-full p-2 text-slate-400 transition-colors hover:bg-danger-50 hover:text-danger-600"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
