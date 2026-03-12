/*#######################################################################
//# WEBSITE https://floworkos.com
//# File NAME : functions/blog/tag/[[catchall]].js
//# NOTE: Edge SEO Renderer khusus Halaman Tag (Mengakali Ctrl+U di SPA)
//#######################################################################*/

export async function onRequestGet(context) {
  const { request, params, env } = context;
  const url = new URL(request.url);

  // Ambil parameter tag dari URL (misal: "whatsapp-rotator")
  const pathArray = params.catchall;
  if (!pathArray || pathArray.length === 0) {
    return env.ASSETS.fetch(request);
  }

  const tagSlug = pathArray[0].toLowerCase();
  const displayTag = tagSlug.replace(/-/g, ' ').toUpperCase();

  try {
    // 1. Sedot index.html asli lo (Vue Shell)
    const htmlReq = new Request(`${url.origin}/index.html`);
    const htmlRes = await env.ASSETS.fetch(htmlReq);
    let htmlContent = await htmlRes.text();

    // 2. Operasi Paralel: Ambil data Blog & Apps secara internal
    const [blogRes, flowRes] = await Promise.all([
      env.ASSETS.fetch(new Request(`${url.origin}/content/blog/index.json`)),
      env.ASSETS.fetch(new Request(`${url.origin}/store/registry.json`))
    ]);

    let seoHtmlBlock = `<div id="seo-shadow-dom" style="display:none;" itemscope itemtype="https://schema.org/ItemList">
      <h2>Tag Archive: ${displayTag}</h2>`;

    const normalizeString = (str) => str.trim().toLowerCase().replace(/[\s-]/g, '');
    const targetCompare = normalizeString(tagSlug);

    // 3. Proses Injeksi Blog
    if (blogRes.ok) {
      const blogData = await blogRes.json();
      blogData.forEach(post => {
        if (post.keywords && Array.isArray(post.keywords)) {
          if (post.keywords.some(k => normalizeString(k) === targetCompare)) {
            seoHtmlBlock += `
              <article itemprop="itemListElement" itemscope itemtype="https://schema.org/Article">
                <a itemprop="url" href="https://floworkos.com/blog/${post.slug}">
                  <h3 itemprop="name">${post.title}</h3>
                </a>
                <p itemprop="description">${post.description || ''}</p>
                <img itemprop="image" src="https://floworkos.com${post.cover || '/images/cover.webp'}" alt="${post.title}" />
              </article>`;
          }
        }
      });
    }

    // 4. Proses Injeksi Flow Apps
    if (flowRes.ok) {
      const flowRaw = await flowRes.json();
      const apps = Array.isArray(flowRaw) ? flowRaw : (flowRaw.apps || []);
      apps.forEach(app => {
        if (app.seo && app.seo.keywords && Array.isArray(app.seo.keywords)) {
          if (app.seo.keywords.some(k => normalizeString(k) === targetCompare)) {
            const imgPath = app.seo.og_image ? `/store/${app.id || app.slug}/${app.seo.og_image}` : (app.icon || '/assets/icons/app_default.svg');
            seoHtmlBlock += `
              <article itemprop="itemListElement" itemscope itemtype="https://schema.org/SoftwareApplication">
                <a itemprop="url" href="https://floworkos.com/flow/${app.slug || app.id}">
                  <h3 itemprop="name">${app.seo.title || app.name}</h3>
                </a>
                <p itemprop="description">${app.seo.description || app.description || ''}</p>
                <img itemprop="image" src="https://floworkos.com${imgPath}" alt="${app.name}" />
              </article>`;
          }
        }
      });
    }

    seoHtmlBlock += `</div>`;

    // 5. Injeksi Title, Meta Description, dan Blok HTML ke dalam file asli
    htmlContent = htmlContent.replace('<title>Vite App</title>', `<title>Tag: ${displayTag} | Flowork OS</title>`);
    htmlContent = htmlContent.replace('</head>', `<meta name="description" content="Discover all neural modules and articles related to ${displayTag} on Flowork OS."></head>`);

    // Tanam kode HTML bayangan persis di bawah div #app
    htmlContent = htmlContent.replace('<div id="app"></div>', `<div id="app"></div>\n${seoHtmlBlock}`);

    // [MODIFIED] Set Max-Age Cache ke 86400 (1 Hari) sesuai instruksi
    return new Response(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=86400',
      }
    });

  } catch (error) {
    // Failsafe: Jika proxy hancur, balikin Vue polos tanpa modifikasi
    return env.ASSETS.fetch(request);
  }
}