//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : functions/api/v1/_tierMiddleware.js
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

/**
 * FUNGSI UTAMA: TIER GUARDIAN (GUEST / BYOK MODE)
 * @param {Object} context - Context dari Cloudflare Pages
 * @param {String} keyName - Nama Variable API Key (cth: 'YOUTUBE_API_KEY')
 * @param {String} limitScope - Nama Variable untuk Limit (cth: 'LAST_CHANNEL_SCAN_TS')
 */
export async function enforceSmartTiering(context, keyName, limitScope) {
    const { request } = context;

    const origin = request.headers.get("Origin");
    const allowedDomain = "https://floworkos.com";

    // 1. Basic Origin Protection
    if (origin && !origin.includes("localhost") && !origin.includes("127.0.0.1") && origin !== allowedDomain) {
        throw {
            status: 403,
            body: { error: "FORBIDDEN_ORIGIN", message: "Access denied. Request stolen." }
        };
    }

    // 2. Ambil Key langsung dari Request Header (Bring Your Own Key)
    const apiKey = request.headers.get("X-Youtube-Key") || request.headers.get("X-API-KEY") || request.headers.get("X-Api-Key");

    // 3. Validasi Key
    if (!apiKey || apiKey === 'undefined' || apiKey.includes('CHANGE')) {
        throw {
            status: 401,
            body: {
                error: "MISSING_CONFIG",
                message: `Neural Link broken. Please inject your own ${keyName} to proceed for free.`
            }
        };
    }

    // Return format yang sama agar endpoint API turunan tidak mengalami crash (tetap mengembalikan objek)
    return { apiKey, tier: "FREE_PROVIDER", isPrivate: false };
}