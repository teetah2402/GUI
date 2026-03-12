//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : functions/blog/[slug].js
// FUNGSI: Native HTML Builder & SSR Content Injector (Bebas index.html kotor)
//#######################################################################

export async function onRequestGet(context) {
    const { request, env, params } = context;
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    const slug = params.slug;

    try {
        // 1. Panggil index.html HANYA untuk mengekstrak link JS & CSS bawaan Vue
        const indexRes = await env.ASSETS.fetch(new Request(`${baseUrl}/index.html`));
        let rawHtml = await indexRes.text();

        // [OLD] const jsMatch = rawHtml.match(/<script type="module" crossorigin src="[^"]+"><\/script>/i);
        // [OLD] const cssMatch = rawHtml.match(/<link rel="stylesheet" crossorigin href="[^"]+">/i);
        // [OLD] const vueJs = jsMatch ? jsMatch[0] : '';
        // [OLD] const vueCss = cssMatch ? cssMatch[0] : '';

        // [NEW] Ekstrak SEMUA file aset Vue (karena sekarang di-split jadi banyak file vendor)
        const jsMatches = rawHtml.match(/<script type="module" crossorigin src="[^"]+"><\/script>/gi) || [];
        const cssMatches = rawHtml.match(/<link rel="stylesheet" crossorigin href="[^"]+">/gi) || [];

        const vueJs = jsMatches.join('\n');

        // [NEW] Ubah semua CSS Vite menjadi non-blocking (async) untuk LCP skor hijau
        const vueCss = cssMatches.map(link => {
            return link.replace('rel="stylesheet"', 'rel="stylesheet" media="print" onload="this.media=\'all\'"');
        }).join('\n');

        // 2. Ambil data artikel & data Flow Apps untuk Cross-Linking
        const blogRes = await fetch(`${baseUrl}/content/blog/index.json`);

        // Sedot data Flow App Store
        const flowRes = await fetch(`${baseUrl}/store/registry.json`);
        let flowApps = [];
        if (flowRes.ok) {
            const rawFlow = await flowRes.json();
            flowApps = Array.isArray(rawFlow) ? rawFlow : (rawFlow.apps || []);
        }

        if (blogRes.ok) {
            const blogs = await blogRes.json();
            const post = blogs.find(b => b.slug === slug);

            if (post) {
                const title = `${post.title} | Flowork OS`;
                const desc = post.description || 'Flowork OS Engineering Log & Updates.';
                const image = post.cover ? `${baseUrl}${post.cover}` : `${baseUrl}/images/cover.webp`;
                const postUrl = `${baseUrl}/blog/${slug}`;

                // Bangun struktur Schema JSON-LD untuk Breadcrumbs (SEO Booster)
                const breadcrumbJsonLd = {
                    "@context": "https://schema.org",
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
                        { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${baseUrl}/blog` },
                        { "@type": "ListItem", "position": 3, "name": post.title, "item": postUrl }
                    ]
                };

                // 3. Konversi Markdown (.md) ke HTML
                let htmlArticleBody = '';
                try {
                    const targetUrl = post.raw_url ? post.raw_url : `${baseUrl}/content/blog/${slug}.md`;
                    const mdRes = await fetch(targetUrl);

                    if (mdRes.ok) {
                        let rawMd = await mdRes.text();

                        rawMd = rawMd.replace(/[\u200B-\u200D\uFEFF\u200E\u200F\u202A-\u202E\u2060-\u2064]/g, '');

                        let mdBody = rawMd;
                        if (rawMd.startsWith('---')) {
                            const parts = rawMd.split('---');
                            if (parts.length >= 3) {
                                mdBody = parts.slice(2).join('---').trim();
                            }
                        }

                        mdBody = mdBody.replace(/\r\n/g, '\n');
                        mdBody = mdBody.replace(/^### (.*$)/gim, '<h3>$1</h3>');
                        mdBody = mdBody.replace(/^## (.*$)/gim, '<h2>$1</h2>');
                        mdBody = mdBody.replace(/^# (.*$)/gim, '<h1>$1</h1>');
                        mdBody = mdBody.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
                        mdBody = mdBody.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>');

                        htmlArticleBody = mdBody.split('\n\n').map(p => {
                            p = p.trim();
                            if (!p) return '';
                            if (p.startsWith('<h') || p.startsWith('<ul') || p.startsWith('<li')) return p;
                            return `<p>${p}</p>`;
                        }).join('\n');

                        let keywordMap = {};

                        blogs.forEach(b => {
                            if (b.slug !== slug && b.keywords && Array.isArray(b.keywords)) {
                                b.keywords.forEach(k => {
                                    if (k.length > 2) {
                                        let key = k.trim().toLowerCase();
                                        if (!keywordMap[key]) keywordMap[key] = [];
                                        keywordMap[key].push({ url: `/blog/${b.slug}` });
                                    }
                                });
                            }
                        });

                        flowApps.forEach(app => {
                            if (app.seo && app.seo.keywords && Array.isArray(app.seo.keywords)) {
                                app.seo.keywords.forEach(k => {
                                    if (k.length > 2) {
                                        let key = k.trim().toLowerCase();
                                        if (!keywordMap[key]) keywordMap[key] = [];
                                        keywordMap[key].push({ url: `/flow/${app.slug || app.id}` });
                                    }
                                });
                            }
                        });

                        let availableKeywords = Object.keys(keywordMap).sort((a, b) => b.length - a.length);
                        let usedKeywords = new Set();

                        availableKeywords.forEach(k => {
                            if (usedKeywords.has(k)) return;

                            const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                            const regex = new RegExp(`(?![^<]+>|[^<]*<\\/a>)\\b(${escapeRegExp(k)})\\b`, 'i');

                            if (htmlArticleBody.match(regex)) {
                                usedKeywords.add(k);
                                const link = keywordMap[k][0].url;

                                htmlArticleBody = htmlArticleBody.replace(regex, `<a href="${baseUrl}${link}">$1</a>`);
                            }
                        });
                    }
                } catch (err) {
                    console.log('Failed to parse markdown');
                }

                // 4. RAKIT KERANGKA HTML SUPER BERSIH DARI AWAL
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
    <meta property="og:image" content="${image}">
    <meta property="og:url" content="${postUrl}">
    <meta property="og:type" content="article">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${desc}">
    <meta name="twitter:image" content="${image}">
    <link rel="canonical" href="${postUrl}" />

    <script type="application/ld+json">${JSON.stringify(breadcrumbJsonLd)}</script>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">

    <link href="https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css" rel="stylesheet" media="print" onload="this.media='all'">
    <noscript><link href="https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css" rel="stylesheet"></noscript>

    ${vueCss}

    <style>
        body { background-color: #000000; color: #ffffff; margin: 0; padding: 0; font-family: 'Inter', sans-serif; }
        .visually-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0; }
    </style>
</head>
<body>
    <div id="app">
        <div class="visually-hidden">
            <nav aria-label="breadcrumb">
                <ol>
                    <li><a href="${baseUrl}">Home</a></li>
                    <li><a href="${baseUrl}/blog">Blog</a></li>
                    <li><span aria-current="page">${post.title}</span></li>
                </ol>
            </nav>
            <article itemscope itemtype="https://schema.org/Article">
                <header>
                    <h1 itemprop="headline">${post.title}</h1>
                    <p>Published on <time itemprop="datePublished" datetime="${post.date}">${post.date}</time></p>
                    <img src="${image}" alt="${post.title}" itemprop="image" />
                </header>
                <div itemprop="articleBody">
                    ${htmlArticleBody}
                </div>
            </article>
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
        }

        return env.ASSETS.fetch(new Request(`${baseUrl}/index.html`));

    } catch (e) {
        return env.ASSETS.fetch(new Request(`${baseUrl}/index.html`));
    }
}