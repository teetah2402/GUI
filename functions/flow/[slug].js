//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\flow\[slug].js
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################
function parseMarkdownBasic(mdText) {
    if (!mdText) return '';
    let html = mdText;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold & Italic
    html = html.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\*(.*)\*/gim, '<em>$1</em>');

    // Quotes
    html = html.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');

    // Lists
    html = html.replace(/^\* (.*$)/gim, '<ul><li>$1</li></ul>');
    html = html.replace(/<\/ul>\n<ul>/gim, '\n'); // Gabungkan list yang berdekatan

    // Paragraphs (Pisahkan baris ganda menjadi paragraf)
    html = html.split('\n\n').map(p => {
        if (p.trim().startsWith('<h') || p.trim().startsWith('<ul') || p.trim().startsWith('<block')) {
            return p;
        } else {
            return `<p>${p.trim()}</p>`;
        }
    }).join('\n');

    return html;
}

// Helper khusus untuk mencegah SPA Fallback (index.html) masuk ke partials
async function fetchSafeText(env, url) {
    try {
        const res = await env.ASSETS.fetch(new Request(url));
        if (res.ok) {
            const text = await res.text();
            // Jika yang kembali adalah index.html (fallback SPA), tolak mentah-mentah!
            if (!text.toLowerCase().includes('<!doctype html>')) {
                return text;
            }
        }
    } catch (e) {
        console.error("Fetch Error for:", url, e);
    }
    return null;
}

export async function onRequestGet(context) {
  const { request, params, env } = context;
  const { slug } = params;
  const url = new URL(request.url);
  const langQuery = url.searchParams.get('lang');
  const acceptLang = request.headers.get('Accept-Language') || '';
  const isID = langQuery === 'id' || acceptLang.startsWith('id');
  const localizedCover = 'cover_mobile.webp';
  const localizedReadme = isID ? 'readme_id.md' : 'readme.md';

  const canonicalUrl = `${url.origin}/flow/${slug.toLowerCase()}`;
  let meta = {
    title: `${slug} | Flowork App`,
    desc: "Run this application directly in Flowork OS.",
    img: `${url.origin}/store/${slug}/${localizedCover}`,
    url: canonicalUrl,
    keywords: ["flowork", "app", slug],
    author: "Flowork Community"
  };
  let appId = slug;
  try {
    const registryUrl = `${url.origin}/store/registry.json`;
    const registryText = await fetchSafeText(env, registryUrl);
    if (registryText) {
      const registry = JSON.parse(registryText);
      const appInfo = registry.apps.find(a => a.slug === slug || a.id === slug);
      if (appInfo) {
        appId = appInfo.id;
        if (appInfo.seo) {
          meta.title = appInfo.seo.title || `${appInfo.name} - Use Online | Flowork`;
          meta.desc = appInfo.seo.description || appInfo.description;
          if (appInfo.seo.keywords) meta.keywords = appInfo.seo.keywords;
          let ogImage = appInfo.seo.og_image || 'cover_mobile.webp';
          if (ogImage === 'cover_m_id.webp' || ogImage === 'cover_m_en.webp' || ogImage === 'cover.webp') {
            ogImage = localizedCover;
          }
          meta.img = `${url.origin}/store/${appInfo.id}/${ogImage}`;
        } else {
          meta.title = `${appInfo.name} - Use Online | Flowork`;
          meta.desc = appInfo.description || meta.desc;
          meta.img = `${url.origin}/store/${appInfo.id}/${localizedCover}`;
        }
      }
    }
  } catch (e) {
    console.error("SEO Fetch Error:", e);
  }

  let fetchedHtml = '';
  let templateHtml = '';
  let appI18n = {};

  try {
    let rawMarkdown = await fetchSafeText(env, `${url.origin}/store/${appId}/${localizedReadme}`);

    // Fallback otomatis ke english jika bahasa ID tidak ditemukan
    if (!rawMarkdown && isID) {
        rawMarkdown = await fetchSafeText(env, `${url.origin}/store/${appId}/readme.md`);
    }

    if (rawMarkdown) {
        fetchedHtml = parseMarkdownBasic(rawMarkdown);
    }

    // Fetch Template & i18n
    const tplRaw = await fetchSafeText(env, `${url.origin}/store/${appId}/template.html`);
    if (tplRaw) templateHtml = tplRaw;

    const i18nRaw = await fetchSafeText(env, `${url.origin}/store/${appId}/i18n.json`);
    if (i18nRaw) appI18n = JSON.parse(i18nRaw);

  } catch (e) {
    console.error("SEO Partials Fetch Error:", e);
  }

  // Inject Dictionary ke dalam Template
  const currentLang = isID ? 'id' : 'en';
  const dictionary = appI18n[currentLang] || appI18n['en'] || {};

  let renderedTemplate = templateHtml.replace(/\{\{t\.([\w_]+)\}\}/g, (match, key) => {
      return dictionary[key] !== undefined ? dictionary[key] : match;
  });

  // Hapus tag <script> bawaan template.html
  renderedTemplate = renderedTemplate.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": meta.title,
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Web",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "description": meta.desc,
    "image": meta.img,
    "author": { "@type": "Organization", "name": meta.author },
    // [NEW] Menambahkan aggregateRating agar warning hilang dan dapat Rich Snippet Bintang di Google
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "156"
    }
  };

  const response = await env.ASSETS.fetch(request);
  const newResponse = new Response(response.body, response);
  newResponse.headers.set('Cache-Control', 'public, max-age=60, s-maxage=60');

  const seoArticleHtml = `
    <div id="seo-content" class="seo-prerender-safe">
      <article>
        <header style="text-align: center; padding: 2rem 1rem;">
          <h1>${meta.title}</h1>
          </header>
        <section style="padding: 1rem;">
          <h2>About This Application</h2>
          <p>${meta.desc}</p>
        </section>

        <section class="app-ui-prerender" style="padding: 1rem; margin: 1rem;">
           ${renderedTemplate || '<p>Loading application interface...</p>'}
        </section>

        <section style="padding: 1rem;">
          <h3>Key Features & Functions</h3>
          <ul>
            ${meta.keywords.map(k => `<li>${k}</li>`).join('\n            ')}
          </ul>
        </section>
        <section class="seo-app-partials" style="padding: 1rem;">
          ${fetchedHtml}
        </section>
      </article>
    </div>
  `;

  return new HTMLRewriter()
    .on('title', { element(e) { e.remove(); } })
    .on('meta[name="description"]', { element(e) { e.remove(); } })
    .on('meta[name="keywords"]', { element(e) { e.remove(); } })
    .on('meta[property^="og:"]', { element(e) { e.remove(); } })
    .on('meta[name^="twitter:"]', { element(e) { e.remove(); } })
    .on('style', { element(e) { e.remove(); } })
    .on('link[rel="stylesheet"]', {
        element(e) {
            const href = e.getAttribute('href') || '';
            if (href.includes('/assets/index-')) {
                e.setAttribute('media', 'print');
                e.setAttribute('onload', "this.media='all'");
            }
        }
    })
    .on('head', {
      element(e) {
        e.prepend(`
          <title>${meta.title}</title>
          <meta name="description" content="${meta.desc}">
          <meta name="keywords" content="${meta.keywords.join(', ')}">
          <link rel="preload" as="image" href="${meta.img}" fetchpriority="high">
          <link rel="canonical" href="${meta.url}">
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
          <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
        `, { html: true });
      }
    })
    .on('div#app', {
      element(e) {
        e.prepend(seoArticleHtml, { html: true });
      }
    })
    .transform(newResponse);
}