"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Loader2 } from "lucide-react"

const STEPS = [
  "Loading dataset",
  "Analyzing structure",
  "Detecting task type",
  "Recommending models",
  "Training & evaluating",
  "Generating AI report",
]

export function LoadingSteps() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((c) => (c < STEPS.length - 1 ? c + 1 : c))
    }, 1400)
    return () => clearInterval(id)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-lg space-y-6"
    >
      {/* Spinner headline */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="h-16 w-16 rounded-full bg-violet-500/20" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Loader2 className="h-8 w-8 text-violet-400" />
          </motion.div>
          {/* Pulsing ring */}
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 rounded-full border-2 border-violet-400"
          />
        </div>
        <p className="text-lg font-semibold text-white">Analyzing your dataset…</p>
        <p className="text-sm text-slate-400">The AI engine is running calculations</p>
      </div>

      {/* Steps list */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-5 space-y-3">
        {STEPS.map((step, i) => {
          const done = i < current
          const active = i === current

          return (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3"
            >
              <AnimatePresence mode="wait">
                {done ? (
                  <motion.div
                    key="done"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="shrink-0"
                  >
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  </motion.div>
                ) : active ? (
                  <motion.div
                    key="active"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="shrink-0"
                  >
                    <Loader2 className="h-5 w-5 text-violet-400" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="pending"
                    className="shrink-0 h-5 w-5 rounded-full border-2 border-slate-600"
                  />
                )}
              </AnimatePresence>
              <span
                className={
                  done
                    ? "text-sm text-slate-400 line-through"
                    : active
                    ? "text-sm font-medium text-violet-300"
                    : "text-sm text-slate-500"
                }
              >
                {step}
              </span>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
