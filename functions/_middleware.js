//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : functions/_middleware.js
// FUNGSI: Global Interceptor untuk memastikan Halaman Utama (/) di-Render secara Native SSR
//#######################################################################

export async function onRequest(context) {
    const { request, env, next } = context;
    const url = new URL(request.url);

    // 1. CEGAT HANYA UNTUK HALAMAN UTAMA (Root /)
    if (url.pathname === '/' || url.pathname === '') {
        try {
            // Ambil index.html mentah dari server Cloudflare untuk ekstrak CSS/JS
            const assetUrl = new URL('/index.html', url.origin);
            const indexRes = await env.ASSETS.fetch(new Request(assetUrl));
            let rawHtml = '';

            if (indexRes.ok) {
                rawHtml = await indexRes.text();
            }

            // Ekstrak CSS & JS Vue
            const jsMatch = rawHtml.match(/<script type="module" crossorigin src="[^"]+"><\/script>/i);
            const cssMatch = rawHtml.match(/<link rel="stylesheet" crossorigin href="[^"]+">/i);
            const vueJs = jsMatch ? jsMatch[0] : '';
            const vueCss = cssMatch ? cssMatch[0] : '';

            // Siapkan Meta Data SEO Halaman Utama
            const title = "Flowork OS | The Creative Automation Platform";
            const desc = "Flowork OS is an advanced neural workspace and creative automation platform. Discover micro-apps, build powerful workflows, and automate your digital tasks securely.";
            const pageUrl = url.origin;

            // RAKIT HTML SUPER BERSIH DARI NOL
            const cleanHtml = `<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#000000">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="manifest" href="/site.webmanifest">

    <title>${title}</title>
    <meta name="description" content="${desc}">
    <meta name="keywords" content="Flowork, Flowork OS, creative automation, neural workspace, micro-apps, workflow automation, digital tools, privacy tools">

    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${desc}">
    <meta property="og:url" content="${pageUrl}">
    <meta property="og:type" content="website">
    <meta property="og:image" content="${pageUrl}/images/cover_default.webp">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${desc}">
    <meta name="twitter:image" content="${pageUrl}/images/cover_default.webp">
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
                <h1>Flowork OS</h1>
                <p>The Creative Automation Platform</p>
            </header>

            <main>
                <section>
                    <h2>Welcome to the Neural Workspace</h2>
                    <p>${desc}</p>
                    <a href="/register">Get Started for Free</a>
                    <a href="/login">Sign In to Dashboard</a>
                </section>

                <section>
                    <h2>Explore the Micro-App Ecosystem</h2>
                    <p>Access an extensive library of high-performance utilities natively running in your browser. From image encryption and secret text generators to video processing and workflow automation.</p>
                    <ul>
                        <li><a href="/store">Browse App Store</a></li>
                        <li><a href="/canvas">Workflow Canvas</a></li>
                        <li><a href="/blog">News & Updates</a></li>
                    </ul>
                </section>

                <section>
                    <h2>Why Choose Flowork OS?</h2>
                    <ul>
                        <li><strong>Client-Side Architecture:</strong> Maximum privacy. Your data stays on your device.</li>
                        <li><strong>Zero Configuration:</strong> No complex installations. Just click and deploy.</li>
                        <li><strong>Modular Workflows:</strong> Connect different tools together seamlessly.</li>
                    </ul>
                </section>
            </main>

            <footer>
                <p>&copy; 2026 Flowork OS Ecosystem. All rights reserved.</p>
                <nav>
                    <a href="/about-us">About Us</a> |
                    <a href="/contact-us">Contact</a> |
                    <a href="/privacy-policy">Privacy Policy</a> |
                    <a href="/terms-of-service">Terms of Service</a> |
                    <a href="/dmca">DMCA</a>
                </nav>
            </footer>
        </div>
    </div>

    ${vueJs}
</body>
</html>`;

            return new Response(cleanHtml, {
                headers: {
                    'Content-Type': 'text/html;charset=UTF-8',
                    'Cache-Control': 'public, max-age=60' // Cache 1 menit untuk amannya
                }
            });

        } catch (e) {
            console.error("Middleware Index Build Error:", e);
            // Lanjutkan jika terjadi error
            return next();
        }
    }

    // 2. JIKA BUKAN HALAMAN UTAMA, BIARKAN BERJALAN NORMAL KE FUNGSI LAIN ATAU ASET STATIS
    return next();
}