// app/api/deals/[id]/route.ts
// @ts-nocheck
import { NextRequest, NextResponse } from "next/server"
import { getDeal, updateDeal, deleteDeal } from "@/lib/cloudflare-kv"

export const runtime = "edge"

// GET /api/deals/[id]
export async function GET(_req: NextRequest, context: any) {
  try {
    const { id } = await context.params
    const deal = await getDeal(id)

    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 })
    }

    return NextResponse.json(deal)
  } catch (error) {
    console.error("GET /api/deals/[id] error:", error)
    return NextResponse.json(
      { error: "Deal could not be loaded" },
      { status: 500 },
    )
  }
}

// PUT /api/deals/[id]  → tam / kısmi update
export async function PUT(req: NextRequest, context: any) {
  try {
    const { id } = await context.params
    const body = await req.json()

    const updates: any = {}

    if (typeof body?.title !== "undefined") {
      updates.title = body.title
    }
    if (typeof body?.value !== "undefined") {
      updates.value =
        typeof body.value === "number" ? body.value : Number(body.value)
    }
    if (typeof body?.contactId !== "undefined") {
      updates.contactId = body.contactId
    }
    if (typeof body?.stage !== "undefined") {
      updates.stage = body.stage
    }
    if (typeof body?.description !== "undefined") {
      updates.description = body.description
    }

    const updated = await updateDeal(id, updates)

    if (!updated) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PUT /api/deals/[id] error:", error)
    return NextResponse.json(
      { error: "Deal could not be updated" },
      { status: 500 },
    )
  }
}

// PATCH /api/deals/[id] → frontend’in gönderdiği method
export async function PATCH(req: NextRequest, context: any) {
  // Aynı mantığı kullanıyoruz
  return PUT(req, context)
}

// DELETE /api/deals/[id]
export async function DELETE(_req: NextRequest, context: any) {
  try {
    const { id } = await context.params

    await deleteDeal(id)

    return NextResponse.json({ deleted: true })
  } catch (error) {
    console.error("DELETE /api/deals/[id] error:", error)
    return NextResponse.json(
      { error: "Deal could not be deleted" },
      { status: 500 },
    )
  }
}
