//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : functions/api/v1/flow/share.js
//#######################################################################

// Helper untuk membuat ID acak pendek (6 karakter)
function generateShortId(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const payload = await request.json();

        // 1. Validasi keberadaan KV Binding
        if (!env.FLOW_SHARE_KV) {
            return new Response(JSON.stringify({ error: "FLOW_SHARE_KV namespace is not bound in Cloudflare Dashboard" }), { status: 500, headers: { "Content-Type": "application/json" } });
        }

        // 2. Generate ID Unik (Cek bentrok - opsional, tapi kemungkinan kecil)
        const shortId = generateShortId();

        // 3. Simpan ke KV (Bisa ditambahkan expirationTtl: 2592000 untuk otomatis hapus setelah 30 hari jika mau)
        await env.FLOW_SHARE_KV.put(shortId, JSON.stringify(payload), { expirationTtl: 2592000 });

        return new Response(JSON.stringify({
            status: "success",
            id: shortId,
            message: "Workflow saved to Cloudflare KV"
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
}

export async function onRequestGet(context) {
    try {
        const { request, env } = context;
        const url = new URL(request.url);
        const shortId = url.searchParams.get('id');

        if (!env.FLOW_SHARE_KV) {
             return new Response(JSON.stringify({ error: "FLOW_SHARE_KV namespace is not bound" }), { status: 500, headers: { "Content-Type": "application/json" } });
        }

        if (!shortId) {
            return new Response(JSON.stringify({ error: "Missing 'id' parameter" }), { status: 400, headers: { "Content-Type": "application/json" } });
        }

        // Ambil data dari KV
        const dataStr = await env.FLOW_SHARE_KV.get(shortId);

        if (!dataStr) {
            return new Response(JSON.stringify({ error: "Workflow not found or expired" }), { status: 404, headers: { "Content-Type": "application/json" } });
        }

        return new Response(dataStr, {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                // Berikan cache agar akses load cepat dan hemat read KV
                "Cache-Control": "public, max-age=3600"
            }
        });

    } catch (error) {
         return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
}