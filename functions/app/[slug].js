//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\app\[slug].js total lines 201 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

const ADSENSE_SCRIPT = `
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5071671342085199"
     crossorigin="anonymous"></script>
`;

const AD_UNIT = `
<div class="ad-wrapper" style="display:flex; justify-content:center; margin: 30px 0; min-height:280px;">
    <ins class="adsbygoogle"
         style="display:block; width: 100%; max-width: 336px; background: rgba(255,255,255,0.05); border-radius: 8px;"
         data-ad-client="ca-pub-5071671342085199"
         data-ad-slot="GANTI_DENGAN_SLOT_ID_BARU"
         data-ad-format="rectangle"
         data-full-width-responsive="true"></ins>
    <script>
         (adsbygoogle = window.adsbygoogle || []).push({});
    </script>
</div>
`;

export async function onRequestGet(context) {
  const { request, params, env } = context;
  const { slug } = params;
  const url = new URL(request.url);

  const userAgent = request.headers.get('user-agent') || '';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const platform = isMobile ? 'mobile' : 'desktop';

  const canonicalUrl = `${url.origin}/app/${slug.toLowerCase()}`;
  const DEFAULT_COVER = `${url.origin}/images/cover_default.webp?v=fallback`;

  let meta = {
    title: "Flowork | AI Workflow Automation",
    desc: "Build, train, and command AI agents.",
    img: DEFAULT_COVER,
    url: canonicalUrl
  };

  let appData = {
    name: slug,
    rating: "5.0",
    votes: "0",
    tier: "Free",
    category: "Cloud App",
    keywords: [],
    updated: new Date().toISOString().split('T')[0]
  };

  try {
    const registryUrl = `${url.origin}/${platform}/registry.json`;
    const res = await fetch(registryUrl);

    if (res.ok) {
      const data = await res.json();
      const apps = Array.isArray(data) ? data : (data.apps || []);
      const app = apps.find(a =>
        (a.id && a.id.toLowerCase() === slug.toLowerCase()) ||
        (a.slug && a.slug.toLowerCase() === slug.toLowerCase())
      );

      if (app) {
        appData.name = (app.name === app.slug || app.name === app.id) && app.seo?.title
            ? app.seo.title.split(':')[0].trim()
            : app.name;

        appData.rating = app.rating || "5.0";
        appData.votes = app.votes || "1k+";
        appData.tier = app.tier || "Free";
        appData.category = Array.isArray(app.category) ? app.category.join(", ") : (app.category || "General");
        appData.keywords = app.seo?.keywords || [];
        appData.updated = app.last_updated || appData.updated;

        const stars = "⭐⭐⭐⭐⭐";
        let tierBadge = (app.tier === 'free') ? "🔓 [FREE ACCESS]" : (app.tier === 'login') ? "👤 [LOGIN FREE]" : "💎 [PREMIUM]";

        meta.title = `${tierBadge} ${app.seo?.title || app.name}`;
        meta.desc = `${stars} (${appData.rating}) • ${appData.votes} Users Review. ${app.seo?.description || app.description}`;

        const targetCoverPath = `/${platform}/${app.slug || app.id}/cover_m_id.webp`;
        const checkUrl = new URL(targetCoverPath, url.origin);
        const checkReq = new Request(checkUrl, { method: 'HEAD' });
        const checkRes = await env.ASSETS.fetch(checkReq);
        const contentType = checkRes.headers.get("content-type") || "";

        if (checkRes.ok && contentType.includes("image")) {
            meta.img = checkUrl.href;
        }
      }
    }
  } catch (err) {
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": appData.name,
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
    },
    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": appData.rating,
        "ratingCount": appData.votes.replace(/[^0-9]/g, '') || "100"
    },
    "description": meta.desc
  };

  const response = await env.ASSETS.fetch(request);

  return new HTMLRewriter()
    .on('title', { element(e) { e.setInnerContent(meta.title); } })
    .on('meta[name="description"]', { element(e) { e.setAttribute('content', meta.desc); } })
    .on('head', {
      element(e) {
        e.append(`<link rel="canonical" href="${meta.url}">`, { html: true });

        e.append(`<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`, { html: true });

        const socialTags = `
          <meta property="og:type" content="website">
          <meta property="og:url" content="${meta.url}">
          <meta property="og:title" content="${meta.title}">
          <meta property="og:description" content="${meta.desc}">
          <meta property="og:image" content="${meta.img}">
          <meta property="og:image:alt" content="${meta.title}">
          <meta property="og:site_name" content="Flowork Apps">
          <meta name="twitter:card" content="summary_large_image">
          <meta property="twitter:domain" content="${url.hostname}">
          <meta property="twitter:url" content="${meta.url}">
          <meta property="twitter:title" content="${meta.title}">
          <meta property="twitter:description" content="${meta.desc}">
          <meta property="twitter:image" content="${meta.img}">
          `;
        e.append(socialTags, { html: true });

        e.append(ADSENSE_SCRIPT, { html: true });
      }
    })
    .on('#app', {
        element(e) {
            const tagsHtml = appData.keywords.map(k =>
                `<span style="display:inline-block; background:#2d2f45; color:#a5b3ce; padding:4px 10px; border-radius:4px; font-size:0.8rem; margin-right:5px; margin-bottom:5px;">#${k}</span>`
            ).join('');

            let staticContent = `
            <div id="app">
              <div style="max-width:800px; margin:0 auto; padding:40px; font-family:sans-serif; background:#171925; color:#e0f0ff; min-height:100vh;">
                  <h1 style="color:#54d7f6; font-size:2.5rem; margin-bottom:10px;">${appData.name}</h1>
                  <div style="color:#706bf3; margin-bottom:20px; font-size:0.9rem;">
                    Last Updated: ${appData.updated} | Category: ${appData.category}
                  </div>

                  <div style="background:#3a3962; padding:20px; border-radius:10px; margin-bottom:30px;">
                      <h2 style="color:#fff; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:10px; margin-top:0;">About This Tool</h2>
                      <p style="font-size:1.2rem; line-height:1.6; color:#e0f0ff;">${meta.desc}</p>

                      <div style="margin-top:15px;">
                        ${tagsHtml}
                      </div>

                      {{ads}}

                  </div>

                  <div style="border:1px solid #54d7f6; padding:20px; border-radius:10px; background:rgba(84, 215, 246, 0.05);">
                      <h3 style="color:#54d7f6; margin-top:0;">🚀 Access Protocol</h3>
                      <p>This application is part of the <strong>Flowork Web OS</strong> ecosystem.</p>
                      <ul style="list-style:none; padding:0;">
                        <li style="margin-bottom:8px;">⭐ <strong>Rating:</strong> ${appData.rating} / 5.0</li>
                        <li style="margin-bottom:8px;">👥 <strong>Users:</strong> ${appData.votes}</li>
                        <li style="margin-bottom:8px;">🔐 <strong>Access:</strong> ${appData.tier}</li>
                      </ul>
                      <p style="margin-top:20px; color:#54d7f6; font-style:italic; font-weight:bold;">Initializing Neural Interface... Please enable JavaScript to launch.</p>
                  </div>

                  {{ads}}

                  <div style="margin-top:40px; text-align:center;">
                      <a href="/" style="color:#54d7f6; text-decoration:none; border:1px solid #54d7f6; padding:10px 20px; border-radius:5px;">&larr; Return to Flowork OS</a>
                  </div>
              </div>
            </div>
            `;

            staticContent = staticContent.replaceAll('{{ads}}', AD_UNIT);

            e.replace(staticContent, { html: true });
        }
    })
    .transform(response);
}
