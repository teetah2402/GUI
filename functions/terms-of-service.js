//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : functions/terms-of-service.js
// FUNGSI: Native HTML Builder untuk Halaman Terms of Service (Full Text SSR)
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

        const title = "Terms of Service | Flowork OS";
        const desc = "Review the terms and conditions for using the Flowork OS platform and its micro-applications.";
        const pageUrl = `${baseUrl}/terms-of-service`;

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
                <h1>Terms of Service</h1>
                <p>Last Updated: March 2026</p>
            </header>
            <main>
                <section>
                    <h2>1. Acceptance of Terms</h2>
                    <p>By accessing and using Flowork OS, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use this service.</p>
                </section>
                <section>
                    <h2>2. Use of Service</h2>
                    <p>Flowork OS provides a suite of tools and micro-apps intended for personal, creative, and professional use. You agree not to use the platform for any illegal or unauthorized purpose.</p>
                </section>
                <section>
                    <h2>3. Intellectual Property Rights</h2>
                    <p>All source code, designs, and content provided natively by Flowork OS remain the intellectual property of Flowork OS. However, any content you generate or process using our tools remains entirely yours.</p>
                </section>
                <section>
                    <h2>4. Disclaimer of Warranties</h2>
                    <p>The service is provided on an "as is" and "as available" basis without any warranties of any kind, either express or implied, including but not limited to warranties of merchantability or fitness for a particular purpose.</p>
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