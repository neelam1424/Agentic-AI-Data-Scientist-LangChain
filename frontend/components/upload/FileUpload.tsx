"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { motion, AnimatePresence } from "framer-motion"
import { UploadCloud, FileText, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  onFile: (file: File) => void
  file: File | null
  onClear: () => void
}

export function FileUpload({ onFile, file, onClear }: Props) {
  const [isDragOver, setIsDragOver] = useState(false)

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) onFile(accepted[0])
      setIsDragOver(false)
    },
    [onFile]
  )

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
    onDragEnter: () => setIsDragOver(true),
    onDragLeave: () => setIsDragOver(false),
  })

  return (
    <AnimatePresence mode="wait">
      {file ? (
        <motion.div
          key="file"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="flex items-center gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-4"
        >
          <FileText className="h-6 w-6 shrink-0 text-emerald-400" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{file.name}</p>
            <p className="text-xs text-slate-400">
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onClear() }}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      ) : (
        <motion.div
          key="dropzone"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
          <div
            {...getRootProps()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 transition-all duration-200",
              isDragOver
                ? "border-violet-400 bg-violet-500/10"
                : "border-slate-600 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800"
            )}
          >
          <input {...getInputProps()} />
          <motion.div
            animate={isDragOver ? { scale: 1.15 } : { scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className={cn(
              "rounded-full p-4",
              isDragOver ? "bg-violet-500/20 text-violet-300" : "bg-slate-700 text-slate-400"
            )}
          >
            <UploadCloud className="h-8 w-8" />
          </motion.div>
          <div className="text-center">
            <p className="font-medium text-slate-300">
              {isDragOver ? "Drop your CSV here" : "Drag & drop a CSV file"}
            </p>
            <p className="mt-1 text-sm text-slate-500">or click to browse</p>
          </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
