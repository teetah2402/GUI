//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : functions/privacy-policy.js
// FUNGSI: Native HTML Builder untuk Halaman Privacy Policy (Full Text SSR)
//#######################################################################

export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const baseUrl = url.origin;

    try {
        const indexRes = await env.ASSETS.fetch(new Request(`${baseUrl}/index.html`));
        const rawHtml = await indexRes.text();

        const jsMatch = rawHtml.match(/<script type="module" crossorigin src="[^"]+"><\/script>/i);
        const cssMatch = rawHtml.match(/<link rel="stylesheet" crossorigin href="[^"]+">/i);
        const vueJs = jsMatch ? jsMatch[0] : '';
        const vueCss = cssMatch ? cssMatch[0] : '';

        const title = "Privacy Policy | Flowork OS";
        const desc = "Read our privacy policy to understand how Flowork OS handles, secures, and protects your data.";
        const pageUrl = `${baseUrl}/privacy-policy`;

        const cleanHtml = `<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#000000">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

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
            <header>
                <h1>Privacy Policy</h1>
                <p>Last Updated: March 2026</p>
            </header>
            <main>
                <section>
                    <h2>1. Introduction</h2>
                    <p>Welcome to Flowork OS. We are committed to protecting your personal information and your right to privacy. This policy describes how we collect, use, and safeguard your data.</p>
                </section>
                <section>
                    <h2>2. Client-Side Processing Paradigm</h2>
                    <p>Flowork OS is uniquely designed to prioritize your privacy. The vast majority of our applications, including file converters, text generators, and media editors, perform <strong>100% of their processing client-side</strong> (within your own browser). We do not upload, view, or store your personal files on our servers.</p>
                </section>
                <section>
                    <h2>3. Information We Collect</h2>
                    <p>When you create an account, we collect basic information such as your email address and name. We may also collect anonymous, aggregated analytics data to improve user experience.</p>
                </section>
                <section>
                    <h2>4. Cookies and Local Storage</h2>
                    <p>We use local storage and essential cookies to keep you logged in and save your local preferences within the Flowork OS canvas. You can manage these settings through your browser.</p>
                </section>
            </main>
        </div>
    </div>
    ${vueJs}
</body>
</html>`;

        return new Response(cleanHtml, {
            headers: { 'Content-Type': 'text/html;charset=UTF-8', 'Cache-Control': 'public, max-age=3600' }
        });
    } catch (e) {
        return env.ASSETS.fetch(new Request(`${baseUrl}/index.html`));
    }
}