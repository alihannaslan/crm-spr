(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__f4b647c3._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/lib/cloudflare-kv.ts [app-edge-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/// <reference types="@cloudflare/workers-types" />
__turbopack_context__.s([
    "GET",
    ()=>GET,
    "createContact",
    ()=>createContact,
    "createDeal",
    ()=>createDeal,
    "deleteContact",
    ()=>deleteContact,
    "deleteDeal",
    ()=>deleteDeal,
    "getContact",
    ()=>getContact,
    "getContacts",
    ()=>getContacts,
    "getDeal",
    ()=>getDeal,
    "getDeals",
    ()=>getDeals,
    "kv",
    ()=>kv,
    "runtime",
    ()=>runtime,
    "updateContact",
    ()=>updateContact,
    "updateDeal",
    ()=>updateDeal
]);
const runtime = "edge";
function resolveKVBinding() {
    if (typeof globalThis === "object" && "CRM_SPR_KV" in globalThis) {
        const binding = globalThis.CRM_SPR_KV;
        if (binding) {
            return binding;
        }
    }
    return undefined;
}
const inMemoryStore = new Map();
async function kvValueToString(value) {
    if (typeof value === "string") {
        return value;
    }
    if (typeof value === "object" && value !== null) {
        if (value instanceof ArrayBuffer) {
            return new TextDecoder().decode(new Uint8Array(value));
        }
        if (ArrayBuffer.isView(value)) {
            return new TextDecoder().decode(new Uint8Array(value.buffer));
        }
        if (typeof FormData !== "undefined" && value instanceof FormData) {
            const params = new URLSearchParams();
            for (const [key, entry] of value.entries()){
                if (typeof entry === "string") {
                    params.append(key, entry);
                }
            }
            return params.toString();
        }
        if (typeof URLSearchParams !== "undefined" && value instanceof URLSearchParams) {
            return value.toString();
        }
        if (typeof Blob !== "undefined" && value instanceof Blob) {
            return await value.text();
        }
        if (value instanceof ReadableStream) {
            const reader = value.getReader();
            const chunks = [];
            // Aggregate streamed chunks into a single buffer
            for(;;){
                const { done, value: chunk } = await reader.read();
                if (done) {
                    break;
                }
                if (chunk) {
                    chunks.push(chunk);
                }
            }
            if (chunks.length === 0) {
                return "";
            }
            const totalLength = chunks.reduce((sum, chunk)=>sum + chunk.length, 0);
            const merged = new Uint8Array(totalLength);
            let offset = 0;
            for (const chunk of chunks){
                merged.set(chunk, offset);
                offset += chunk.length;
            }
            return new TextDecoder().decode(merged);
        }
    }
    throw new Error("In-memory KV fallback only supports string-compatible values. Provide CRM_SPR_KV binding for other types.");
}
const fallbackKV = {
    async get (key) {
        return inMemoryStore.get(key) ?? null;
    },
    async getWithMetadata (key) {
        const value = inMemoryStore.get(key) ?? null;
        return {
            value,
            metadata: null
        };
    },
    async put (key, value) {
        const serialized = await kvValueToString(value);
        inMemoryStore.set(key, serialized);
    },
    async delete (key) {
        inMemoryStore.delete(key);
    },
    async list (options) {
        const prefix = options?.prefix ?? "";
        const keys = Array.from(inMemoryStore.keys()).filter((name)=>name.startsWith(prefix)).map((name)=>({
                name
            }));
        return {
            keys,
            list_complete: true,
            cursor: undefined
        };
    }
};
const kv = resolveKVBinding() ?? fallbackKV;
async function GET() {
    const value = await kv.get("test");
    return Response.json({
        value
    });
}
let cachedConfig = null;
function getKVConfig() {
    if (cachedConfig) {
        return cachedConfig;
    }
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const namespaceId = process.env.CLOUDFLARE_KV_NAMESPACE_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN ?? process.env.CLOUDFLARE_KV_API_TOKEN;
    if (!accountId || !namespaceId || !apiToken) {
        throw new Error("Cloudflare KV environment variables are missing. Please set CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_KV_NAMESPACE_ID, and CLOUDFLARE_API_TOKEN.");
    }
    cachedConfig = {
        baseUrl: `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}`,
        apiToken
    };
    return cachedConfig;
}
async function kvRequest(path, init) {
    const { baseUrl, apiToken } = getKVConfig();
    const headers = {
        Authorization: `Bearer ${apiToken}`
    };
    if (init?.headers) {
        if (init.headers instanceof Headers) {
            init.headers.forEach((value, key)=>{
                headers[key] = value;
            });
        } else if (Array.isArray(init.headers)) {
            for (const [key, value] of init.headers){
                headers[key] = value;
            }
        } else {
            Object.assign(headers, init.headers);
        }
    }
    const res = await fetch(`${baseUrl}${path}`, {
        ...init,
        headers
    });
    if (!res.ok && res.status !== 404) {
        const message = await res.text();
        throw new Error(`Cloudflare KV request failed (${res.status}): ${message}`);
    }
    return res;
}
async function kvGet(key) {
    const res = await kvRequest(`/values/${encodeURIComponent(key)}`);
    if (res.status === 404) {
        return null;
    }
    const text = await res.text();
    return text ? JSON.parse(text) : null;
}
async function kvSet(key, value) {
    await kvRequest(`/values/${encodeURIComponent(key)}`, {
        method: "PUT",
        body: JSON.stringify(value),
        headers: {
            "Content-Type": "application/json"
        }
    });
}
async function kvDelete(key) {
    await kvRequest(`/values/${encodeURIComponent(key)}`, {
        method: "DELETE"
    });
}
async function listKeys(prefix) {
    let keys = [];
    let cursor;
    do {
        const params = new URLSearchParams({
            limit: "1000",
            prefix
        });
        if (cursor) {
            params.set("cursor", cursor);
        }
        const res = await kvRequest(`/keys?${params.toString()}`);
        if (res.status === 404) {
            break;
        }
        const data = await res.json();
        keys = keys.concat(data.result.map((item)=>item.name));
        cursor = data.result_info?.cursor;
    }while (cursor)
    return keys;
}
async function getContacts() {
    const contactKeys = await listKeys("contact:");
    if (contactKeys.length === 0) {
        return [];
    }
    const contacts = await Promise.all(contactKeys.map(async (key)=>{
        const contact = await kvGet(key);
        return contact;
    }));
    return contacts.filter((contact)=>contact !== null);
}
async function getContact(id) {
    return kvGet(`contact:${id}`);
}
async function createContact(contact) {
    const id = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    const newContact = {
        ...contact,
        id,
        createdAt: now,
        updatedAt: now
    };
    await kvSet(`contact:${id}`, newContact);
    return newContact;
}
async function updateContact(id, updates) {
    const contact = await getContact(id);
    if (!contact) {
        return null;
    }
    const updatedContact = {
        ...contact,
        ...updates,
        id: contact.id,
        createdAt: contact.createdAt,
        updatedAt: new Date().toISOString()
    };
    await kvSet(`contact:${id}`, updatedContact);
    return updatedContact;
}
async function deleteContact(id) {
    await kvDelete(`contact:${id}`);
    // Delete associated deals
    const deals = await getDeals();
    const contactDeals = deals.filter((deal)=>deal.contactId === id);
    await Promise.all(contactDeals.map((deal)=>deleteDeal(deal.id)));
    return true;
}
async function getDeals() {
    const dealKeys = await listKeys("deal:");
    if (dealKeys.length === 0) {
        return [];
    }
    const deals = await Promise.all(dealKeys.map(async (key)=>{
        const deal = await kvGet(key);
        return deal;
    }));
    return deals.filter((deal)=>deal !== null);
}
async function getDeal(id) {
    return kvGet(`deal:${id}`);
}
async function createDeal(deal) {
    const id = `deal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    const newDeal = {
        ...deal,
        id,
        createdAt: now,
        updatedAt: now
    };
    await kvSet(`deal:${id}`, newDeal);
    return newDeal;
}
async function updateDeal(id, updates) {
    const deal = await getDeal(id);
    if (!deal) {
        return null;
    }
    const updatedDeal = {
        ...deal,
        ...updates,
        id: deal.id,
        createdAt: deal.createdAt,
        updatedAt: new Date().toISOString()
    };
    await kvSet(`deal:${id}`, updatedDeal);
    return updatedDeal;
}
async function deleteDeal(id) {
    await kvDelete(`deal:${id}`);
    return true;
}
}),
"[project]/app/api/contacts/route.ts [app-edge-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.0_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/esm/api/server.js [app-edge-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.0_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/esm/server/web/exports/index.js [app-edge-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cloudflare$2d$kv$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/cloudflare-kv.ts [app-edge-route] (ecmascript)");
;
;
const runtime = "edge";
const KV_KEY = "deals";
async function loadDeals() {
    const raw = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cloudflare$2d$kv$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["kv"].get(KV_KEY);
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch  {
        return [];
    }
}
async function saveDeals(deals) {
    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cloudflare$2d$kv$2e$ts__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["kv"].put(KV_KEY, JSON.stringify(deals));
}
async function GET() {
    const deals = await loadDeals();
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(deals);
}
async function POST(req) {
    const body = await req.json();
    const { title, value, contactId, status } = body;
    if (!title || typeof value !== "number") {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "title (string) ve value (number) zorunludur"
        }, {
            status: 400
        });
    }
    const deals = await loadDeals();
    const now = new Date().toISOString();
    const newDeal = {
        id: crypto.randomUUID(),
        title,
        value,
        contactId,
        status: status ?? "open",
        createdAt: now
    };
    deals.push(newDeal);
    await saveDeals(deals);
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$app$2d$edge$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(newDeal, {
        status: 201
    });
}
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__f4b647c3._.js.map