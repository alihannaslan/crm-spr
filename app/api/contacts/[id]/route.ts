import { NextRequest, NextResponse } from "next/server";
import { kv } from "@/lib/cloudflare-kv";

export const runtime = "edge";

const KV_KEY = "contacts";

type Contact = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  createdAt: string;
  updatedAt?: string;
};

async function loadContacts(): Promise<Contact[]> {
  const raw = (await kv.get(KV_KEY)) as string | null;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveContacts(contacts: Contact[]) {
  await kv.put(KV_KEY, JSON.stringify(contacts));
}

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const contacts = await loadContacts();
  const contact = contacts.find((c) => c.id === id);

  if (!contact) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  return NextResponse.json(contact);
}

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const contacts = await loadContacts();
  const i = contacts.findIndex((c) => c.id === id);

  if (i === -1) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  const raw = (await req.json()) as any;

  const name = (raw.name ?? raw.title ?? contacts[i].name).toString().trim();
  const email = raw.email ?? contacts[i].email;
  const phone = raw.phone ?? contacts[i].phone;
  const company = raw.company ?? contacts[i].company;

  const updated: Contact = {
    ...contacts[i],
    name,
    email,
    phone,
    company,
    updatedAt: new Date().toISOString(),
  };

  contacts[i] = updated;
  await saveContacts(contacts);

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const contacts = await loadContacts();
  const filtered = contacts.filter((c) => c.id !== id);

  if (filtered.length === contacts.length) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  await saveContacts(filtered);
  return NextResponse.json({ ok: true });
}
