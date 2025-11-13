module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/cloudflare-kv.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
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
    "updateContact",
    ()=>updateContact,
    "updateDeal",
    ()=>updateDeal
]);
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
    return contacts.filter(Boolean);
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
    return deals.filter(Boolean);
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
"[project]/app/api/contacts/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.0_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cloudflare$2d$kv$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/cloudflare-kv.ts [app-route] (ecmascript)");
;
;
async function GET() {
    try {
        const contacts = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cloudflare$2d$kv$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getContacts"])();
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(contacts);
    } catch (error) {
        console.error("[v0] Error fetching contacts:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to fetch contacts"
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const contact = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cloudflare$2d$kv$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createContact"])(body);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(contact);
    } catch (error) {
        console.error("[v0] Error creating contact:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to create contact"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__b9ea62d2._.js.map