import React, { useState } from "react";
import { BarChart3, Download, TrendingUp, AlertTriangle, CheckCircle2, Clock, FileText, Building2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";

const ku: React.CSSProperties = { fontFamily: "'Noto Kufi Arabic', sans-serif" };
const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316"];

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number | string; icon: any; color: string }) {
  return (
    <div className={`bg-card border rounded-xl p-5 flex items-center gap-4`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export default function Reports() {
  const { user } = useAuth();

  const { data: docStats } = useQuery<any>({
    queryKey: ["reports", "documents"],
    queryFn: () => apiFetch("/reports/documents"),
  });

  const { data: deptStats = [] } = useQuery<any[]>({
    queryKey: ["reports", "departments"],
    queryFn: () => apiFetch("/reports/departments"),
  });

  const { data: overdueList = [] } = useQuery<any[]>({
    queryKey: ["reports", "overdue"],
    queryFn: () => apiFetch("/reports/overdue"),
  });

  const stepData = docStats?.by_step
    ? Object.entries(docStats.by_step).map(([step, count]) => ({
        step: {
          draft: "پێشنووس", sent: "نێردراو", received: "وەرگیراو",
          review: "پێداچوونەوە", assigned: "سپاردراو",
          completed: "تەواوبوو", rejected: "ڕەتکراوە",
        }[step] ?? step,
        count,
      }))
    : [];

  const deptChartData = deptStats
    .filter(d => d.total_docs > 0)
    .slice(0, 10)
    .map(d => ({ name: d.dept_name?.substring(0, 8) ?? "?", total: d.total_docs, done: d.completed, pending: d.pending }));

  return (
    <div className="space-y-6" style={ku} dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-indigo-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold">ڕاپۆرتەکان</h1>
            <p className="text-sm text-muted-foreground">ئامارەکانی سیستەم</p>
          </div>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => window.open("/api/reports/export", "_blank")}>
          <Download className="h-4 w-4" />داگرتنی CSV
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="کۆی نوسراو" value={docStats?.total ?? 0} icon={FileText} color="bg-blue-500/10 text-blue-600" />
        <StatCard label="تەواوبووەکان" value={docStats?.completed ?? 0} icon={CheckCircle2} color="bg-emerald-500/10 text-emerald-600" />
        <StatCard label="چاوەڕوانەکان" value={docStats?.pending ?? 0} icon={Clock} color="bg-amber-500/10 text-amber-600" />
        <StatCard label="دواخراوەکان" value={overdueList.length} icon={AlertTriangle} color="bg-rose-500/10 text-rose-600" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* By workflow step */}
        <div className="bg-card border rounded-xl p-5">
          <h2 className="font-semibold mb-4">نوسراو بەپێی مەرحەلە</h2>
          {stepData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={stepData} dataKey="count" nameKey="step" cx="50%" cy="50%" outerRadius={80} label={({ step, count }) => `${step}: ${count}`}>
                  {stepData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">داتا نییە</div>
          )}
        </div>

        {/* By department */}
        <div className="bg-card border rounded-xl p-5">
          <h2 className="font-semibold mb-4">نوسراو بەپێی هۆبە (تاپ ١٠)</h2>
          {deptChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={deptChartData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={70} />
                <Tooltip />
                <Bar dataKey="done" name="تەواوبوو" fill="#10b981" stackId="a" />
                <Bar dataKey="pending" name="چاوەڕوان" fill="#6366f1" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">داتا نییە</div>
          )}
        </div>
      </div>

      {/* Overdue list */}
      {overdueList.length > 0 && (
        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b bg-rose-500/5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-500" />
              <h2 className="font-semibold text-rose-700 dark:text-rose-400">نوسراوی دواخراو ({overdueList.length})</h2>
            </div>
          </div>
          <div className="divide-y max-h-64 overflow-y-auto">
            {overdueList.map((d: any) => (
              <div key={d.deadline_id} className="flex items-center gap-3 px-5 py-3 text-sm">
                <FileText className="h-4 w-4 text-rose-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-mono text-xs text-muted-foreground">{d.document_number}</span>
                  <p className="truncate">{d.subject}</p>
                </div>
                <span className="text-rose-600 text-xs font-medium shrink-0">ئەنجامدان: {d.due_date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Department table */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold">ئامارەکان بەپێی هۆبە</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr>
                <th className="px-5 py-3 text-right font-medium">هۆبە</th>
                <th className="px-5 py-3 text-right font-medium">کۆی نوسراو</th>
                <th className="px-5 py-3 text-right font-medium">تەواوبوو</th>
                <th className="px-5 py-3 text-right font-medium">چاوەڕوان</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {deptStats.map((d: any) => (
                <tr key={d.dept_id} className="hover:bg-muted/20">
                  <td className="px-5 py-3">{d.dept_name}</td>
                  <td className="px-5 py-3 font-mono">{d.total_docs}</td>
                  <td className="px-5 py-3 font-mono text-emerald-600">{d.completed}</td>
                  <td className="px-5 py-3 font-mono text-amber-600">{d.pending}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
