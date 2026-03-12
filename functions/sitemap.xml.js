//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\sitemap.xml.js
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

export async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    try {
        let apps = [];
        try {
            const appRegistryRes = await fetch(`${baseUrl}/store/registry.json`);
            if (appRegistryRes.ok) {
                const data = await appRegistryRes.json();
                apps = Array.isArray(data) ? data : (data.apps || []);
            }
        } catch (e) {
        }

        // TAMBAHAN: Fetch Blog Data
        let blogs = [];
        try {
            const blogRes = await fetch(`${baseUrl}/content/blog/index.json`);
            if (blogRes.ok) {
                blogs = await blogRes.json();
            }
        } catch (e) {
        }

        let xml = `<?xml version="1.0" encoding="UTF-8"?>`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

        xml += `<url><loc>${baseUrl}/</loc><priority>1.0</priority></url>`;
        xml += `<url><loc>${baseUrl}/store</loc><priority>1.0</priority></url>`;

        // TAMBAHAN: Sitemap Flow Designer (Builder Workspace)
        xml += `<url><loc>${baseUrl}/flow-designer</loc><priority>0.9</priority></url>`;

        // TAMBAHAN: Sitemap Blog Index
        xml += `<url><loc>${baseUrl}/blog</loc><priority>0.9</priority></url>`;

        xml += `<url><loc>${baseUrl}/login</loc><priority>0.8</priority></url>`;
        xml += `<url><loc>${baseUrl}/register</loc><priority>0.8</priority></url>`;

        xml += `<url><loc>${baseUrl}/about-us</loc><priority>0.7</priority></url>`;
        xml += `<url><loc>${baseUrl}/contact-us</loc><priority>0.7</priority></url>`;

        xml += `<url><loc>${baseUrl}/dmca</loc><priority>0.5</priority></url>`;
        xml += `<url><loc>${baseUrl}/privacy-policy</loc><priority>0.5</priority></url>`;
        xml += `<url><loc>${baseUrl}/terms-of-service</loc><priority>0.5</priority></url>`;

        if (apps) {
            for (const app of apps) {
                const slug = app.slug || app.id;
                const url = `${baseUrl}/flow/${slug}`;
                const appPriority = app.popular === 'yes' ? '1.0' : '0.8';
                xml += `<url><loc>${url}</loc><priority>${appPriority}</priority></url>`;
            }
        }

        // TAMBAHAN: Looping URL Blog Artikel
        if (blogs) {
            for (const post of blogs) {
                const url = `${baseUrl}/blog/${post.slug}`;
                xml += `<url><loc>${url}</loc><priority>0.8</priority></url>`;
            }
        }

        xml += `</urlset>`;

        return new Response(xml, {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, max-age=3600' // Cache 1 jam
            }
        });

    } catch (e) {
        return new Response(e.message, { status: 500 });
    }
}