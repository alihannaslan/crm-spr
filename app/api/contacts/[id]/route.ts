import { NextRequest, NextResponse } from "next/server"
import { kv } from "@/lib/cloudflare-kv"

export const runtime: "edge" = "edge"

type Contact = {
  id: string
  name: string
  email?: string
  phone?: string
  company?: string
  createdAt: string
  updatedAt?: string
}

const KV_KEY = "contacts"

async function loadContacts(): Promise<Contact[]> {
  const raw = await kv.get(KV_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw as string)
    return Array.isArray(parsed) ? (parsed as Contact[]) : []
  } catch {
    return []
  }
}

async function saveContacts(contacts: Contact[]) {
  await kv.put(KV_KEY, JSON.stringify(contacts))
}

type RouteContext = {
  params: Promise<{ id: string }>
}

async function resolveId(context: RouteContext) {
  const { id } = await context.params
  return id
}

// GET /api/contacts/[id]
export async function GET(_req: NextRequest, context: RouteContext) {
  const contacts = await loadContacts()
  const contactId = await resolveId(context)
  const contact = contacts.find((c) => c.id === contactId)

  if (!contact) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 })
  }

  return NextResponse.json(contact)
}

// PUT /api/contacts/[id]
export async function PUT(req: NextRequest, context: RouteContext) {
  const contacts = await loadContacts()
  const contactId = await resolveId(context)
  const index = contacts.findIndex((c) => c.id === contactId)

  if (index === -1) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 })
  }

  const body = (await req.json()) as Partial<Contact>

  const updated: Contact = {
    ...contacts[index],
    ...body,
    id: contactId,
    updatedAt: new Date().toISOString(),
  }

  contacts[index] = updated
  await saveContacts(contacts)

  return NextResponse.json(updated)
}

// DELETE /api/contacts/[id]
export async function DELETE(_req: NextRequest, context: RouteContext) {
  const contacts = await loadContacts()
  const contactId = await resolveId(context)
  const newContacts = contacts.filter((c) => c.id !== contactId)

  if (newContacts.length === contacts.length) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 })
  }

  await saveContacts(newContacts)
  return NextResponse.json({ ok: true })
}
