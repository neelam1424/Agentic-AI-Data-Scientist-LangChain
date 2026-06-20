"use client"

import { motion } from "framer-motion"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { PipelineResult, ClassificationMetrics } from "@/types"
import { fmt } from "@/lib/utils"

const PALETTE = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899"]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 p-3 text-xs shadow-xl">
      <p className="mb-1 font-semibold text-white">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.fill }}>
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  )
}

export function ComparisonTab({ result }: { result: PipelineResult }) {
  const { supervised_results, best_model, clustering_results } = result

  const rows = Object.keys(supervised_results)
    .map((name, i) => {
      const m = supervised_results[name] as ClassificationMetrics
      return { name, f1: m.mean, std: m.std, color: PALETTE[i % PALETTE.length] }
    })
    .sort((a, b) => b.f1 - a.f1)

  const clusterRows = [
    { name: "K-Means",      score: clustering_results.kmeans.silhouette_score },
    { name: "Hierarchical", score: clustering_results.hierarchical.silhouette_score },
  ].sort((a, b) => b.score - a.score)

  return (
    <div className="space-y-6">

      {/* ── Comparison Table ─────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-slate-700 bg-slate-800/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-300">
              Classification — Model Comparison Table
            </CardTitle>
            <p className="text-xs text-slate-500">5-Fold Cross-Validation · F1-Macro</p>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="pb-2 pr-4">Model</th>
                  <th className="pb-2 pr-4">Mean F1</th>
                  <th className="pb-2 pr-4">Std Dev</th>
                  <th className="pb-2">Stability</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((m, i) => (
                  <motion.tr
                    key={m.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className={`border-b border-slate-700/50 ${m.name === best_model ? "bg-violet-500/10" : ""}`}
                  >
                    <td className="py-2.5 pr-4 font-medium text-white">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ background: m.color }}
                        />
                        {m.name}
                        {m.name === best_model && (
                          <Badge className="border-violet-500/30 bg-violet-500/20 text-xs text-violet-300">
                            Best
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 pr-4 text-emerald-400">{fmt(m.f1)}</td>
                    <td className="py-2.5 pr-4 text-slate-400">{fmt(m.std)}</td>
                    <td className="py-2.5 text-cyan-400">{fmt(m.f1 - 0.5 * m.std)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── F1 Bar Chart ─────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="border-slate-700 bg-slate-800/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-300">F1-Macro Score per Model</CardTitle>
            <p className="text-xs text-slate-500">Higher is better · Best model highlighted in purple</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={rows} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis domain={[0, 1]} tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={(v) => v.toFixed(2)} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="f1" name="F1 Score" radius={[4, 4, 0, 0]}>
                  {rows.map((d, i) => (
                    <Cell key={i} fill={d.name === best_model ? "#8b5cf6" : "#334155"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Clustering Bar Chart ─────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-slate-700 bg-slate-800/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-300">
              Clustering — Silhouette Score
            </CardTitle>
            <p className="text-xs text-slate-500">
              Measures cluster separation · &gt;0.5 good · 0.25–0.5 moderate · &lt;0.25 poor
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={clusterRows} barCategoryGap="40%">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis domain={[0, 1]} tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={(v) => v.toFixed(2)} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="score" name="Silhouette" radius={[4, 4, 0, 0]}>
                  {clusterRows.map((d, i) => (
                    <Cell key={i} fill={d.name === clustering_results.best ? "#10b981" : "#334155"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

    </div>
  )
}
