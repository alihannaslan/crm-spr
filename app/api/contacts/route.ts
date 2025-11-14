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

export async function GET() {
  const contacts = await loadContacts();
  return NextResponse.json(contacts);
}

export async function POST(req: NextRequest) {
  const raw = (await req.json()) as any;

  // FRONTEND FORM ve eski API ile uyumlu olacak şekilde fallback
  const name = (raw.name ?? raw.title ?? "").toString().trim();
  const email = raw.email ?? "";
  const phone = raw.phone ?? "";
  const company = raw.company ?? "";

  if (!name) {
    return NextResponse.json(
      { error: "name alanı zorunludur" },
      { status: 400 }
    );
  }

  const contacts = await loadContacts();

  const newContact: Contact = {
    id: crypto.randomUUID(),
    name,
    email,
    phone,
    company,
    createdAt: new Date().toISOString(),
  };

  contacts.push(newContact);
  await saveContacts(contacts);

  return NextResponse.json(newContact, { status: 201 });
}
