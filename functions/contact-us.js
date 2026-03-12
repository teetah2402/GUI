//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : functions/contact-us.js
// FUNGSI: Native HTML Builder untuk Halaman Contact Us (Full Text SSR)
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

        const title = "Contact Us | Flowork OS";
        const desc = "Get in touch with the Flowork OS support and engineering team for assistance and inquiries.";
        const pageUrl = `${baseUrl}/contact-us`;

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
                <h1>Contact Us</h1>
                <p>${desc}</p>
            </header>
            <main>
                <section>
                    <h2>Get in Touch</h2>
                    <p>Have questions about Flowork OS, need help with a micro-app, or want to explore partnership opportunities? Our team is ready to assist you.</p>
                </section>
                <section>
                    <h2>General Inquiries</h2>
                    <p>Email: support@floworkos.com</p>
                    <p>For bug reports, please include your browser version, operating system, and steps to reproduce the issue.</p>
                </section>
                <section>
                    <h2>Send a Message</h2>
                    <form action="#" method="POST">
                        <label for="name">Your Name</label>
                        <input type="text" id="name" name="name" required />

                        <label for="email">Email Address</label>
                        <input type="email" id="email" name="email" required />

                        <label for="message">Message</label>
                        <textarea id="message" name="message" required></textarea>

                        <button type="submit">Send Message</button>
                    </form>
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