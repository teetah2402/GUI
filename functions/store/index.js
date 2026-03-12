//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : functions/store/index.js
// FUNGSI: Native HTML Builder untuk Halaman Utama App Store (Ctrl+U Visibility)
//#######################################################################

export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const baseUrl = url.origin;

    try {
        // 1. Ekstrak CSS & JS Vue dari index.html
        const indexRes = await env.ASSETS.fetch(new Request(`${baseUrl}/index.html`));
        const rawHtml = await indexRes.text();

        const jsMatch = rawHtml.match(/<script type="module" crossorigin src="[^"]+"><\/script>/i);
        const cssMatch = rawHtml.match(/<link rel="stylesheet" crossorigin href="[^"]+">/i);
        const vueJs = jsMatch ? jsMatch[0] : '';
        const vueCss = cssMatch ? cssMatch[0] : '';

        // 2. Ambil data list aplikasi dari registry.json
        const registryRes = await env.ASSETS.fetch(new Request(`${baseUrl}/store/registry.json`));

        let appsList = [];
        if (registryRes.ok) {
            const registryData = await registryRes.json();
            appsList = registryData.apps || [];
        }

        const title = "App Store | Flowork OS";
        const desc = "Discover and explore powerful micro-apps, utilities, and workflows in the Flowork OS ecosystem.";
        const pageUrl = `${baseUrl}/store`;

        // 3. Rakit List Aplikasi (Dilengkapi data dari SEO description)
        let listHtml = appsList.map(app => `
            <article>
                <h2><a href="/flow/${app.id}">${app.name}</a></h2>
                <p>${app.seo?.description || app.description || ''}</p>
            </article>
        `).join('\n');

        // 4. BIKIN HTML SUPER BERSIH DARI AWAL
        const cleanHtml = `<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#000000">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

    <title>${title}</title>
    <meta name="description" content="${desc}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${desc}">
    <meta property="og:url" content="${pageUrl}">
    <meta property="og:type" content="website">
    <link rel="canonical" href="${pageUrl}" />

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css" rel="stylesheet">

    ${vueCss}

    <style>
        body { background-color: #000000; color: #ffffff; margin: 0; padding: 0; font-family: 'Inter', sans-serif; }
        .visually-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0; }
    </style>
</head>
<body>
    <div id="app">
        <div id="seo-content" class="visually-hidden">
            <h1>${title}</h1>
            <p>${desc}</p>
            <main>
                ${listHtml}
            </main>
        </div>
    </div>

    ${vueJs}
</body>
</html>`;

        return new Response(cleanHtml, {
            headers: {
                'Content-Type': 'text/html;charset=UTF-8',
                'Cache-Control': 'public, max-age=3600'
            }
        });

    } catch (e) {
        console.error("Store Build Error:", e);
        return env.ASSETS.fetch(new Request(`${url.origin}/index.html`));
    }
}