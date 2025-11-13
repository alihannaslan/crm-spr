/// <reference types="@cloudflare/workers-types" />

export const runtime = "edge"

declare const CRM_SPR_KV: KVNamespace

export async function GET() {
  const value = await CRM_SPR_KV.get("test")
  return Response.json({ value })
}



type KVConfig = {
  baseUrl: string
  apiToken: string
}

let cachedConfig: KVConfig | null = null

function getKVConfig(): KVConfig {
  if (cachedConfig) {
    return cachedConfig
  }

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const namespaceId = process.env.CLOUDFLARE_KV_NAMESPACE_ID
  const apiToken = process.env.CLOUDFLARE_API_TOKEN ?? process.env.CLOUDFLARE_KV_API_TOKEN

  if (!accountId || !namespaceId || !apiToken) {
    throw new Error("Cloudflare KV environment variables are missing. Please set CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_KV_NAMESPACE_ID, and CLOUDFLARE_API_TOKEN.")
  }

  cachedConfig = {
    baseUrl: `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}`,
    apiToken,
  }

  return cachedConfig
}

async function kvRequest(path: string, init?: RequestInit) {
  const { baseUrl, apiToken } = getKVConfig()
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiToken}`,
  }

  if (init?.headers) {
    if (init.headers instanceof Headers) {
      init.headers.forEach((value, key) => {
        headers[key] = value
      })
    } else if (Array.isArray(init.headers)) {
      for (const [key, value] of init.headers) {
        headers[key] = value
      }
    } else {
      Object.assign(headers, init.headers as Record<string, string>)
    }
  }

  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
  })

  if (!res.ok && res.status !== 404) {
    const message = await res.text()
    throw new Error(`Cloudflare KV request failed (${res.status}): ${message}`)
  }

  return res
}

async function kvGet<T>(key: string): Promise<T | null> {
  const res = await kvRequest(`/values/${encodeURIComponent(key)}`)
  if (res.status === 404) {
    return null
  }
  const text = await res.text()
  return text ? (JSON.parse(text) as T) : null
}

async function kvSet<T>(key: string, value: T) {
  await kvRequest(`/values/${encodeURIComponent(key)}`, {
    method: "PUT",
    body: JSON.stringify(value),
    headers: {
      "Content-Type": "application/json",
    },
  })
}

async function kvDelete(key: string) {
  await kvRequest(`/values/${encodeURIComponent(key)}`, {
    method: "DELETE",
  })
}

async function listKeys(prefix: string): Promise<string[]> {
  let keys: string[] = []
  let cursor: string | undefined

  do {
    const params = new URLSearchParams({
      limit: "1000",
      prefix,
    })
    if (cursor) {
      params.set("cursor", cursor)
    }

    const res = await kvRequest(`/keys?${params.toString()}`)
    if (res.status === 404) {
      break
    }

    const data = (await res.json()) as {
      result: Array<{ name: string }>
      result_info?: { cursor?: string }
    }

    keys = keys.concat(data.result.map((item) => item.name))
    cursor = data.result_info?.cursor
  } while (cursor)

  return keys
}

// Type definitions
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

export interface Deal {
  id: string
  title: string
  value: number
  contactId: string
  stage: "lead" | "qualified" | "proposal" | "negotiation" | "won" | "lost"
  description: string
  createdAt: string
  updatedAt: string
}

// Contact operations
export async function getContacts(): Promise<Contact[]> {
  const contactKeys = await listKeys("contact:")
  if (contactKeys.length === 0) {
    return []
  }

  const contacts = await Promise.all(
    contactKeys.map(async (key) => {
      const contact = await kvGet<Contact>(key)
      return contact
    }),
  )

  return contacts.filter(Boolean)
}

export async function getContact(id: string): Promise<Contact | null> {
  return kvGet<Contact>(`contact:${id}`)
}

export async function createContact(contact: Omit<Contact, "id" | "createdAt" | "updatedAt">): Promise<Contact> {
  const id = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const now = new Date().toISOString()

  const newContact: Contact = {
    ...contact,
    id,
    createdAt: now,
    updatedAt: now,
  }

  await kvSet(`contact:${id}`, newContact)

  return newContact
}

export async function updateContact(id: string, updates: Partial<Contact>): Promise<Contact | null> {
  const contact = await getContact(id)

  if (!contact) {
    return null
  }

  const updatedContact: Contact = {
    ...contact,
    ...updates,
    id: contact.id,
    createdAt: contact.createdAt,
    updatedAt: new Date().toISOString(),
  }

  await kvSet(`contact:${id}`, updatedContact)
  return updatedContact
}

export async function deleteContact(id: string): Promise<boolean> {
  await kvDelete(`contact:${id}`)

  // Delete associated deals
  const deals = await getDeals()
  const contactDeals = deals.filter((deal) => deal.contactId === id)
  await Promise.all(contactDeals.map((deal) => deleteDeal(deal.id)))

  return true
}

// Deal operations
export async function getDeals(): Promise<Deal[]> {
  const dealKeys = await listKeys("deal:")
  if (dealKeys.length === 0) {
    return []
  }

  const deals = await Promise.all(
    dealKeys.map(async (key) => {
      const deal = await kvGet<Deal>(key)
      return deal
    }),
  )

  return deals.filter(Boolean)
}

export async function getDeal(id: string): Promise<Deal | null> {
  return kvGet<Deal>(`deal:${id}`)
}

export async function createDeal(deal: Omit<Deal, "id" | "createdAt" | "updatedAt">): Promise<Deal> {
  const id = `deal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const now = new Date().toISOString()

  const newDeal: Deal = {
    ...deal,
    id,
    createdAt: now,
    updatedAt: now,
  }

  await kvSet(`deal:${id}`, newDeal)

  return newDeal
}

export async function updateDeal(id: string, updates: Partial<Deal>): Promise<Deal | null> {
  const deal = await getDeal(id)

  if (!deal) {
    return null
  }

  const updatedDeal: Deal = {
    ...deal,
    ...updates,
    id: deal.id,
    createdAt: deal.createdAt,
    updatedAt: new Date().toISOString(),
  }

  await kvSet(`deal:${id}`, updatedDeal)
  return updatedDeal
}

export async function deleteDeal(id: string): Promise<boolean> {
  await kvDelete(`deal:${id}`)
  return true
}
