// lib/api.ts — Backend API client

import type { PipelineResult } from "@/types"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

export async function analyzeDataset(
  file: File,
  targetCol?: string
): Promise<PipelineResult> {
  const form = new FormData()
  form.append("file", file)
  if (targetCol?.trim()) form.append("target_col", targetCol.trim())

  const res = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    body: form,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? "Backend error")
  }

  return res.json() as Promise<PipelineResult>
}
