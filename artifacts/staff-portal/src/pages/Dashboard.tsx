import React from "react";
import {
  useGetDashboardSummary, getGetDashboardSummaryQueryKey,
  useGetDepartmentBreakdown, getGetDepartmentBreakdownQueryKey,
  useGetRoleBreakdown, getGetRoleBreakdownQueryKey,
  useGetRecentStaff, getGetRecentStaffQueryKey,
} from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Users, Building2, Shield, ArrowLeft, CalendarDays, Activity, FileText, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from "recharts";
import { Link } from "wouter";
import { format } from "date-fns";
import { useAuth } from "@/lib/auth";

const ku: React.CSSProperties = { fontFamily: "'Noto Kufi Arabic', sans-serif" };

const CHART_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

function StatCard({
  label, sublabel, value, loading, icon: Icon, gradient, iconBg, iconColor,
}: {
  label: string; sublabel: string; value?: number | string; loading?: boolean;
  icon: any; gradient: string; iconBg: string; iconColor: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 group ${gradient}`}>
      {/* decorative ring */}
      <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full opacity-10 bg-white" />
      <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-10 bg-white" />

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-white/70 text-xs font-medium mb-1">{label}</p>
          <div className="text-3xl font-bold text-white mb-1">
            {loading ? <span className="opacity-40">—</span> : (value ?? "—")}
          </div>
          <p className="text-white/60 text-[11px]">{sublabel}</p>
        </div>
        <div className={`rounded-xl p-2.5 ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {[1,2,3,4].map(i => (
        <td key={i} className="px-5 py-3.5">
          <div className="h-4 bg-muted/60 rounded-full animate-pulse" style={{ width: `${60 + i*10}%`, marginRight: "auto" }} />
        </td>
      ))}
    </tr>
  );
}

function InitialAvatar({ name }: { name: string }) {
  const initials = name.trim().split(" ").slice(0, 2).map((w) => w[0]).join("");
  const palettes = [
    "from-blue-500 to-indigo-600",
    "from-emerald-500 to-teal-600",
    "from-violet-500 to-purple-600",
    "from-amber-500 to-orange-600",
    "from-rose-500 to-pink-600",
    "from-cyan-500 to-sky-600",
  ];
  const idx = name.charCodeAt(0) % palettes.length;
  return (
    <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br ${palettes[idx]} text-white text-xs font-bold shrink-0 shadow-sm`}>
      {initials || "?"}
    </span>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const today = new Date();

  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary({ query: { queryKey: getGetDashboardSummaryQueryKey() } });
  const { data: deptBreakdown, isLoading: loadingDept } = useGetDepartmentBreakdown({ query: { queryKey: getGetDepartmentBreakdownQueryKey() } });
  const { data: roleBreakdown, isLoading: loadingRole } = useGetRoleBreakdown({ query: { queryKey: getGetRoleBreakdownQueryKey() } });
  const { data: recentStaff, isLoading: loadingRecent } = useGetRecentStaff({ query: { queryKey: getGetRecentStaffQueryKey() } });
  const { data: docStats } = useQuery<any>({ queryKey: ["reports", "documents"], queryFn: () => apiFetch("/reports/documents") });
  const { data: overdueList = [] } = useQuery<any[]>({ queryKey: ["reports", "overdue"], queryFn: () => apiFetch("/reports/overdue") });

  return (
    <div className="space-y-6" data-testid="page-dashboard" style={ku}>

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-bl from-indigo-600 via-blue-600 to-blue-700 p-6 shadow-lg">
        {/* decorative blobs */}
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-white/5 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full bg-white/5 translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-indigo-500/20 -translate-y-1/2" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-blue-200" />
              <span className="text-blue-200 text-xs font-medium">سیستەمی ئی-ڕێکار</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
              بەخێربێیت،{" "}
              <span className="text-blue-200">{user?.full_name || user?.username}</span>
            </h1>
            <p className="text-blue-300 text-sm mt-1.5">داشبۆردی سەرەکی — دەرفەتی باشی هەیە!</p>
          </div>

          <div className="flex-shrink-0 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-right">
            <div className="flex items-center gap-2 text-blue-200 mb-1">
              <CalendarDays className="h-3.5 w-3.5" />
              <span className="text-[11px]">ئەمڕۆ</span>
            </div>
            <p className="text-white font-semibold text-sm">{format(today, "EEEE")}</p>
            <p className="text-blue-200 text-xs">{format(today, "d MMMM yyyy")}</p>
          </div>
        </div>
      </div>

      {/* ── Document KPI strip ── */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        {[
          { label: "کۆی نوسراو", value: docStats?.total ?? 0, icon: FileText, color: "text-blue-600", bg: "bg-blue-500/10" },
          { label: "تەواوبووەکان", value: docStats?.completed ?? 0, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-500/10" },
          { label: "چاوەڕوانەکان", value: docStats?.pending ?? 0, icon: Clock, color: "text-amber-600", bg: "bg-amber-500/10" },
          { label: "دواخراوەکان", value: overdueList.length, icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-500/10" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card border rounded-xl p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <div>
              <p className="text-xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Stat Cards (3 cards, no super-admin) ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="کۆی فەرمانبەران"
          sublabel="فەرمانبەری تۆمارکراو"
          value={summary?.total_staff}
          loading={loadingSummary}
          icon={Users}
          gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
          iconBg="bg-white/20"
          iconColor="text-white"
        />
        <StatCard
          label="هۆبەکان"
          sublabel="هۆبەی چالاک"
          value={summary?.total_departments}
          loading={loadingSummary}
          icon={Building2}
          gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
          iconBg="bg-white/20"
          iconColor="text-white"
        />
        <StatCard
          label="ڕۆڵەکان"
          sublabel="ئاستی دەسەڵات"
          value={summary?.total_roles}
          loading={loadingSummary}
          icon={Shield}
          gradient="bg-gradient-to-br from-violet-500 to-purple-600"
          iconBg="bg-white/20"
          iconColor="text-white"
        />
      </div>

      {/* ── Charts ── */}
      <div className="grid gap-5 md:grid-cols-2">

        {/* Department Bar Chart */}
        <div className="bg-card border border-border/60 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-3 flex items-center gap-3 border-b border-border/40">
            <div className="rounded-lg bg-indigo-500/10 p-1.5">
              <Building2 className="h-4 w-4 text-indigo-500" />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-foreground">فەرمانبەر بەپێی هۆبە</h2>
              <p className="text-[11px] text-muted-foreground">دابەشبوونی فەرمانبەران لە نێوان هۆبەکاندا</p>
            </div>
          </div>
          <div className="h-[260px] px-2 py-3">
            {loadingDept ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs">چاوەڕێ بکە...</span>
                </div>
              </div>
            ) : !deptBreakdown?.length ? (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">داتایەک نەدۆزرایەوە.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="department_name" tickLine={false} axisLine={false} fontSize={10}
                    tickMargin={8} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} allowDecimals={false}
                    tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <RechartsTooltip
                    cursor={{ fill: "hsl(var(--muted)/0.4)", radius: 6 }}
                    contentStyle={{ borderRadius: "10px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontFamily: "'Noto Kufi Arabic', sans-serif", fontSize: 13, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                    itemStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Bar dataKey="staff_count" radius={[8, 8, 0, 0]} maxBarSize={44}>
                    {deptBreakdown.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Role Pie Chart */}
        <div className="bg-card border border-border/60 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-3 flex items-center gap-3 border-b border-border/40">
            <div className="rounded-lg bg-violet-500/10 p-1.5">
              <Shield className="h-4 w-4 text-violet-500" />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-foreground">فەرمانبەر بەپێی ڕۆڵ</h2>
              <p className="text-[11px] text-muted-foreground">دابەشبوونی ڕۆڵەکان لە نێوان فەرمانبەراندا</p>
            </div>
          </div>
          <div className="h-[260px] py-3">
            {loadingRole ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <div className="w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs">چاوەڕێ بکە...</span>
                </div>
              </div>
            ) : !roleBreakdown?.length ? (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">داتایەک نەدۆزرایەوە.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={roleBreakdown} dataKey="staff_count" nameKey="role_name"
                    cx="50%" cy="45%" innerRadius={58} outerRadius={92} paddingAngle={4}>
                    {roleBreakdown.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend iconType="circle" iconSize={8}
                    wrapperStyle={{ fontFamily: "'Noto Kufi Arabic', sans-serif", fontSize: 12 }} />
                  <RechartsTooltip
                    contentStyle={{ borderRadius: "10px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontFamily: "'Noto Kufi Arabic', sans-serif", fontSize: 13, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ── Recent Staff Table ── */}
      <div className="bg-card border border-border/60 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-1.5">
              <Users className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-foreground">فەرمانبەرانی نوێ</h2>
              <p className="text-[11px] text-muted-foreground">کۆتا فەرمانبەرانی زیادکراو</p>
            </div>
          </div>
          <Link
            href="/staff"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-500/8 hover:bg-blue-500/15 px-3 py-1.5 rounded-lg transition-all duration-200"
          >
            بینینی هەمووی
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 text-muted-foreground text-xs border-b border-border/40">
                <th className="px-5 py-3 font-medium text-right">فەرمانبەر</th>
                <th className="px-5 py-3 font-medium text-right">ناوی بەکارهێنەر</th>
                <th className="px-5 py-3 font-medium text-right">هۆبە</th>
                <th className="px-5 py-3 font-medium text-right">بەرواری زیادکردن</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loadingRecent ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : !recentStaff?.length ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-muted-foreground text-sm">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-8 w-8 opacity-20" />
                      <span>هیچ فەرمانبەرێک نەدۆزرایەوە.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                recentStaff.map((staff, idx) => (
                  <tr
                    key={staff.id}
                    className="hover:bg-muted/20 transition-colors duration-150"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center gap-2.5 justify-end">
                        <div>
                          <div className="font-medium text-foreground text-sm">{staff.full_name}</div>
                          <div className="text-[11px] text-muted-foreground">{staff.email}</div>
                        </div>
                        <InitialAvatar name={staff.full_name} />
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground text-right text-xs">
                      <span className="font-mono bg-muted/50 px-2 py-0.5 rounded-md">@{staff.username}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                        {staff.department_name || "بێ هۆبە"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground text-right text-xs">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3 w-3 opacity-50" />
                        {format(new Date(staff.created_at), "MMM d, yyyy")}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
