import { NextResponse } from "next/server"
import { getContacts, createContact } from "@/lib/cloudflare-kv"

export async function GET() {
  try {
    const contacts = await getContacts()
    return NextResponse.json(contacts)
  } catch (error) {
    console.error("[v0] Error fetching contacts:", error)
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const contact = await createContact(body)
    return NextResponse.json(contact)
  } catch (error) {
    console.error("[v0] Error creating contact:", error)
    return NextResponse.json({ error: "Failed to create contact" }, { status: 500 })
  }
}
