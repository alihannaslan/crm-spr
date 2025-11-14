// app/api/contacts/[id]/route.ts
// @ts-nocheck
import { NextRequest, NextResponse } from "next/server"
import { getContact, updateContact, deleteContact } from "@/lib/cloudflare-kv"

export const runtime = "edge"

// GET /api/contacts/[id]
export async function GET(_req: NextRequest, context: any) {
  try {
    const { id } = await context.params
    const contact = await getContact(id)

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 })
    }

    return NextResponse.json(contact)
  } catch (error) {
    console.error("GET /api/contacts/[id] error:", error)
    return NextResponse.json(
      { error: "Contact could not be loaded" },
      { status: 500 },
    )
  }
}

// PUT /api/contacts/[id]
export async function PUT(req: NextRequest, context: any) {
  try {
    const { id } = await context.params
    const body = await req.json()

    const updates: any = {}

    if (typeof body?.name !== "undefined") {
      updates.name = body.name
    }
    if (typeof body?.email !== "undefined") {
      updates.email = body.email
    }
    if (typeof body?.phone !== "undefined") {
      updates.phone = body.phone
    }
    if (typeof body?.company !== "undefined") {
      updates.company = body.company
    }
    if (typeof body?.position !== "undefined") {
      updates.position = body.position
    }

    const updated = await updateContact(id, updates)

    if (!updated) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PUT /api/contacts/[id] error:", error)
    return NextResponse.json(
      { error: "Contact could not be updated" },
      { status: 500 },
    )
  }
}

// PATCH /api/contacts/[id] → form muhtemelen PATCH gönderiyor
export async function PATCH(req: NextRequest, context: any) {
  return PUT(req, context)
}

// DELETE /api/contacts/[id]
export async function DELETE(_req: NextRequest, context: any) {
  try {
    const { id } = await context.params

    await deleteContact(id)

    return NextResponse.json({ deleted: true })
  } catch (error) {
    console.error("DELETE /api/contacts/[id] error:", error)
    return NextResponse.json(
      { error: "Contact could not be deleted" },
      { status: 500 },
    )
  }
}
