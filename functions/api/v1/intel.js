//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\intel.js total lines 75 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

/**
 * CLOUDFLARE WORKER: DATA INTELLIGENCE
 * Tugas: Baca KV dan rekap semua statistik app
 */
export async function onRequestGet({ request, env }) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET",
    "Access-Control-Allow-Headers": "Content-Type, X-Secret-Key",
  };

  try {
    const secretKey = request.headers.get('X-Secret-Key');
    const mySecret = env.MOMOD_SECRET || "Aola-#1987"; // Default kalau lupa set env

    if (secretKey !== mySecret) {
      return new Response(JSON.stringify({ error: "ACCESS DENIED: WRONG KEY" }), {
        status: 401, headers: corsHeaders
      });
    }

    const list = await env.FLOWORK_STATS.list({ prefix: "stats:" });

    const keys = list.keys;
    const pendingValues = keys.map(k => env.FLOWORK_STATS.get(k.name, { type: 'json' }));
    const values = await Promise.all(pendingValues);

    const report = keys.map((k, index) => {
      const stat = values[index] || { v: 0, c: 0, u: 0 };

      const conversionRate = stat.v > 0 ? ((stat.c / stat.v) * 100).toFixed(1) : 0;

      const score = (stat.u * 2) + stat.c;

      return {
        id: k.name.replace('stats:', ''), // Buang prefix 'stats:'
        v: stat.v || 0, // Visit
        c: stat.c || 0, // Conversion
        u: stat.u || 0, // Usage
        rate: conversionRate,
        score: score
      };
    });

    report.sort((a, b) => b.score - a.score);

    return new Response(JSON.stringify({
      data: report,
      total: report.length,
      timestamp: Date.now()
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type, X-Secret-Key",
    }
  });
}
