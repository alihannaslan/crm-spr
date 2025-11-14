// @ts-nocheck
import { NextRequest, NextResponse } from "next/server"
import {
  getContact,
  updateContact,
  deleteContact,
} from "@/lib/cloudflare-kv"

export const runtime = "edge"

// GET /api/contact/[id]
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params

    const contact = await getContact(id)
    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 })
    }

    return NextResponse.json(contact)
  } catch (error) {
    console.error("GET /api/contact/[id] error:", error)
    return NextResponse.json(
      { error: "Contact could not be loaded" },
      { status: 500 },
    )
  }
}

// PUT /api/contact/[id]
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params
    const body = await req.json()

    const updates = {
      name: body?.name,
      email: body?.email,
      phone: body?.phone,
      company: body?.company,
      position: body?.position,
    }

    const updated = await updateContact(id, updates)

    if (!updated) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PUT /api/contact/[id] error:", error)
    return NextResponse.json(
      { error: "Contact could not be updated" },
      { status: 500 },
    )
  }
}

// DELETE /api/contact/[id]
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params

    await deleteContact(id)

    return NextResponse.json({ deleted: true })
  } catch (error) {
    console.error("DELETE /api/contact/[id] error:", error)
    return NextResponse.json(
      { error: "Contact could not be deleted" },
      { status: 500 },
    )
  }
}
