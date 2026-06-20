"use client"

import { motion } from "framer-motion"
import { RotateCcw } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { OverviewTab }   from "./OverviewTab"
import { ComparisonTab } from "./ComparisonTab"
import { ReportTab }     from "./ReportTab"
import type { PipelineResult } from "@/types"

interface Props {
  result: PipelineResult
  onReset: () => void
}

export function ResultsDashboard({ result, onReset }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-5xl space-y-6"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Analysis Complete</h2>
          <p className="text-sm text-slate-400">
            Task detected:{" "}
            <span className="font-medium text-violet-300 capitalize">{result.task}</span>
            {" · "}
            {result.analysis.num_rows} rows · {result.analysis.num_cols} features
          </p>
        </div>
        <Button
          variant="outline"
          onClick={onReset}
          className="gap-2 border-slate-600 bg-slate-800 text-slate-300 hover:border-violet-500 hover:text-white"
        >
          <RotateCcw className="h-4 w-4" />
          New Analysis
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800 border border-slate-700">
          <TabsTrigger value="overview"   className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-slate-400">Overview</TabsTrigger>
          <TabsTrigger value="comparison" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-slate-400">Comparison</TabsTrigger>
          <TabsTrigger value="report"     className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-slate-400">AI Report</TabsTrigger>
        </TabsList>

        <TabsContent value="overview"   className="mt-5"><OverviewTab   result={result} /></TabsContent>
        <TabsContent value="comparison" className="mt-5"><ComparisonTab result={result} /></TabsContent>
        <TabsContent value="report"     className="mt-5"><ReportTab     result={result} /></TabsContent>
      </Tabs>
    </motion.div>
  )
}
