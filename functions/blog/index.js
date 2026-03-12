//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : functions/blog/index.js
// FUNGSI: Native HTML Builder untuk Halaman Utama Blog
//#######################################################################

export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    try {
        // 1. Ekstrak CSS & JS Vue
        const indexRes = await env.ASSETS.fetch(new Request(`${baseUrl}/index.html`));
        let rawHtml = await indexRes.text();

        const jsMatch = rawHtml.match(/<script type="module" crossorigin src="[^"]+"><\/script>/i);
        const cssMatch = rawHtml.match(/<link rel="stylesheet" crossorigin href="[^"]+">/i);
        const vueJs = jsMatch ? jsMatch[0] : '';
        const vueCss = cssMatch ? cssMatch[0] : '';

        // 2. Ambil data list blog
        const blogRes = await fetch(`${baseUrl}/content/blog/index.json`);

        if (blogRes.ok) {
            const blogs = await blogRes.json();

            // Urutkan artikel dari terbaru
            blogs.sort((a, b) => new Date(b.date) - new Date(a.date));

            const title = "News & Updates | Flowork OS";
            const desc = "Release notes, technical insights, and development updates from the Flowork neural network.";
            const pageUrl = `${baseUrl}/blog`;

            // 3. Rakit List Artikel
            let listHtml = blogs.map(post => `
                <article>
                    <h2><a href="/blog/${post.slug}">${post.title}</a></h2>
                    <time>${post.date}</time>
                    <p>${post.description}</p>
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
        <div class="visually-hidden">
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
        }

        return env.ASSETS.fetch(new Request(`${baseUrl}/index.html`));

    } catch (e) {
        return env.ASSETS.fetch(new Request(`${baseUrl}/index.html`));
    }
}