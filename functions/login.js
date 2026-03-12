//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : functions/login.js
// FUNGSI: Native HTML Builder untuk Halaman Login dengan Full Text SSR
//#######################################################################

export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const baseUrl = url.origin; // Gunakan origin agar selalu tepat (anti-error)

    try {
        const indexRes = await env.ASSETS.fetch(new Request(`${baseUrl}/index.html`));
        const rawHtml = await indexRes.text();

        // Ekstrak file aset Vue JS dan CSS
        const jsMatch = rawHtml.match(/<script type="module" crossorigin src="[^"]+"><\/script>/i);
        const cssMatch = rawHtml.match(/<link rel="stylesheet" crossorigin href="[^"]+">/i);
        const vueJs = jsMatch ? jsMatch[0] : '';
        const vueCss = cssMatch ? cssMatch[0] : '';

        const title = "Sign In | Flowork OS";
        const desc = "Log in to your Flowork OS account to access your neural workspace and applications.";
        const pageUrl = `${baseUrl}/login`;

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
                <h1>Sign In to Flowork OS</h1>
                <p>${desc}</p>
                <form action="/api/v1/auth/login" method="POST">
                    <fieldset>
                        <label for="email">Email Address</label>
                        <input type="email" id="email" name="email" placeholder="Enter your email" required />
                    </fieldset>
                    <fieldset>
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" placeholder="Enter your password" required />
                    </fieldset>
                    <button type="submit">Log In</button>
                </form>
                <section>
                    <h2>Alternative Login Options</h2>
                    <ul>
                        <li><a href="/auth/google">Sign in with Google</a></li>
                        <li><a href="/auth/github">Sign in with GitHub</a></li>
                    </ul>
                </section>
                <footer>
                    <p>Don't have an account yet? <a href="/register">Sign up for Flowork OS</a></p>
                    <p>Forgot your password? <a href="/reset-password">Reset it here</a></p>
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
        console.error("Login Build Error:", e);
        return env.ASSETS.fetch(new Request(`${baseUrl}/index.html`));
    }
}