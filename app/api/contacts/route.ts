// @ts-nocheck
import { NextRequest, NextResponse } from "next/server"
import { getContacts, createContact } from "@/lib/cloudflare-kv"

export const runtime = "edge"

// GET /api/contact → tüm contact'lar
export async function GET() {
  try {
    const contacts = await getContacts()
    return NextResponse.json(contacts)
  } catch (error) {
    console.error("GET /api/contact error:", error)
    return NextResponse.json(
      { error: "Contacts could not be loaded" },
      { status: 500 },
    )
  }
}

// POST /api/contact → yeni contact oluştur
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
        { error: "Name is required" },
        { status: 400 },
      )
    }

    const newContact = await createContact({
      name,
      email,
      phone,
      company,
      position,
    })

    return NextResponse.json(newContact, { status: 201 })
  } catch (error) {
    console.error("POST /api/contact error:", error)
    return NextResponse.json(
      { error: "Contact could not be created" },
      { status: 500 },
    )
  }
}
