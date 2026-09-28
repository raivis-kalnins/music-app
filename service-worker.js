const C='music63-v215',A=['./','index.php','assets/app.css?v=35','assets/app.js?v=35','assets/notation.js?v=35','assets/midi.js?v=35','assets/audio.js?v=35','assets/musicxml.js?v=35','assets/audio-transcribe.js?v=35','assets/i18n.js?v=35','assets/handwriting-local.js?v=35','assets/icon.svg','assets/icon-192.png','assets/icon-512.png','assets/apple-touch-icon.png','manifest.webmanifest'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(A)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==C).map(k=>caches.delete(k))))])));
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  let u;try{u=new URL(req.url)}catch(_){return}
  if(u.protocol!=='http:'&&u.protocol!=='https:')return;
  if(u.origin!==self.location.origin)return;
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
