// app/api/deals/route.ts
// @ts-nocheck
import { NextRequest, NextResponse } from "next/server"
import { getDeals, createDeal } from "@/lib/cloudflare-kv"

export const runtime = "edge"

// GET /api/deals → tüm fırsatlar
export async function GET() {
  try {
    const deals = await getDeals()
    return NextResponse.json(deals)
  } catch (error) {
    console.error("GET /api/deals error:", error)
    return NextResponse.json(
      { error: "Deals could not be loaded" },
      { status: 500 },
    )
  }
}

// POST /api/deals → yeni fırsat oluştur
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const title = (body?.title ?? "").toString().trim()
    const valueRaw = body?.value
    const contactId = (body?.contactId ?? "").toString().trim()
    const stage = (body?.stage ?? "lead").toString().trim()
    const description = (body?.description ?? "").toString().trim()

    const value = typeof valueRaw === "number" ? valueRaw : Number(valueRaw)

    if (!title) {
      return NextResponse.json(
        { error: "title is required" },
        { status: 400 },
      )
    }

    if (!Number.isFinite(value) || value < 0) {
      return NextResponse.json(
        { error: "value must be a positive number" },
        { status: 400 },
      )
    }

    const newDeal = await createDeal({
      title,
      value,
      contactId,
      stage,
      description,
    })

    return NextResponse.json(newDeal, { status: 201 })
  } catch (error) {
    console.error("POST /api/deals error:", error)
    return NextResponse.json(
      { error: "Deal could not be created" },
      { status: 500 },
    )
  }
}
