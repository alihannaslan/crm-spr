import type { KVNamespace } from "@cloudflare/workers-types"

export const runtime = "edge"

/* ---------------------------
   KV Binding + Fallback
---------------------------- */

declare global {
  // Cloudflare Pages deploy sırasında bunu global'e enjekte eder
  // eslint-disable-next-line no-var
  var CRM_SPR_KV: KVNamespace | undefined
}

function getKV(): KVNamespace {
  if (globalThis.CRM_SPR_KV) {
    return globalThis.CRM_SPR_KV
  }

  // Local dev fallback (in-memory store)
  const store = new Map<string, string>()

  return {
    async get(key: string) {
      return store.get(key) ?? null
    },
    async put(key: string, value: string) {
      store.set(key, value)
    },
    async delete(key: string) {
      store.delete(key)
    },
    async list(options?: { prefix?: string }) {
      const prefix = options?.prefix ?? ""
      const keys = [...store.keys()]
        .filter((k) => k.startsWith(prefix))
        .map((name) => ({ name }))

      return {
        keys,
        list_complete: true,
      } as any
    },
  } as KVNamespace
}

export const kv = getKV()

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

async function kvGetJson<T>(key: string): Promise<T | null> {
  const raw = await kv.get(key)
  if (!raw) return null
  return JSON.parse(raw) as T
}

async function kvSetJson<T>(key: string, value: T): Promise<void> {
  await kv.put(key, JSON.stringify(value))
}

/* ---------------------------
   Contact CRUD
---------------------------- */

export async function getContacts(): Promise<Contact[]> {
  const list = await kv.list({ prefix: CONTACT_PREFIX })
  const contacts: Contact[] = []

  for (const item of list.keys) {
    const c = await kvGetJson<Contact>(item.name)
    if (c) contacts.push(c)
  }

  return contacts
}

export async function getContact(id: string): Promise<Contact | null> {
  return kvGetJson<Contact>(`${CONTACT_PREFIX}${id}`)
}

export async function createContact(
  data: Omit<Contact, "id" | "createdAt" | "updatedAt">,
): Promise<Contact> {
  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  const contact: Contact = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  }

  await kvSetJson(`${CONTACT_PREFIX}${id}`, contact)
  return contact
}

export async function updateContact(
  id: string,
  updates: Partial<Contact>,
): Promise<Contact | null> {
  const existing = await getContact(id)
  if (!existing) return null

  const updated: Contact = {
    ...existing,
    ...updates,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  }

  await kvSetJson(`${CONTACT_PREFIX}${id}`, updated)
  return updated
}

export async function deleteContact(id: string): Promise<boolean> {
  await kv.delete(`${CONTACT_PREFIX}${id}`)
  return true
}

/* ---------------------------
   Deal CRUD
---------------------------- */

export async function getDeals(): Promise<Deal[]> {
  const list = await kv.list({ prefix: DEAL_PREFIX })
  const deals: Deal[] = []

  for (const item of list.keys) {
    const d = await kvGetJson<Deal>(item.name)
    if (d) deals.push(d)
  }

  return deals
}

export async function getDeal(id: string): Promise<Deal | null> {
  return kvGetJson<Deal>(`${DEAL_PREFIX}${id}`)
}

export async function createDeal(
  data: Omit<Deal, "id" | "createdAt" | "updatedAt">,
): Promise<Deal> {
  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  const deal: Deal = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  }

  await kvSetJson(`${DEAL_PREFIX}${id}`, deal)
  return deal
}

export async function updateDeal(
  id: string,
  updates: Partial<Deal>,
): Promise<Deal | null> {
  const existing = await getDeal(id)
  if (!existing) return null

  const updated: Deal = {
    ...existing,
    ...updates,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  }

  await kvSetJson(`${DEAL_PREFIX}${id}`, updated)
  return updated
}

export async function deleteDeal(id: string): Promise<boolean> {
  await kv.delete(`${DEAL_PREFIX}${id}`)
  return true
}
