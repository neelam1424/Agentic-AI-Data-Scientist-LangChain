"use client"

import { motion } from "framer-motion"
import { Trophy, Database, Layers, Target, BarChart3, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { PipelineResult, ClassificationMetrics } from "@/types"
import { fmt, pct } from "@/lib/utils"

function StatCard({
  icon: Icon, label, value, sub, delay,
}: {
  icon: React.ElementType; label: string; value: string; sub?: string; delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="border-slate-700 bg-slate-800/60">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="rounded-lg bg-slate-700 p-2.5">
            <Icon className="h-5 w-5 text-violet-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-400">{label}</p>
            <p className="break-all text-lg font-bold leading-tight text-white">{value}</p>
            {sub && <p className="text-xs text-slate-500">{sub}</p>}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function OverviewTab({ result }: { result: PipelineResult }) {
  const { analysis, best_model, supervised_results, clustering_results } = result

  const bestMetrics  = supervised_results?.[best_model] as ClassificationMetrics
  const primaryScore = `F1 ${fmt(bestMetrics?.mean ?? 0)}`

  return (
    <div className="space-y-6">
      {/* Hero — best model */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 via-slate-800/60 to-slate-900 p-6"
      >
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-violet-600/10 blur-2xl" />
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-violet-500/20 p-3">
            <Trophy className="h-7 w-7 text-violet-300" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-violet-400">
              Best Model
            </p>
            <h2 className="mt-1 text-2xl font-bold text-white">{best_model}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">classification</Badge>
              <Badge className="border-emerald-500/30 bg-emerald-500/20 text-emerald-300">
                {primaryScore}
              </Badge>
              <Badge className="border-slate-600 bg-slate-700 text-slate-300">
                {analysis.size} dataset
              </Badge>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Dataset stat cards */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">                                  
      <StatCard icon={Database}      label="Rows"     value={analysis.num_rows.toLocaleString()}  delay={0.05} />                                                                    
      <StatCard icon={Layers}        label="Features" value={analysis.num_cols.toString()}         delay={0.1} />                                                                    
      <div className="sm:col-span-2">                                                        
       <StatCard icon={Target}      label="Target"   value={analysis.target_column} sub=       
         {`${analysis.target_unique_values} unique values`} delay={0.15} />                          
      </div>                                                                                 
      <StatCard icon={AlertTriangle} label="Missing"  value={pct(analysis.missing_ratio)} sub={`${analysis.missing_values} cells`} delay={0.2} />                                    
      </div>  

      {/* Column breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card className="border-slate-700 bg-slate-800/60">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <BarChart3 className="h-4 w-4 text-violet-400" />
              Column Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Numeric bar */}
            <div>
              <div className="mb-1 flex justify-between text-xs text-slate-400">
                <span>Numeric columns</span>
                <span>{analysis.num_numeric} / {analysis.num_cols}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: pct(analysis.numeric_ratio) }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full bg-violet-500"
                />
              </div>
            </div>
            {/* Categorical bar */}
            {analysis.num_categorical > 0 && (
              <div>
                <div className="mb-1 flex justify-between text-xs text-slate-400">
                  <span>Categorical columns</span>
                  <span>{analysis.num_categorical} / {analysis.num_cols}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: pct(analysis.num_categorical / analysis.num_cols) }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                    className="h-full rounded-full bg-amber-500"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Clustering summary */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-slate-700 bg-slate-800/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-300">
              Clustering Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            {[
              { label: "K-Means", score: clustering_results.kmeans.silhouette_score },
              { label: "Hierarchical", score: clustering_results.hierarchical.silhouette_score },
            ].map(({ label, score }) => (
              <div key={label} className="rounded-lg bg-slate-700/50 p-3">
                <p className="text-xs text-slate-400">{label}</p>
                <p className="text-xl font-bold text-white">{fmt(score)}</p>
                <p className="text-xs text-slate-500">silhouette</p>
                {clustering_results.best === label && (
                  <Badge className="mt-1 border-emerald-500/30 bg-emerald-500/20 text-xs text-emerald-300">
                    Best
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
