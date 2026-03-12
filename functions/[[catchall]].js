//#######################################################################
// WEBSITE https://floworkos.com
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\[[catchall]].js total lines 31 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  if (path.startsWith('/store/') || path.startsWith('/apps-cloud/')) {
    const userAgent = request.headers.get('user-agent') || '';
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const platform = isMobile ? 'mobile' : 'desktop';

    const newPath = path.replace(/^\/(store|apps-cloud)\//, `/${platform}/`);
    return Response.redirect(`${url.origin}${newPath}`, 301);
  }

  if (url.pathname.startsWith('/api/')) {
    return await context.next();
  }

  const res = await context.next();

  if (res.status === 404) {
    return env.ASSETS.fetch(new Request(new URL('/', request.url)));
  }

  return res;
}
