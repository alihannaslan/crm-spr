import { NextResponse } from "next/server"
import { getDeal, updateDeal, deleteDeal } from "@/lib/cloudflare-kv"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const deal = await getDeal(id)

    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 })
    }

    return NextResponse.json(deal)
  } catch (error) {
    console.error("[v0] Error fetching deal:", error)
    return NextResponse.json({ error: "Failed to fetch deal" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const deal = await updateDeal(id, body)

    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 })
    }

    return NextResponse.json(deal)
  } catch (error) {
    console.error("[v0] Error updating deal:", error)
    return NextResponse.json({ error: "Failed to update deal" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await deleteDeal(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting deal:", error)
    return NextResponse.json({ error: "Failed to delete deal" }, { status: 500 })
  }
}
