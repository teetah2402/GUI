//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : functions/flow-designer.js
//#1. Edge SEO Injection: Menyuntikkan meta tag ke raw HTML (Ctrl+U / Scraper).
//#2. Dynamic Shared Preview: Membaca parameter Base64 dari workflow yang di-share.
//#######################################################################

export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const sharedData = url.searchParams.get('shared');

    // Default Meta jika tidak ada parameter shared (Mode Builder Normal)
    let meta = {
        title: "Flow Designer Workspace | Flowork OS",
        desc: "Build, automate, and execute AI workflows seamlessly in your browser using the Flowork Neural Workspace.",
        keywords: "flow designer, visual builder, node automation, flowork, custom workflow",
        img: `${url.origin}/assets/flowork-cover.webp`,
        url: url.href
    };

    // Jika URL mengandung parameter share workflow
    if (sharedData) {
        try {
            // Bongkar Base64 dari URL
            const decoded = decodeURIComponent(atob(sharedData));
            const parsed = JSON.parse(decoded);

            // [NEW] Cek jika user mengisi data SEO di Modal
            if (parsed.seo && (parsed.seo.title || parsed.seo.desc)) {
                meta.title = parsed.seo.title ? `${parsed.seo.title} | Flowork OS` : meta.title;
                meta.desc = parsed.seo.desc || meta.desc;
                meta.keywords = parsed.seo.keywords || meta.keywords;
            }
            // Fallback (Auto-generate SEO) jika form SEO kosong / share versi lama
            else if (parsed.nodes && Array.isArray(parsed.nodes) && parsed.nodes.length > 0) {
                const nodeCount = parsed.nodes.length;

                // Ambil 3 nama node pertama untuk dijadikan bahan deskripsi otomatis
                const nodeNames = parsed.nodes
                    .slice(0, 3)
                    .map(n => n.data.displayName || 'Module')
                    .join(', ');

                meta.title = `Shared Workflow (${nodeCount} Modules) | Flowork OS`;
                meta.desc = `Explore and run this custom workflow directly. This automation contains powerful modules including: ${nodeNames}.`;
                meta.keywords = "shared workflow, automation template, flowork, custom nodes";
            }
        } catch (e) {
            console.error("[SEO Builder] Gagal mem-parsing shared data:", e.message);
            // Jika gagal, biarkan menggunakan metadata default
        }
    }

    // Ambil file HTML mentah (SPA fallback) dari Cloudflare Pages
    const response = await env.ASSETS.fetch(request);
    const newResponse = new Response(response.body, response);

    // Set Cache-Control agar Edge cepat
    newResponse.headers.set('Cache-Control', 'public, max-age=60, s-maxage=60');

    // Suntikkan Meta Tags langsung ke dalam <head> HTML raw
    return new HTMLRewriter()
        .on('title', { element(e) { e.remove(); } })
        .on('meta[name="description"]', { element(e) { e.remove(); } })
        .on('meta[name="keywords"]', { element(e) { e.remove(); } })
        .on('meta[property^="og:"]', { element(e) { e.remove(); } })
        .on('meta[name^="twitter:"]', { element(e) { e.remove(); } })
        .on('head', {
            element(e) {
                e.prepend(`
                    <title>${meta.title}</title>
                    <meta name="description" content="${meta.desc}">
                    <meta name="keywords" content="${meta.keywords}">
                    <meta property="og:site_name" content="Flowork Cloud">
                    <meta property="og:type" content="website">
                    <meta property="og:url" content="${meta.url}">
                    <meta property="og:title" content="${meta.title}">
                    <meta property="og:description" content="${meta.desc}">
                    <meta property="og:image" content="${meta.img}">
                    <meta name="twitter:card" content="summary_large_image">
                    <meta name="twitter:title" content="${meta.title}">
                    <meta name="twitter:description" content="${meta.desc}">
                    <meta name="twitter:image" content="${meta.img}">
                `, { html: true });
            }
        })
        .transform(newResponse);
}