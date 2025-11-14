// lib/cloudflare-kv.ts
// @ts-nocheck
import type { KVNamespace } from "@cloudflare/workers-types"
import { getRequestContext } from "@cloudflare/next-on-pages"

export const runtime = "edge"

/* ---------------------------
   KV Binding + Fallback
---------------------------- */

const inMemoryStore = new Map<string, string>()

const fallbackKV: KVNamespace = {
  async get(key: string) {
    return inMemoryStore.get(key) ?? null
  },
  async put(key: string, value: any) {
    if (typeof value === "string") {
      inMemoryStore.set(key, value)
    } else {
      inMemoryStore.set(key, JSON.stringify(value))
    }
  },
  async delete(key: string) {
    inMemoryStore.delete(key)
  },
  async list(options?: { prefix?: string }) {
    const prefix = options?.prefix ?? ""
    const keys = Array.from(inMemoryStore.keys())
      .filter((name) => name.startsWith(prefix))
      .map((name) => ({ name }))

    return { keys, list_complete: true }
  },
} as any

function getKV(): KVNamespace {
  // Cloudflare Pages / next-on-pages runtime
  try {
    const ctx = getRequestContext()
    const env = (ctx as any)?.env
    const ns = env?.CRM_SPR_KV as KVNamespace | undefined
    if (ns) return ns
  } catch {
    // dev veya build sırasında burası patlar → fallback'e düş
  }

  // Local dev / build: in-memory KV
  return fallbackKV
}

/* ---------------------------
   Types
---------------------------- */

export interface Contact {
  id: string
  name: string
  email: string
  phone: string
  company: string
  position: string
  createdAt: string
  updatedAt: string
}

export type DealStage =
  | "lead"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost"

export interface Deal {
  id: string
  title: string
  value: number
  contactId: string
  stage: DealStage
  description: string
  createdAt: string
  updatedAt: string
}

/* ---------------------------
   Helpers
---------------------------- */

const CONTACT_PREFIX = "contact:"
const DEAL_PREFIX = "deal:"

async function kvGetJson<T>(kv: KVNamespace, key: string): Promise<T | null> {
  const raw = await kv.get(key)
  if (!raw) return null
  return JSON.parse(raw as string) as T
}

async function kvSetJson<T>(
  kv: KVNamespace,
  key: string,
  value: T,
): Promise<void> {
  await kv.put(key, JSON.stringify(value))
}

/* ---------------------------
   Contact CRUD
---------------------------- */

export async function getContacts(): Promise<Contact[]> {
  const kv = getKV()
  const list = await kv.list({ prefix: CONTACT_PREFIX })
  const contacts: Contact[] = []

  for (const item of list.keys) {
    const c = await kvGetJson<Contact>(kv, item.name)
    if (c) contacts.push(c)
  }

  return contacts
}

export async function getContact(id: string): Promise<Contact | null> {
  const kv = getKV()
  return kvGetJson<Contact>(kv, `${CONTACT_PREFIX}${id}`)
}

export async function createContact(
  data: Omit<Contact, "id" | "createdAt" | "updatedAt">,
): Promise<Contact> {
  const kv = getKV()
  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  const contact: Contact = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  }

  await kvSetJson(kv, `${CONTACT_PREFIX}${id}`, contact)
  return contact
}

export async function updateContact(
  id: string,
  updates: Partial<Contact>,
): Promise<Contact | null> {
  const kv = getKV()
  const existing = await getContact(id)
  if (!existing) return null

  const updated: Contact = {
    ...existing,
    ...updates,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  }

  await kvSetJson(kv, `${CONTACT_PREFIX}${id}`, updated)
  return updated
}

export async function deleteContact(id: string): Promise<boolean> {
  const kv = getKV()
  await kv.delete(`${CONTACT_PREFIX}${id}`)
  return true
}

/* ---------------------------
   Deal CRUD
---------------------------- */

export async function getDeals(): Promise<Deal[]> {
  const kv = getKV()
  const list = await kv.list({ prefix: DEAL_PREFIX })
  const deals: Deal[] = []

  for (const item of list.keys) {
    const d = await kvGetJson<Deal>(kv, item.name)
    if (d) deals.push(d)
  }

  return deals
}

export async function getDeal(id: string): Promise<Deal | null> {
  const kv = getKV()
  return kvGetJson<Deal>(kv, `${DEAL_PREFIX}${id}`)
}

export async function createDeal(
  data: Omit<Deal, "id" | "createdAt" | "updatedAt">,
): Promise<Deal> {
  const kv = getKV()
  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  const deal: Deal = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  }

  await kvSetJson(kv, `${DEAL_PREFIX}${id}`, deal)
  return deal
}

export async function updateDeal(
  id: string,
  updates: Partial<Deal>,
): Promise<Deal | null> {
  const kv = getKV()
  const existing = await getDeal(id)
  if (!existing) return null

  const updated: Deal = {
    ...existing,
    ...updates,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  }

  await kvSetJson(kv, `${DEAL_PREFIX}${id}`, updated)
  return updated
}

export async function deleteDeal(id: string): Promise<boolean> {
  const kv = getKV()
  await kv.delete(`${DEAL_PREFIX}${id}`)
  return true
}
