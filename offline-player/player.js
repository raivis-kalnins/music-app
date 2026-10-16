/* Music 63 Offline Player — all audio stays on this device, no external services. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const fileEl = $('trackFile'), instrumentEl = $('instrument'), noteNames = ['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
  const state = { ctx: null, master: null, compressor: null, buffers: new Map(), loading: new Map(), voices: new Map(), sustain: new Map(), midiAccess: null, midi: null, audioURL: null, kind: null, track: null, playStart: 0, playPos: 0, timer: 0, progressTimer: 0, index: 0, paused: false, program: new Map(), installed: false, pianoSamples: [], pianoName: '', pianoPersisted: false, pianoRestored: false };
  const GM = ['piano','piano','piano','piano','piano','piano','piano','piano'];
  const bankName = program => {
    if (program >= 24 && program <= 31) return 'guitar';
    if (program >= 19 && program <= 23) return 'accordion';
    if (program >= 40 && program <= 47) return 'violin';
    if (program === 65) return 'alto_sax';
    if (program === 66) return 'tenor_sax';
    if (program === 71) return 'clarinet';
    return 'piano';
  };
  const label = v => ({piano:'Akustiskās klavieres',clarinet:'Klarnete',accordion:'Akordeons',guitar:'Ģitāra',violin:'Vijole',alto_sax:'Altsaksofons',tenor_sax:'Tenorsaksofons'})[v] || v;
  const tell = (message, warn = false) => { $('midiStatus').textContent = message; $('midiStatus').classList.toggle('warn',warn); };
  const timeText = s => { s = Math.max(0, Math.floor(s || 0)); return `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`; };
  const setControlState = () => { const has = !!state.track; $('play').disabled = !has || (!!state.timer && !state.paused); $('pause').disabled = state.kind !== 'midi' || (!state.timer && !state.paused); $('stop').disabled = !has; $('pause').textContent = state.paused ? 'Turpināt' : 'Pauze'; };
  async function audioOn() {
    if (!state.ctx) {
      const Type = window.AudioContext || window.webkitAudioContext;
      if (!Type) throw Error('Šī ierīce neatbalsta Web Audio atskaņošanu.');
      state.ctx = new Type({ latencyHint: 'interactive' });
      state.master = state.ctx.createGain();
      state.compressor = state.ctx.createDynamicsCompressor();
      state.compressor.threshold.value = -13;
      state.compressor.knee.value = 9;
      state.compressor.ratio.value = 2.4;
      state.compressor.attack.value = 0.004;
      state.compressor.release.value = 0.16;
      state.master.gain.value = Number($('volume').value) / 100;
      state.master.connect(state.compressor);
      state.compressor.connect(state.ctx.destination);
    }
    if (state.ctx.state !== 'running') await state.ctx.resume();
    $('activateAudio').textContent = 'Skaņa ieslēgta ✓';
    return state.ctx;
  }
  function decodeBase64(encoded) {
    const binary = atob(encoded), bytes = new Uint8Array(binary.length);
    for (let i = 0; i < bytes.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  }
  async function ensureInstrument(name) {
    if(name==='piano' && !state.pianoRestored){state.pianoRestored=true;await loadSavedPianoBank();}
    if (state.buffers.has(name)) return state.buffers.get(name);
    if (state.loading.has(name)) return state.loading.get(name);
    const run = (async () => {
      const ctx = await audioOn(), soundbank = window.Music63SoundBank || {};
      const entries = soundbank[name] || soundbank.piano;
      if (!entries) return [];
      const decoded = [];
      for (const entry of entries) {
        try {
          const buffer = await ctx.decodeAudioData(decodeBase64(entry.wav));
          decoded.push({ root: entry.root, buffer, loop: entry.loop, start: entry.start, end: entry.end });
        } catch (error) { console.warn('Neizdevās atvērt instrumenta skaņas paraugu', name, entry.root, error); }
      }
      state.buffers.set(name,decoded);
      return decoded;
    })().finally(() => state.loading.delete(name));
    state.loading.set(name,run);
    return run;
  }
  function key(channel, midi) { return `${channel}:${midi}`; }
  function releaseVoice(voice, at) {
    if (!voice || voice.released) return;
    voice.released = true;
    const t = Math.max(state.ctx.currentTime,at || state.ctx.currentTime);
    try {
      voice.gain.gain.cancelScheduledValues(t);
      voice.gain.gain.setValueAtTime(Math.max(voice.gain.gain.value,0.0008),t);
      voice.gain.gain.setTargetAtTime(0.00005,t, voice.inst === 'piano' ? 0.115 : 0.075);
      voice.source.stop(t + (voice.inst === 'piano' ? 0.55 : 0.36));
    } catch (_e) { /* The sound may have ended naturally. */ }
  }
  function noteOff(note, channel = 0, when) {
    const id = key(channel,note), active = state.voices.get(id);
    if (!active) return;
    if (state.sustain.get(channel) && !when) { active.sustained = true; return; }
    releaseVoice(active,when);
    state.voices.delete(id);
    showKey(note,false);
  }
  function panic() {
    if (!state.ctx) return;
    for (const voice of state.voices.values()) releaseVoice(voice);
    state.voices.clear(); state.sustain.clear();
    document.querySelectorAll('.key.active').forEach(el => el.classList.remove('active'));
  }
  function oscillatorVoice(note, vel, name, when) {
    const c = state.ctx, source = c.createOscillator(), gain = c.createGain();
    const filter = c.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = name==='piano' ? 4200 : 2900;
    source.type = name === 'accordion' ? 'sawtooth' : name === 'clarinet' ? 'square' : 'triangle';
    source.frequency.setValueAtTime(440 * 2 ** ((note-69)/12),when);
    source.connect(filter); filter.connect(gain); gain.connect(state.master);
    gain.gain.setValueAtTime(0.0001,when);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001,vel / 127 * 0.12),when + 0.012);
    source.start(when);
    return { source, gain, inst:name, released:false };
  }
  function drumHit(note, velocity, when) {
    const c=state.ctx, vol=Math.max(.01,velocity/127), kick = note === 35 || note === 36;
    const osc=c.createOscillator(), gain=c.createGain();
    osc.type=kick?'sine':'triangle'; osc.frequency.setValueAtTime(kick?130:400,when);
    osc.frequency.exponentialRampToValueAtTime(kick?48:120,when+(kick?.17:.06));
    gain.gain.setValueAtTime(.0001,when);
    gain.gain.exponentialRampToValueAtTime(vol*(kick?.32:.12),when+.003);
    gain.gain.exponentialRampToValueAtTime(.0001,when+(kick?.23:.095));
    osc.connect(gain); gain.connect(state.master); osc.start(when); osc.stop(when+(kick?.28:.14));
  }
  // Local SFZ/WAV piano: optional enhanced samples, never transmitted to a server.
  function pianoReport(extra='') {
    const count=state.pianoSamples.length;
    const label=count?(state.pianoName+' · '+count+' mapped WAV paraugi'+(state.pianoPersisted?' · saglabāts ierīcē':' · tikai pašreizējā sesijā')):'Iebūvētā klavieru skaņa';
    $('pianoBankState').textContent=label+(extra?' · '+extra:'');
  }
  async function bankDatabase() {
    if(!window.indexedDB)throw Error('Šajā režīmā IndexedDB krātuve nav pieejama.');
    return new Promise((resolve,reject)=>{
      const request=indexedDB.open('music63-offline-piano-v1',1);
      request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('bank'))request.result.createObjectStore('bank',{keyPath:'key'});};
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error||Error('Cannot open piano storage'));
    });
  }
  async function savePianoBank(rows) {
    const db=await bankDatabase();
    try {await new Promise((resolve,reject)=>{
      const tx=db.transaction('bank','readwrite'),store=tx.objectStore('bank');store.clear();
      rows.forEach(x=>store.put(x));
      tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error||Error('Cannot save piano bank'));tx.onabort=()=>reject(tx.error||Error('Piano storage full'));
    });} finally {db.close();}
  }
  async function savedPianoRows() {
    const db=await bankDatabase();
    try{return await new Promise((resolve,reject)=>{
      const tx=db.transaction('bank','readonly'),request=tx.objectStore('bank').getAll();
      request.onsuccess=()=>resolve(request.result||[]);request.onerror=()=>reject(request.error);
    });}finally{db.close();}
  }
  async function activatePianoRows(rows) {
    const context=await audioOn(),decoded=[];
    for(const r of rows) {
      const buffer=await context.decodeAudioData(r.bytes.slice(0));
      decoded.push({...r,bytes:undefined,buffer});
    }
    panic();state.pianoSamples=decoded;state.pianoName=rows[0]?.bankName||'Local WAV Piano';
  }
  async function importPianoBank(input) {
    if(!input.files?.length)return;
    const files=[...input.files];input.disabled=true;pianoReport('Notiek SFZ/WAV importēšana…');
    try{
      const bank=await window.Music63PianoSFZ.prepareFiles(files,{maxFiles:256,maxBytes:180*1048576});
      const rows=[];
      for(const [i,r] of bank.regions.entries()) {
        const bytes=await r.file.arrayBuffer();
        rows.push({key:String(i),bankName:bank.name,root:r.root,low:r.low,high:r.high,lowvel:r.lowvel,highvel:r.highvel,loopMode:r.loopMode,loopStart:r.loopStart,loopEnd:r.loopEnd,bytes});
      }
      await activatePianoRows(rows);
      state.pianoPersisted=false;
      try{await savePianoBank(rows);state.pianoPersisted=true;}catch(error){console.warn('Offline piano persistent storage unavailable:',error);}
      state.pianoRestored=true;pianoReport(bank.missing?bank.missing+' SFZ paraugi nav atrasti':'Skaņa gatava!');
    }catch(error){pianoReport(error.message);tell('Piano imports: '+error.message,true);}
    finally{input.value='';input.disabled=false;}
  }
  async function loadSavedPianoBank() {
    try{const rows=await savedPianoRows();if(!rows.length)return;await activatePianoRows(rows);state.pianoPersisted=true;pianoReport();}
    catch(error){console.warn('Cannot restore local piano bank:',error);}
  }
  async function clearPianoBank(){
    if(!confirm('Atjaunot iebūvētās klavieru skaņas?'))return;
    panic();state.pianoSamples=[];state.pianoName='';state.pianoPersisted=false;state.pianoRestored=true;
    try{await savePianoBank([]);}catch(error){console.warn('Piano cache unavailable',error)}pianoReport();
  }
  function startNote(note, vel, name, channel=0, when) {
    if (!state.ctx) return;
    if (channel === 9) { drumHit(note,vel,when || state.ctx.currentTime);return; }
    const c = state.ctx, t = Math.max(c.currentTime+.002,when || c.currentTime+.004);
    const id=key(channel,note), old=state.voices.get(id);
    if (old) releaseVoice(old,t);
    const arr=state.buffers.get(name) || [], local=name==='piano'?window.Music63PianoSFZ?.choose(state.pianoSamples,note,vel):null, closest=local||arr.reduce((a,b) => (!a || Math.abs(b.root-note)<Math.abs(a.root-note))?b:a,null);
    let voice;
    if (closest) {
      const source=c.createBufferSource(), gain=c.createGain();
      source.buffer=closest.buffer;
      source.playbackRate.value=2 ** ((note-closest.root)/12);
      if (closest.loopMode==='loop_continuous' && closest.loopEnd>closest.loopStart) {
        const start=closest.loopStart/closest.buffer.sampleRate,end=closest.loopEnd/closest.buffer.sampleRate;
        if(end>start+.015 && end<=closest.buffer.duration+.02){source.loop=true;source.loopStart=start;source.loopEnd=Math.min(end,closest.buffer.duration)}
      } else if(closest.loop) {
        source.loop=true; source.loopStart=Math.max(0,Math.min(closest.buffer.duration-.08,closest.start));
        source.loopEnd=Math.max(source.loopStart+.02,Math.min(closest.buffer.duration,closest.end));
      }
      source.connect(gain); gain.connect(state.master);
      gain.gain.setValueAtTime(.0001,t);
      gain.gain.exponentialRampToValueAtTime(Math.max(.0001,vel / 127 * (name==='piano'?.48:.29)),t + .012);
      source.start(t);
      voice={source,gain,inst:name,released:false};
    } else voice=oscillatorVoice(note,vel,name,t);
    state.voices.set(id,voice);
    voice.source.onended=()=>{if(state.voices.get(id)===voice){state.voices.delete(id);showKey(note,false)}};
    if (!when) showKey(note,true);
  }
  async function liveNoteOn(note, vel=98, channel=0) {
    await audioOn();
    const name=instrumentEl.value;
    await ensureInstrument(name);
    startNote(note,vel,name,channel);
  }
  function showKey(note,on) {
    const el=document.querySelector(`.key[data-midi="${note}"]`); if (el) el.classList.toggle('active',!!on);
  }
  async function connectMidi() {
    if (!navigator.requestMIDIAccess) {
      tell('Šajā pārlūkā USB MIDI nav pieejams. iPad Safari izmanto ekrāna klaviatūru vai atver MIDI failu.',true);return;
    }
    try {
      await audioOn(); await ensureInstrument(instrumentEl.value);
      const access=await navigator.requestMIDIAccess({sysex:false});
      state.midiAccess=access;
      function bind() {
        const inputs=Array.from(access.inputs.values());
        inputs.forEach(input=>{input.onmidimessage=event=>handleMidi(event.data)});
        tell(inputs.length?`MIDI pievienots: ${inputs.map(x=>x.name||'MIDI Keyboard').join(', ')}`:'MIDI atļauja ir dota. Pieslēdz USB klaviatūru un pārbaudi pieslēgumu.', !inputs.length);
      }
      access.onstatechange=bind;bind();
    } catch (error) {tell('MIDI pieslēgšana neizdevās: '+(error.message || String(error)),true);}
  }
  function sustainMessage(channel, enabled) {
    state.sustain.set(channel,!!enabled);
    if (!enabled) {
      for (const [id,voice] of state.voices) {
        if (id.startsWith(channel+':') && voice.sustained) {
          releaseVoice(voice); state.voices.delete(id);
          showKey(Number(id.split(':')[1]),false);
        }
      }
    }
  }
  function handleMidi(data) {
    if (!data || !data.length) return;
    const msg=data[0]&0xF0,channel=data[0]&0x0F,note=data[1];
    if (msg===0x90 && data[2]>0) liveNoteOn(note,data[2],channel).catch(error=>tell(error.message,true));
    else if (msg===0x80 || (msg===0x90 && data[2]===0)) noteOff(note,channel);
    else if (msg===0xB0 && note===64) sustainMessage(channel,data[2]>=64);
    else if (msg===0xB0 && (note===120 || note===123)) panic();
  }
  function keyboard() {
    const host=$('keyboard'), whiteNotes=[];
    for (let pitch=48;pitch<72;pitch++) if (![1,3,6,8,10].includes(pitch%12)) whiteNotes.push(pitch);
    for (let i=0;i<whiteNotes.length;i++) {
      const pitch=whiteNotes[i], el=document.createElement('div');
      el.className='key white';el.dataset.midi=pitch;el.style.left=(i*100/14)+'%';
      if (pitch%12===0) el.innerHTML=`<span>C${Math.floor(pitch/12)-1}</span>`;
      host.appendChild(el);
    }
    for (let pitch=48;pitch<72;pitch++) {
      if (![1,3,6,8,10].includes(pitch%12)) continue;
      const whitesBelow=whiteNotes.filter(n=>n<pitch).length;
      const el=document.createElement('div');el.className='key black';el.dataset.midi=pitch;
      el.style.left=`calc(${whitesBelow*100/14}% - (100% / 46))`;
      host.appendChild(el);
    }
    const touches=new Map();
    host.addEventListener('pointerdown', event=>{
      const target=event.target.closest('.key'); if (!target) return;
      event.preventDefault(); try{target.setPointerCapture(event.pointerId)}catch(_e){}
      const note=Number(target.dataset.midi);touches.set(event.pointerId,note);target.classList.add('active');
      liveNoteOn(note,100,0).catch(error=>tell(error.message,true));
    });
    function end(event) {const note=touches.get(event.pointerId);if(note==null)return;touches.delete(event.pointerId);noteOff(note,0);}
    host.addEventListener('pointerup',end);host.addEventListener('pointercancel',end);host.addEventListener('lostpointercapture',end);
  }
  async function loadTrack(file) {
    stopAll();
    if(state.audioURL){URL.revokeObjectURL(state.audioURL);state.audioURL=null;}
    state.track=null;
    const ext=(file?.name||'').split('.').pop().toLowerCase();
    if (!file) {setControlState();return;}
    if (['mid','midi'].includes(ext)) {
      try {
        const parsed=window.Music63MidiParser.parseMidiFile(await file.arrayBuffer());
        state.track=parsed;state.kind='midi';
        $('trackName').textContent=file.name;
        $('trackDetails').textContent=`${parsed.tracks} MIDI celiņš(-i) · ${parsed.events.length} notikumi · ${parsed.bpm} BPM sākumā`;
        $('audioFilePlayer').hidden=true;
      } catch (error) {$('trackName').textContent='Neizdevās atvērt MIDI';$('trackDetails').textContent=error.message;state.kind=null;}
    } else if (['wav','mp3','m4a','ogg'].includes(ext)) {
      state.audioURL=URL.createObjectURL(file);state.kind='audio';state.track={duration:0};
      const player=$('audioFilePlayer');player.src=state.audioURL;player.hidden=false;
      $('trackName').textContent=file.name;$('trackDetails').textContent='Audio fails · oriģinālā skaņas kvalitāte';
    } else {
      state.kind=null; $('trackName').textContent='Neatbalstīts formāts';$('trackDetails').textContent='Izvēlies MIDI, WAV, MP3, M4A vai OGG.';
    }
    $('progress').value=0;$('position').textContent='00:00 / '+timeText(state.track?.duration);setControlState();
  }
  function stopMidi(keepPosition=false) {
    clearInterval(state.timer);clearInterval(state.progressTimer);state.timer=state.progressTimer=0;
    if(!keepPosition){state.playPos=0;state.index=0;state.paused=false;$('progress').value=0;}
    panic();setControlState();
  }
  function stopAll() {
    stopMidi();
    const player=$('audioFilePlayer');player.pause();try{player.currentTime=0}catch(_e){}
    setControlState();
  }
  async function playMidi() {
    await audioOn();
    if (!state.track) return;
    const programs=[...new Set(state.track.events.filter(e=>e.kind===0xC0).map(e=>bankName(e.note)))];
    for (const inst of [instrumentEl.value,...programs]) await ensureInstrument(inst);
    if(state.timer) stopMidi(true);
    const pos=state.playPos||0;
    state.index=state.track.events.findIndex(e=>e.time>=pos);
    if(state.index<0)state.index=state.track.events.length;
    state.playStart=state.ctx.currentTime+0.05-pos;
    state.paused=false;state.program=new Map();
    for(const e of state.track.events){if(e.time>=pos)break;if(e.kind===0xC0)state.program.set(e.channel,e.note);}
    state.timer=setInterval(scheduleMidi,25);
    state.progressTimer=setInterval(updateProgress,100);
    scheduleMidi();setControlState();
  }
  function scheduleMidi() {
    if (!state.track || !state.ctx || state.paused) return;
    const ahead=state.ctx.currentTime-state.playStart+0.19;
    while(state.index<state.track.events.length && state.track.events[state.index].time<=ahead) {
      const ev=state.track.events[state.index++], when=Math.max(state.ctx.currentTime+0.002,state.playStart+ev.time);
      if (ev.kind===0xC0)state.program.set(ev.channel,ev.note);
      else if(ev.kind===0x90 && ev.value>0)startNote(ev.note,ev.value,bankName(state.program.get(ev.channel)||0),ev.channel,when);
      else if (ev.kind===0x80 || (ev.kind===0x90 && ev.value===0))noteOff(ev.note,ev.channel,when);
    }
    if(state.ctx.currentTime-state.playStart > state.track.duration + 0.35) stopMidi();
  }
  function updateProgress() {
    if (state.kind==='midi' && state.timer && !state.paused) {
      const at=Math.max(0,state.ctx.currentTime-state.playStart);
      state.playPos=at;
      $('progress').value=state.track.duration?Math.min(100,at/state.track.duration*100):0;
      $('position').textContent=`${timeText(at)} / ${timeText(state.track.duration)}`;
    }
  }
  function togglePause() {
    if(state.kind!=='midi'||(!state.timer&&!state.paused))return;
    if(!state.paused) {
      state.playPos=Math.max(0,state.ctx.currentTime-state.playStart);
      clearInterval(state.timer);clearInterval(state.progressTimer);
      state.timer=0;state.progressTimer=0;state.paused=true;
      panic();
    } else {playMidi().catch(error=>tell(error.message,true));return;}
    setControlState();
  }
  async function play() {
    try {
      if(state.kind==='audio') {
        await $('audioFilePlayer').play();setControlState();
      } else if(state.kind==='midi') {
        await playMidi();
      }
    } catch(error) {tell('Atskaņošana neizdevās: '+error.message,true);}
  }
  function setCompatibility() {
    const midi=!!navigator.requestMIDIAccess, local=location.protocol==='file:';
    $('compatibility').classList.toggle('warn',!midi);
    $('compatibility').textContent=midi
      ? 'USB MIDI ir pieejams šajā pārlūkā. Pieslēdz klaviatūru un nospied “Pieslēgt MIDI”. Skaņai izmanto vadu, nevis Bluetooth.'
      : 'USB MIDI nav pieejams šajā pārlūkā. Ekrāna klavieres un MIDI/WAV/MP3 failu atskaņošana darbojas arī bez USB MIDI.';
    if(local) $('networkState').textContent='Lokāls fails · Offline';
  }
  async function registerOffline() {
    if(!('serviceWorker' in navigator) || location.protocol==='file:')return;
    try {
      const registration=await navigator.serviceWorker.register('sw.js');
      await navigator.serviceWorker.ready;
      if(!registration.active)await new Promise(resolve=>setTimeout(resolve,250));
      $('networkState').textContent='Saglabāts bezsaistē ✓';$('networkState').classList.add('ready');
    } catch(error){console.warn('Offline cache unavailable',error);$('networkState').textContent='Offline kešs nav pieejams';}
  }
  function initInstall() {
    let deferred=null;
    window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;$('installButton').textContent='Instalēt lietotni';});
    $('installButton').onclick=async()=>{
      if(deferred){deferred.prompt();await deferred.userChoice;deferred=null;return;}
      const ua=navigator.userAgent;
      if(location.protocol==='file:') {alert('Atver https://music.63.lv/offline-player/ ar internetu un instalē no pārlūka izvēlnes. Šī lejupielādētā HTML versija jau darbojas lokāli.');return;}
      if(/iPad|iPhone|iPod/i.test(ua)||(/Macintosh/i.test(ua)&&navigator.maxTouchPoints>1)) alert('iPad: Safari → Share → Add to Home Screen → Open as Web App → Add.');
      else if(/Android/i.test(ua))alert('Android Chrome: izvēlne ⋮ → Install app / Add to Home Screen.');
      else alert('Windows/Mac: Chrome vai Edge → pārlūka izvēlne → Install app. Mac Safari var izmantot File → Add to Dock.');
    };
  }
  function wire() {
    try{if(localStorage.getItem('music63-player-theme')==='dark')document.documentElement.dataset.theme='dark';}catch(_e){}
    $('themeSwitch').textContent=document.documentElement.dataset.theme==='dark'?'Gaišais režīms':'Tumšais režīms';
    $('themeSwitch').onclick=()=>{const dark=document.documentElement.dataset.theme!=='dark';document.documentElement.dataset.theme=dark?'dark':'light';$('themeSwitch').textContent=dark?'Gaišais režīms':'Tumšais režīms';try{localStorage.setItem('music63-player-theme',dark?'dark':'light')}catch(_e){}};
    $('volume').oninput=e=>{const value=+e.target.value;$('volumeLabel').textContent=value+'%';if(state.master)state.master.gain.value=value/100;};
    $('activateAudio').onclick=()=>audioOn().then(()=>ensureInstrument(instrumentEl.value)).then(()=>tell('Skaņa gatava. Vari spēlēt uz MIDI vai ekrāna klavierēm.')).catch(error=>tell(error.message,true));
    instrumentEl.onchange=()=>{panic();audioOn().then(()=>ensureInstrument(instrumentEl.value)).then(()=>tell('Izvēlēts instruments: '+label(instrumentEl.value))).catch(error=>tell(error.message,true));};
    $('connectMidi').onclick=connectMidi;$('panic').onclick=panic;
    fileEl.onchange=e=>{loadTrack(e.target.files[0]).catch(error=>tell(error.message,true));};
    $('play').onclick=play;$('stop').onclick=stopAll;$('pause').onclick=togglePause;
    const audio=$('audioFilePlayer');
    audio.onloadedmetadata=()=>{if(state.kind!=='audio')return;state.track.duration=Number.isFinite(audio.duration)?audio.duration:0;setControlState();};
    audio.ontimeupdate=()=>{if(state.kind!=='audio')return;const total=state.track?.duration||0;$('position').textContent=`${timeText(audio.currentTime)} / ${timeText(total)}`;$('progress').value=total?Math.min(100,audio.currentTime/total*100):0;};
    audio.onended=()=>{setControlState();};
    keyboard();initInstall();setCompatibility();setControlState();registerOffline();
    $('pianoFolder').onchange=e=>importPianoBank(e.target);
    $('pianoFiles').onchange=e=>importPianoBank(e.target);
    $('clearPianoBank').onclick=clearPianoBank;
    document.addEventListener('visibilitychange',()=>{if(document.hidden && !state.timer)panic()});
    window.addEventListener('beforeunload',()=>{stopAll();if(state.audioURL)URL.revokeObjectURL(state.audioURL)});
  }
  wire();
  window.Music63PlayerTest={audioOn,ensureInstrument,loadTrack,playMidi,stopAll,state};
})();
