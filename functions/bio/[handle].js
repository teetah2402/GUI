//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\bio\[handle].js total lines 152 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

/**
 * NEXUS BIO - PUBLIC RENDERER (AUTO-DELETE LOGIC)
 * Fitur: Tampilan Benar + Perpanjang Umur Data (Keep-Alive)
 */

export async function onRequest(context) {
    const { params, env, request } = context;
    const handle = params.handle;
    const url = new URL(request.url);
    const origin = url.origin;

    const rawData = await env.GHOST_VAULT.get(`bio:${handle}`);

    if (!rawData) {
        return new Response(render404(), {
            status: 404,
            headers: { 'Content-Type': 'text/html' }
        });
    }

    context.waitUntil(
        env.GHOST_VAULT.put(`bio:${handle}`, rawData, {
            expirationTtl: 7776000 // Reset timer ke 90 Hari
        })
    );

    const data = JSON.parse(rawData);

    const name = data.name || handle;
    const bio = data.bio || "";
    const avatar = data.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=" + handle;
    const themeId = data.theme || 'glass';
    const links = data.links || [];

    let themeCSS = '';

    try {
        const themeUrl = `${origin}/store/nexus-link/themes/${themeId}.js`;
        const themeReq = await fetch(themeUrl);

        if (themeReq.ok) {
            const scriptContent = await themeReq.text();
            const match = scriptContent.match(/css:\s*(?:\(.*\)\s*=>\s*)?`([\s\S]*?)`/);
            if (match && match[1]) {
                themeCSS = match[1];
            } else {
                themeCSS = getFallbackCSS();
            }
        } else {
            themeCSS = getFallbackCSS();
        }
    } catch (e) {
        themeCSS = getFallbackCSS();
    }

    const html = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>${name}</title>
    <meta name="description" content="${bio}">

    <meta property="og:title" content="${name}">
    <meta property="og:image" content="${avatar}">

    <script src="https://unpkg.com/lucide@latest"></script>

    <style>
        /* RESET & BASE */
        :root { --app-height: 100vh; }
        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }

        /* [ADDED] Visual Decorator Sync with Preview */
        body {
            background-color: #050505;
            position: relative;
            min-height: 100vh;
        }

        body::before {
            content: "";
            position: fixed;
            inset: 0;
            opacity: 0.2;
            background-image: radial-gradient(#333 1px, transparent 1px);
            background-size: 24px 24px;
            pointer-events: none;
            z-index: 0;
        }

        /* INJECTED THEME CSS */
        ${themeCSS}

        /* OVERRIDE JAGA-JAGA */
        img { max-width: 100%; display: block; }
        a { text-decoration: none; color: inherit; }
        .container { position: relative; z-index: 1; }
    </style>
</head>
<body>

    <div class="container">

        <img src="${avatar}" alt="${name}" class="avatar">

        <h1>${name}</h1>
        <p>${bio}</p>

        <div class="links-wrapper" style="width: 100%;">
            ${links.map(link => `
                <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="link-card">
                    ${link.icon ? `<i data-lucide="${link.icon}" style="display:inline-block; vertical-align:middle; margin-right:8px; width:18px;"></i>` : ''}
                    <span>${link.title}</span>
                </a>
            `).join('')}
        </div>

        <div style="margin-top: 40px; opacity: 0.5; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; text-align: center;">
            Nexus Bio
        </div>

    </div>

    <script>
        lucide.createIcons();
    </script>
</body>
</html>`;

    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

function render404() {
    return `<!DOCTYPE html><html><body style="background:#000;color:#fff;display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif"><h1>404 | Bio Expired or Not Found</h1></body></html>`;
}

function getFallbackCSS() {
    return `
        body { background: #111; color: #fff; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; padding: 40px 20px; }
        .container { max-width: 400px; width: 100%; text-align: center; }
        .avatar { width: 100px; height: 100px; border-radius: 50%; margin: 0 auto 20px; background: #333; object-fit: cover; }
        .link-card { display: block; padding: 15px; margin: 10px 0; background: #222; border: 1px solid #333; border-radius: 8px; color: #fff; font-weight: bold; }
    `;
}
