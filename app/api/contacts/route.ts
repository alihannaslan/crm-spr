// app/api/contacts/route.ts
// @ts-nocheck
import { NextRequest, NextResponse } from "next/server"
import { getContacts, createContact } from "@/lib/cloudflare-kv"

export const runtime = "edge"

// GET /api/contacts → tüm kişiler
export async function GET() {
  try {
    const contacts = await getContacts()
    return NextResponse.json(contacts)
  } catch (error) {
    console.error("GET /api/contacts error:", error)
    return NextResponse.json(
      { error: "Contacts could not be loaded" },
      { status: 500 },
    )
  }
}

// POST /api/contacts → yeni kişi
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const name = (body?.name ?? "").toString().trim()
    const email = (body?.email ?? "").toString().trim()
    const phone = (body?.phone ?? "").toString().trim()
    const company = (body?.company ?? "").toString().trim()
    const position = (body?.position ?? "").toString().trim()

    if (!name) {
      return NextResponse.json(
        { error: "name is required" },
        { status: 400 },
      )
    }

    const contact = await createContact({
      name,
      email,
      phone,
      company,
      position,
    })

    return NextResponse.json(contact, { status: 201 })
  } catch (error) {
    console.error("POST /api/contacts error:", error)
    return NextResponse.json(
      { error: "Contact could not be created" },
      { status: 500 },
    )
  }
}
