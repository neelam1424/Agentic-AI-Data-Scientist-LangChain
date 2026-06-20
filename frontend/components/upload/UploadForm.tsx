"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FileUpload } from "./FileUpload"
import { analyzeDataset } from "@/lib/api"
import type { PipelineResult } from "@/types"
import { LoadingSteps } from "@/components/shared/LoadingSteps"

interface Props {
  onResult: (result: PipelineResult) => void
}

export function UploadForm({ onResult }: Props) {
  const [file, setFile]         = useState<File | null>(null)
  const [targetCol, setTarget]  = useState("")
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      const result = await analyzeDataset(file, targetCol || undefined)
      onResult(result)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSteps />

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg space-y-5"
    >
      <FileUpload
        file={file}
        onFile={setFile}
        onClear={() => setFile(null)}
      />

      <div className="space-y-1.5">
        <label className="text-xs font-medium uppercase tracking-wider text-slate-400">
          Target Column <span className="normal-case text-slate-500">(optional — defaults to last column)</span>
        </label>
        <input
          type="text"
          value={targetCol}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="e.g. price, species, diagnosis"
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none ring-0 focus:border-violet-500 transition-colors"
        />
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400 border border-red-500/20"
        >
          {error}
        </motion.p>
      )}

      <Button
        type="submit"
        disabled={!file || loading}
        className="w-full gap-2 bg-violet-600 py-6 text-base font-semibold hover:bg-violet-500 disabled:opacity-40 transition-all"
      >
        <Sparkles className="h-5 w-5" />
        Analyze Dataset
      </Button>
    </motion.form>
  )
}
