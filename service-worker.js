const C='music63-v225-sfz-piano-live-layout-1',A=['./','index.php','assets/app.css?v=47','assets/app.js?v=47','assets/live-studio.css?v=47','assets/ui-refresh.css?v=47','assets/offline-downloads.css?v=47','assets/live-studio.js?v=47','assets/notation.js?v=47','assets/midi.js?v=47','assets/piano-sfz.js?v=47','assets/piano-sfz.js?v=47','assets/piano-sfz.js?v=47','assets/audio.js?v=47','assets/musicxml.js?v=47','assets/audio-transcribe.js?v=47','assets/i18n.js?v=47','assets/handwriting-local.js?v=47','assets/icon.svg','assets/icon-192.png','assets/icon-512.png','assets/apple-touch-icon.png','manifest.webmanifest'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(A)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==C).map(k=>caches.delete(k))))])));
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  let u;try{u=new URL(req.url)}catch(_){return}
  if(u.protocol!=='http:'&&u.protocol!=='https:')return;
  if(u.origin!==self.location.origin)return;
  if(u.pathname.includes('/offline-player/')||u.pathname.includes('/downloads/'))return;
  if(u.pathname.includes('/api.php')||u.pathname.includes('/storage/'))return;
  e.respondWith((async()=>{
    try{
      const r=await fetch(req);
      if(r&&(r.ok||r.type==='opaque')){
        const c=await caches.open(C);
        await c.put(req,r.clone()).catch(()=>{});
      }
      return r;
    }catch(err){
      const cached=await caches.match(req);
      if(cached)return cached;
      throw err;
    }
  })());
});
