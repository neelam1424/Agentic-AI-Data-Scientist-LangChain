"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BrainCircuit, GitBranch } from "lucide-react"
import { UploadForm }        from "@/components/upload/UploadForm"
import { ResultsDashboard }  from "@/components/results/ResultsDashboard"
import type { PipelineResult } from "@/types"

export default function Home() {
  const [result, setResult] = useState<PipelineResult | null>(null)

  return (
    <div className="relative min-h-screen bg-[#07090f] overflow-x-hidden">
      {/* Background gradient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-violet-700/10 blur-3xl" />
        <div className="absolute -right-40 top-1/3 h-80 w-80 rounded-full bg-cyan-700/8 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-violet-900/10 blur-3xl" />
      </div>

      {/* Grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px),
                            linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-violet-600/20 p-1.5">
            <BrainCircuit className="h-5 w-5 text-violet-400" />
          </div>
          <span className="font-bold tracking-tight text-white">
            Agentic AI <span className="text-violet-400">Data Scientist</span>
          </span>
        </div>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg p-2 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <GitBranch className="h-5 w-5" />
        </a>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex min-h-[calc(100vh-65px)] flex-col items-center px-4 py-12">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex w-full max-w-lg flex-col items-center gap-8"
            >
              {/* Hero text */}
              <div className="text-center">
                {/* <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-300"
                > */}
                  {/* <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
                  Automated ML · KDD Pipeline */}
                {/* </motion.div> */}

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-4xl font-extrabold leading-tight tracking-tight text-white"
                >
                  Upload a dataset.
                  <br />
                  <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                    Get instant ML insights.
                  </span>
                </motion.h1>

                {/* <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-3 text-sm text-slate-400"
                >
                  Auto-detects classification or regression · Trains multiple models · Compares results · AI report
                </motion.p> */}
              </div>

              {/* Upload form */}
              <UploadForm onResult={setResult} />

              {/* Feature pills */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap justify-center gap-2"
              >
                {[
                  "Task auto-detection",
                  "5-Fold cross-validation",
                  "Model ranking",
                  "Clustering analysis",
                  "AI explanation",
                  "Downloadable report",
                ].map((f) => (
                  <span
                    key={f}
                    className="rounded-full border border-slate-700 bg-slate-800/50 px-3 py-1 text-xs text-slate-400"
                  >
                    {f}
                  </span>
                ))}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-5xl"
            >
              <ResultsDashboard result={result} onReset={() => setResult(null)} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
