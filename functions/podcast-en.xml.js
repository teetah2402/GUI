export async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url);
    const domain = `${url.protocol}//${url.hostname}`;
    const lang = "en";

    try {
        const response = await fetch(`${domain}/store/registry.json`);
        const registry = await response.json();

        let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>FloworkOS Insight (English)</title>
    <link>${domain}</link>
    <language>en-US</language>
    <itunes:author>FloworkOS Global</itunes:author>
    <description>Official FloworkOS automation tutorials and Web OS insights for global users.</description>
    <itunes:image href="${domain}/images/podcast-master-en.jpg" />

    <itunes:owner>
      <itunes:name>FloworkOS Team</itunes:name>
      <itunes:email>awenkforex@gmail.com</itunes:email>
    </itunes:owner>

    <itunes:category text="Technology" />
    <itunes:explicit>false</itunes:explicit>`;

    if (registry.apps) {
        for (const app of registry.apps) {
            const data = app.podcast?.[lang];

            // [MODIFIED] Filter tambahan: Hanya render jika app.audio bernilai "yes"
            // (Memastikan jika lupa menambahkan "audio": "yes" di registry, item tidak akan di-generate)
            if (data && app.audio === "yes") {
                // BACKLINK: Mengarah langsung ke rute fungsional /flow/
                const appUrl = `${domain}/flow/${app.id}`;

                // [ZOMBIE] const coverUrl = `${domain}${app.path}/${data.image || "cover_en.webp"}`;
                // [ADD] Patenkan menggunakan cover.webp
                const coverUrl = `${domain}${app.path}/${data.image || "cover.webp"}`;

                // SEO: Anchor text dinamis menggunakan Nama Aplikasi
                const seoDesc = `${data.description} <br><br> 🔥 <strong>Try this tool now: <a href="${appUrl}">Launch ${app.name} on FloworkOS.com</a></strong>`;

                rss += `
    <item>
      <title>${data.title}</title>
      <itunes:author>FloworkOS Team</itunes:author>
      <itunes:summary><![CDATA[${data.description}]]></itunes:summary>
      <description><![CDATA[${seoDesc}]]></description>
      <content:encoded><![CDATA[${seoDesc}]]></content:encoded>
      <enclosure url="${data.audio_url}" length="5000000" type="audio/mpeg" />
      <guid isPermaLink="true">${appUrl}#en</guid>
      <pubDate>${app.last_updated ? new Date(app.last_updated).toUTCString() : new Date().toUTCString()}</pubDate>
      <itunes:image href="${coverUrl}" />
      <itunes:explicit>false</itunes:explicit>
    </item>`;
            }
        }
    }
    rss += `</channel></rss>`;
    return new Response(rss, { headers: { "Content-Type": "text/xml;charset=UTF-8" } });
    } catch (e) { return new Response(e.message, { status: 500 }); }
}