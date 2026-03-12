//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : functions/dmca.js
// FUNGSI: Native HTML Builder untuk Halaman DMCA (Full Text SSR)
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

        const title = "DMCA Policy | Flowork OS";
        const desc = "Information regarding the Digital Millennium Copyright Act and intellectual property protection on Flowork OS.";
        const pageUrl = `${baseUrl}/dmca`;

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
                <h1>DMCA Notice & Takedown Policy</h1>
                <p>${desc}</p>
            </header>
            <main>
                <section>
                    <h2>1. Reporting Copyright Infringements</h2>
                    <p>Flowork OS respects the intellectual property rights of others. If you believe that your copyrighted work has been copied in a way that constitutes copyright infringement and is accessible via this platform, please notify us immediately.</p>
                </section>
                <section>
                    <h2>2. Requirements for a DMCA Notice</h2>
                    <p>For your complaint to be valid under the DMCA, you must provide the following information in writing:</p>
                    <ul>
                        <li>An electronic or physical signature of a person authorized to act on behalf of the copyright owner.</li>
                        <li>Identification of the copyrighted work that you claim has been infringed.</li>
                        <li>Identification of the material that is claimed to be infringing and where it is located on the Flowork OS network.</li>
                        <li>Information reasonably sufficient to permit us to contact you, such as your address, telephone number, and e-mail address.</li>
                    </ul>
                </section>
                <section>
                    <h2>3. Submit Your Notice</h2>
                    <p>Please send your complete DMCA takedown notice to our designated copyright agent at: <strong>dmca@floworkos.com</strong></p>
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