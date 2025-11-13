import { NextRequest, NextResponse } from "next/server"
import { kv } from "@/lib/cloudflare-kv"

export const runtime: "edge" = "edge"

type Deal = {
  id: string
  title: string
  value: number
  contactId?: string
  status?: string
  createdAt: string
  updatedAt?: string
}

const KV_KEY = "deals"

async function loadDeals(): Promise<Deal[]> {
  const raw = await kv.get(KV_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw as string)
    return Array.isArray(parsed) ? (parsed as Deal[]) : []
  } catch {
    return []
  }
}

async function saveDeals(deals: Deal[]) {
  await kv.put(KV_KEY, JSON.stringify(deals))
}

// GET /api/deals
export async function GET() {
  const deals = await loadDeals()
  return NextResponse.json(deals)
}

// POST /api/deals
export async function POST(req: NextRequest) {
  const body = await req.json()

  const { title, value, contactId, status } = body as {
    title?: string
    value?: number
    contactId?: string
    status?: string
  }

  if (!title || typeof value !== "number") {
    return NextResponse.json(
      { error: "title (string) ve value (number) zorunludur" },
      { status: 400 },
    )
  }

  const deals = await loadDeals()
  const now = new Date().toISOString()

  const newDeal: Deal = {
    id: crypto.randomUUID(),
    title,
    value,
    contactId,
    status: status ?? "open",
    createdAt: now,
  }

  deals.push(newDeal)
  await saveDeals(deals)

  return NextResponse.json(newDeal, { status: 201 })
}
