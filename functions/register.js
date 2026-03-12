//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : functions/register.js
// FUNGSI: Native HTML Builder untuk Halaman Register dengan Full Text SSR
//#######################################################################

export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const baseUrl = url.origin; // Menggunakan origin mencegah parsing URL gagal

    try {
        const indexRes = await env.ASSETS.fetch(new Request(`${baseUrl}/index.html`));
        const rawHtml = await indexRes.text();

        // Ekstrak file aset Vue
        const jsMatch = rawHtml.match(/<script type="module" crossorigin src="[^"]+"><\/script>/i);
        const cssMatch = rawHtml.match(/<link rel="stylesheet" crossorigin href="[^"]+">/i);
        const vueJs = jsMatch ? jsMatch[0] : '';
        const vueCss = cssMatch ? cssMatch[0] : '';

        const title = "Create an Account | Flowork OS";
        const desc = "Join the Flowork ecosystem. Create a new account to deploy tools and build workflows.";
        const pageUrl = `${baseUrl}/register`;

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
    </style>
</head>
<body>
    <div id="app">
        <div id="seo-content" style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0;">
            <main>
                <h1>Create a Flowork OS Account</h1>
                <p>${desc}</p>
                <form action="/api/v1/auth/register" method="POST">
                    <fieldset>
                        <label for="fullname">Full Name</label>
                        <input type="text" id="fullname" name="fullname" placeholder="Enter your full name" required />
                    </fieldset>
                    <fieldset>
                        <label for="email">Email Address</label>
                        <input type="email" id="email" name="email" placeholder="Enter your email" required />
                    </fieldset>
                    <fieldset>
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" placeholder="Create a strong password" required minlength="8" />
                    </fieldset>
                    <button type="submit">Sign Up</button>
                </form>
                <section>
                    <h2>Alternative Sign Up Options</h2>
                    <ul>
                        <li><a href="/auth/google">Sign up with Google</a></li>
                        <li><a href="/auth/github">Sign up with GitHub</a></li>
                    </ul>
                </section>
                <footer>
                    <p>Already have an account? <a href="/login">Sign in here</a></p>
                    <p>By registering, you agree to our <a href="/terms-of-service">Terms of Service</a> and <a href="/privacy-policy">Privacy Policy</a>.</p>
                </footer>
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
        console.error("Register Build Error:", e);
        return env.ASSETS.fetch(new Request(`${baseUrl}/index.html`));
    }
}