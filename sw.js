/* Tide service worker.
   Desktop Chrome and Edge only offer "Install app" when the page is controlled by
   a service worker with a fetch handler — without this file the install option never
   appears on a computer. It also makes Tide genuinely work offline: Tide is a single
   HTML file with no external runtime dependencies, so caching the page is all we need.
   Google Fonts are fetched straight from the network and simply fall back to a system
   font when offline. */
const CACHE='tide-v1';

self.addEventListener('install',e=>{
  e.waitUntil((async()=>{
    const c=await caches.open(CACHE);
    // Tolerate a missing entry (e.g. a host that only serves the directory URL) so a
    // single 404 can't abort the install and leave the app un-installable.
    await Promise.allSettled(['./','index.html'].map(u=>c.add(u)));
    self.skipWaiting();
  })());
});

self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  // Navigations: network-first so updates to the app land as soon as you're online,
  // falling back to the cached page (or the app shell) when there's no connection.
  if(req.mode==='navigate'){
    e.respondWith((async()=>{
      try{
        const res=await fetch(req);
        const c=await caches.open(CACHE); c.put(req,res.clone());
        return res;
      }catch{
        return (await caches.match(req))||(await caches.match('index.html'))||(await caches.match('./'));
      }
    })());
    return;
  }
  // Everything else: serve from cache when we have it, otherwise go to the network.
  e.respondWith(caches.match(req).then(m=>m||fetch(req)));
});
