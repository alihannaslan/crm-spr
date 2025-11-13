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

type RouteContext = {
  params: Promise<{ id: string }>
}

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

async function resolveId(context: RouteContext) {
  const { id } = await context.params
  return id
}

// GET /api/deals/[id]
export async function GET(_req: NextRequest, context: RouteContext) {
  const deals = await loadDeals()
  const dealId = await resolveId(context)
  const deal = deals.find((d) => d.id === dealId)

  if (!deal) {
    return NextResponse.json({ error: "Deal not found" }, { status: 404 })
  }

  return NextResponse.json(deal)
}

// PUT /api/deals/[id]
export async function PUT(req: NextRequest, context: RouteContext) {
  const deals = await loadDeals()
  const dealId = await resolveId(context)
  const index = deals.findIndex((d) => d.id === dealId)

  if (index === -1) {
    return NextResponse.json({ error: "Deal not found" }, { status: 404 })
  }

  const body = (await req.json()) as Partial<Deal>

  const updated: Deal = {
    ...deals[index],
    ...body,
    id: dealId,
    updatedAt: new Date().toISOString(),
  }

  deals[index] = updated
  await saveDeals(deals)

  return NextResponse.json(updated)
}

// DELETE /api/deals/[id]
export async function DELETE(_req: NextRequest, context: RouteContext) {
  const deals = await loadDeals()
  const dealId = await resolveId(context)
  const newDeals = deals.filter((d) => d.id !== dealId)

  if (newDeals.length === deals.length) {
    return NextResponse.json({ error: "Deal not found" }, { status: 404 })
  }

  await saveDeals(newDeals)
  return NextResponse.json({ ok: true })
}
