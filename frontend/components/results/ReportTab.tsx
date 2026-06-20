"use client"

import { motion } from "framer-motion"
import { Download, Bot, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { PipelineResult } from "@/types"
import { fmt } from "@/lib/utils"

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain" })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement("a")
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function buildReportText(result: PipelineResult): string {
  const { task, analysis, supervised_results, best_model, clustering_results, agent_report } = result

  const lines: string[] = [
    "=========================================",
    "  AGENTIC AI DATA SCIENTIST — FULL REPORT",
    "=========================================",
    "",
    "DATASET OVERVIEW",
    "----------------",
    `Rows          : ${analysis.num_rows}`,
    `Features      : ${analysis.num_cols}`,
    `Target Column : ${analysis.target_column}`,
    `Task Type     : ${task.toUpperCase()}`,
    `Dataset Size  : ${analysis.size}`,
    `Missing Ratio : ${(analysis.missing_ratio * 100).toFixed(1)}%`,
    "",
    "MODEL RESULTS",
    "-------------",
  ]

  if (supervised_results) {
    Object.entries(supervised_results).forEach(([name, metrics]) => {
      const isBest = name === best_model
      const m = metrics as any
      lines.push(`${isBest ? "★ " : "  "}${name}`)
      lines.push(`    Mean F1 : ${fmt(m.mean)}`)
      lines.push(`    Std Dev : ${fmt(m.std)}`)
    })
  }

  lines.push("")
  lines.push(`BEST MODEL: ${best_model}`)
  lines.push("")
  lines.push("CLUSTERING RESULTS")
  lines.push("------------------")
  lines.push(`K-Means      Silhouette: ${fmt(clustering_results.kmeans.silhouette_score)}`)
  lines.push(`Hierarchical Silhouette: ${fmt(clustering_results.hierarchical.silhouette_score)}`)
  lines.push(`Best Clustering Method : ${clustering_results.best}`)
  lines.push("")
  lines.push("AI AGENT REPORT")
  lines.push("---------------")
  lines.push(agent_report)
  lines.push("")
  lines.push("=========================================")

  return lines.join("\n")
}

// Renders inline markdown: **bold** and `code`
function InlineText({ text }: { text: string }) {
  // Split on **...** and `...` tokens
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**"))
          return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>
        if (part.startsWith("`") && part.endsWith("`"))
          return <code key={i} className="rounded bg-slate-700 px-1 py-0.5 text-xs text-amber-300">{part.slice(1, -1)}</code>
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

// Detects whether a line is part of a markdown table
function isTableRow(line: string) {
  return line.trim().startsWith("|") && line.trim().endsWith("|")
}
function isSeparatorRow(line: string) {
  return /^\|[\s|:-]+\|$/.test(line.trim())
}

function RenderReport({ text }: { text: string }) {
  const rawLines = text.split("\n")

  // Group consecutive table lines into blocks
  type Block =
    | { type: "table"; rows: string[][] }
    | { type: "line"; content: string }

  const blocks: Block[] = []
  let i = 0
  while (i < rawLines.length) {
    const line = rawLines[i]
    if (isTableRow(line)) {
      const tableLines: string[] = []
      while (i < rawLines.length && isTableRow(rawLines[i])) {
        tableLines.push(rawLines[i])
        i++
      }
      // Parse: split by | and trim
      const rows = tableLines
        .filter(l => !isSeparatorRow(l))
        .map(l => l.trim().slice(1, -1).split("|").map(c => c.trim()))
      blocks.push({ type: "table", rows })
    } else {
      blocks.push({ type: "line", content: line })
      i++
    }
  }

  return (
    <div className="space-y-1 text-sm leading-relaxed text-slate-300">
      {blocks.map((block, bi) => {
        if (block.type === "table") {
          const [header, ...body] = block.rows
          return (
            <div key={bi} className="my-3 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-600">
                    {header?.map((cell, ci) => (
                      <th key={ci} className="py-1.5 pr-4 text-left font-semibold text-violet-300">
                        {cell}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {body.map((row, ri) => (
                    <tr key={ri} className="border-b border-slate-700/50">
                      {row.map((cell, ci) => (
                        <td key={ci} className="py-1.5 pr-4 text-slate-300">
                          <InlineText text={cell} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }

        const line = block.content
        if (line.startsWith("## "))
          return <p key={bi} className="mt-5 text-base font-bold text-violet-300"><InlineText text={line.slice(3)} /></p>
        if (line.startsWith("# "))
          return <p key={bi} className="mt-2 text-lg font-bold text-white"><InlineText text={line.slice(2)} /></p>
        if (line.startsWith("- ") || line.startsWith("* "))
          return (
            <p key={bi} className="pl-4 before:mr-2 before:text-violet-400 before:content-['•']">
              <InlineText text={line.slice(2)} />
            </p>
          )
        if (line.match(/^\d+\. /))
          return <p key={bi} className="pl-4 text-slate-200"><InlineText text={line} /></p>
        if (line.trim() === "---")
          return <hr key={bi} className="my-3 border-slate-700" />
        if (line.trim() === "")
          return <div key={bi} className="h-2" />
        if (line.startsWith("*") && line.endsWith("*"))
          return <p key={bi} className="text-xs italic text-slate-500"><InlineText text={line.slice(1, -1)} /></p>
        return <p key={bi}><InlineText text={line} /></p>
      })}
    </div>
  )
}

export function ReportTab({ result }: { result: PipelineResult }) {
  const { agent_report, best_model, task, analysis } = result
  const isError = agent_report.startsWith("[Agent report unavailable")

  function handleDownload() {
    const text = buildReportText(result)
    downloadText(`ai-report-${analysis.target_column}-${task}.txt`, text)
  }

  return (
    <div className="space-y-5">
      {/* Header row */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-violet-500/20 p-2.5">
            <Bot className="h-5 w-5 text-violet-300" />
          </div>
          <div>
            <h3 className="font-semibold text-white">AI Analysis Report</h3>
            <p className="text-xs text-slate-400">
              AI-generated analysis · Best model: <span className="text-violet-300">{best_model}</span>
            </p>
          </div>
        </div>
        <Button
          onClick={handleDownload}
          variant="outline"
          className="gap-2 border-slate-600 bg-slate-800 text-slate-300 hover:border-violet-500 hover:text-white"
        >
          <Download className="h-4 w-4" />
          Download Report
        </Button>
      </motion.div>

      {/* Key numbers strip */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex flex-wrap gap-2"
      >
        <Badge className="border-slate-600 bg-slate-700 text-slate-300">
          Task: {task}
        </Badge>
        <Badge className="border-slate-600 bg-slate-700 text-slate-300">
          {analysis.num_rows} rows · {analysis.num_cols} features
        </Badge>
        <Badge className="border-violet-500/30 bg-violet-500/20 text-violet-300">
          Best: {best_model}
        </Badge>
      </motion.div>

      {/* Agent report card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-slate-700 bg-slate-800/60">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <FileText className="h-4 w-4 text-violet-400" />
              Full Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isError ? (
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-300">
                <p className="font-semibold">Gemini API quota exceeded</p>
                <p className="mt-1 text-xs text-amber-400/80">
                  The ML pipeline ran successfully. The AI narrative report will be available after the free-tier daily
                  quota resets (midnight UTC). You can still download the full metrics report below.
                </p>
              </div>
            ) : (
              <RenderReport text={agent_report} />
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Download full metrics regardless */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="border-slate-700 bg-slate-800/60">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-white">Full Metrics Report</p>
              <p className="text-xs text-slate-400">All model scores, clustering results & analysis</p>
            </div>
            <Button
              onClick={handleDownload}
              className="gap-2 bg-violet-600 hover:bg-violet-500"
            >
              <Download className="h-4 w-4" />
              Download .txt
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
