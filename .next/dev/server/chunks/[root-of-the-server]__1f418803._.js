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
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[project]/lib/redis.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
    "getRedis",
    ()=>getRedis,
    "updateContact",
    ()=>updateContact,
    "updateDeal",
    ()=>updateDeal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$upstash$2b$redis$40$1$2e$35$2e$6$2f$node_modules$2f40$upstash$2f$redis$2f$nodejs$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@upstash+redis@1.35.6/node_modules/@upstash/redis/nodejs.mjs [app-route] (ecmascript) <locals>");
;
// Singleton pattern for Redis client
let redis = null;
function getRedis() {
    if (!redis) {
        redis = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$upstash$2b$redis$40$1$2e$35$2e$6$2f$node_modules$2f40$upstash$2f$redis$2f$nodejs$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Redis"]({
            url: process.env.UPSTASH_KV_REDIS_URL,
            token: process.env.UPSTASH_KV_KV_REST_API_TOKEN
        });
    }
    return redis;
}
async function getContacts() {
    const redis = getRedis();
    const contactIds = await redis.smembers("contacts:all");
    if (!contactIds || contactIds.length === 0) {
        return [];
    }
    const contacts = await Promise.all(contactIds.map(async (id)=>{
        const contact = await redis.get(`contact:${id}`);
        return contact;
    }));
    return contacts.filter(Boolean);
}
async function getContact(id) {
    const redis = getRedis();
    const contact = await redis.get(`contact:${id}`);
    return contact;
}
async function createContact(contact) {
    const redis = getRedis();
    const id = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    const newContact = {
        ...contact,
        id,
        createdAt: now,
        updatedAt: now
    };
    await redis.set(`contact:${id}`, newContact);
    await redis.sadd("contacts:all", id);
    return newContact;
}
async function updateContact(id, updates) {
    const redis = getRedis();
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
    await redis.set(`contact:${id}`, updatedContact);
    return updatedContact;
}
async function deleteContact(id) {
    const redis = getRedis();
    await redis.del(`contact:${id}`);
    await redis.srem("contacts:all", id);
    // Delete associated deals
    const deals = await getDeals();
    const contactDeals = deals.filter((deal)=>deal.contactId === id);
    await Promise.all(contactDeals.map((deal)=>deleteDeal(deal.id)));
    return true;
}
async function getDeals() {
    const redis = getRedis();
    const dealIds = await redis.smembers("deals:all");
    if (!dealIds || dealIds.length === 0) {
        return [];
    }
    const deals = await Promise.all(dealIds.map(async (id)=>{
        const deal = await redis.get(`deal:${id}`);
        return deal;
    }));
    return deals.filter(Boolean);
}
async function getDeal(id) {
    const redis = getRedis();
    const deal = await redis.get(`deal:${id}`);
    return deal;
}
async function createDeal(deal) {
    const redis = getRedis();
    const id = `deal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    const newDeal = {
        ...deal,
        id,
        createdAt: now,
        updatedAt: now
    };
    await redis.set(`deal:${id}`, newDeal);
    await redis.sadd("deals:all", id);
    return newDeal;
}
async function updateDeal(id, updates) {
    const redis = getRedis();
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
    await redis.set(`deal:${id}`, updatedDeal);
    return updatedDeal;
}
async function deleteDeal(id) {
    const redis = getRedis();
    await redis.del(`deal:${id}`);
    await redis.srem("deals:all", id);
    return true;
}
}),
"[project]/app/api/deals/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.0_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$redis$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/redis.ts [app-route] (ecmascript)");
;
;
async function GET() {
    try {
        const deals = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$redis$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDeals"])();
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(deals);
    } catch (error) {
        console.error("[v0] Error fetching deals:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to fetch deals"
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const deal = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$redis$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createDeal"])(body);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(deal);
    } catch (error) {
        console.error("[v0] Error creating deal:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to create deal"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1f418803._.js.map