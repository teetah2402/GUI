//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : functions/about-us.js
// FUNGSI: Native HTML Builder untuk Halaman About Us (Full Text SSR)
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

        const title = "About Us | Flowork OS";
        const desc = "Learn more about Flowork OS, our mission, and the engineering team behind the neural network ecosystem.";
        const pageUrl = `${baseUrl}/about-us`;

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
                <h1>About Flowork OS</h1>
                <p>${desc}</p>
            </header>
            <main>
                <section>
                    <h2>Our Mission</h2>
                    <p>At Flowork OS, our mission is to empower creators, developers, and everyday users with a powerful, secure, and fully client-side creative automation platform. We believe in decentralizing processing power directly to your browser.</p>
                </section>
                <section>
                    <h2>The Neural Workspace</h2>
                    <p>Flowork OS acts as a unified digital workspace where users can access dozens of high-performance micro-apps. Whether you need image conversion, secret text generation, data encryption, or workflow automation, everything runs natively and securely on your device.</p>
                </section>
                <section>
                    <h2>Privacy First</h2>
                    <p>Unlike traditional cloud services that upload your sensitive data to remote servers, Flowork OS utilizes advanced WebAssembly (WASM) and browser-based technologies. Your files, images, and texts never leave your device.</p>
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