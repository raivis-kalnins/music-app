(function(){'use strict';
const BASIC_PITCH_ESM='https://cdn.jsdelivr.net/npm/@spotify/basic-pitch@1.0.1/+esm';
const BASIC_PITCH_MODEL='https://cdn.jsdelivr.net/npm/@spotify/basic-pitch@1.0.1/model/model.json';
let modulePromise=null,activeCapture=null,finishedCapture=null;

function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function roundTo(v,q){q=Math.max(.0625,+q||.25);return Math.round(v/q)*q}
function detectSource(raw){
  const url=String(raw||'').trim();if(!url)return{type:'none',url:''};
  try{const u=new URL(url);const host=u.hostname.replace(/^www\./,'').toLowerCase();
    if(host==='youtu.be'){const id=u.pathname.split('/').filter(Boolean)[0]||'';return{type:'youtube',url,id,embed:id?'https://www.youtube.com/embed/'+encodeURIComponent(id):''}}
    if(host.endsWith('youtube.com')){let id=u.searchParams.get('v')||'';const bits=u.pathname.split('/').filter(Boolean);if(!id&&['shorts','embed','live'].includes(bits[0]))id=bits[1]||'';return{type:'youtube',url,id,embed:id?'https://www.youtube.com/embed/'+encodeURIComponent(id):''}}
    if(host==='open.spotify.com'||host.endsWith('.spotify.com')){const bits=u.pathname.split('/').filter(Boolean);const type=['track','album','playlist','episode','show'].includes(bits[0])?bits[0]:'track',id=bits[1]||'';return{type:'spotify',url,id,kind:type,embed:id?'https://open.spotify.com/embed/'+type+'/'+encodeURIComponent(id):''}}
    if(/\.(mp3|wav|ogg|flac|m4a|aac)(?:$|[?#])/i.test(u.pathname+u.search+u.hash))return{type:'audio',url,embed:url};
    return{type:'other',url};
  }catch(e){return{type:'other',url}}
}
async function loadBasicPitch(){
  if(!modulePromise)modulePromise=import(BASIC_PITCH_ESM).catch(e=>{modulePromise=null;throw new Error('Could not load the audio transcription engine. Check internet access, then try again. '+(e?.message||''))});
  return modulePromise;
}
async function decodeMono22050(blob){
  if(!blob||!blob.size)throw new Error('The audio file is empty.');
  const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)throw new Error('This browser does not support Web Audio. Use current Chrome or Edge.');
  const ctx=new Ctx();let decoded;
  try{decoded=await ctx.decodeAudioData((await blob.arrayBuffer()).slice(0))}catch(e){try{await ctx.close()}catch(_){}throw new Error('Browser could not decode this audio. MP3, WAV, OGG or FLAC is recommended.');}
  const rate=22050,frames=Math.max(1,Math.ceil(decoded.duration*rate));
  const offline=new OfflineAudioContext(1,frames,rate),src=offline.createBufferSource();src.buffer=decoded;src.connect(offline.destination);src.start(0);const mono=await offline.startRendering();try{await ctx.close()}catch(_){}
  return mono;
}
function thresholds(name){
  if(name==='clean')return{onset:.52,frame:.36,minLen:7};
  if(name==='detailed')return{onset:.22,frame:.22,minLen:3};
  return{onset:.30,frame:.27,minLen:5};
}
async function transcribeBlob(blob,options={},progress){
  const mod=await loadBasicPitch();
  const {BasicPitch,outputToNotesPoly,addPitchBendsToNoteEvents,noteFramesToTime}=mod;
  if(!BasicPitch||!outputToNotesPoly||!noteFramesToTime)throw new Error('Audio transcription engine loaded incorrectly.');
  progress?.(.02,'Decoding audio…');const audio=await decodeMono22050(blob);progress?.(.08,'Loading note-recognition model…');
  const model=new BasicPitch(BASIC_PITCH_MODEL),frames=[],onsets=[],contours=[];
  await model.evaluateModel(audio,(f,o,c)=>{frames.push(...f);onsets.push(...o);contours.push(...c)},p=>progress?.(.08+.78*p,'Listening for notes…'));
  progress?.(.88,'Building editable notes…');const t=thresholds(options.sensitivity||'balanced');
  let notes=outputToNotesPoly(frames,onsets,t.onset,t.frame,t.minLen,true,null,null,true,11);
  if(addPitchBendsToNoteEvents)notes=addPitchBendsToNoteEvents(contours,notes);
  notes=noteFramesToTime(notes).filter(n=>Number.isFinite(n.pitchMidi)&&Number.isFinite(n.startTimeSeconds)&&n.durationSeconds>.025);
  progress?.(.94,'Quantizing timing…');const polyScore=toScoreEvents(notes,{...options,mode:'poly'}),score=(options.mode||'melody')==='melody'?toScoreEvents(notes,{...options,mode:'melody'}):polyScore,chords=options.detectChords?inferChords(polyScore,options):[];progress?.(1,'Draft ready');
  const pitches=score.map(n=>n.concertMidi);return{notes:score,chords,rawCount:notes.length,durationSeconds:audio.duration,minMidi:pitches.length?Math.min(...pitches):null,maxMidi:pitches.length?Math.max(...pitches):null};
}
function toScoreEvents(events,options={}){
  const bpm=clamp(+options.bpm||92,20,300),q=Math.max(.0625,+options.quantize||.25),bpb=Math.max(1,+options.beatsPerBar||4),startBar=Math.max(1,Math.floor(+options.startBar||1)),startOffset=(startBar-1)*bpb;
  let xs=events.map(n=>{const start=roundTo((+n.startTimeSeconds||0)*bpm/60,q)+startOffset,dur=clamp(roundTo((+n.durationSeconds||.1)*bpm/60,q)||q,q,bpb*8),amp=clamp(+n.amplitude||.65,0,1);return{startBeat:Math.max(startOffset,start),duration:dur,concertMidi:clamp(Math.round(+n.pitchMidi||60),0,127),amplitude:amp,velocity:clamp(Math.round(42+amp*85),1,127)}}).sort((a,b)=>a.startBeat-b.startBeat||b.amplitude-a.amplitude||b.concertMidi-a.concertMidi);
  if((options.mode||'melody')==='melody'){
    const groups=new Map();for(const n of xs){const k=n.startBeat.toFixed(4),old=groups.get(k),score=n.amplitude+n.concertMidi*.00055;if(!old||score>(old.amplitude+old.concertMidi*.00055))groups.set(k,n)}
    xs=[...groups.values()].sort((a,b)=>a.startBeat-b.startBeat);
    for(let i=0;i<xs.length-1;i++){const gap=xs[i+1].startBeat-xs[i].startBeat;if(gap>0&&xs[i].duration>gap)xs[i].duration=Math.max(q,gap)}
  }
  return xs.map(n=>{const rel=n.startBeat;const bar=Math.floor(rel/bpb)+1,beat=+(rel-(bar-1)*bpb+1).toFixed(4);return{bar,beat,duration:+n.duration.toFixed(4),concertMidi:n.concertMidi,velocity:n.velocity,amplitude:n.amplitude}});
}

const CHORD_ROOTS=['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
const CHORD_TYPES=[
  {s:'',pcs:[0,4,7],bonus:.16},{s:'m',pcs:[0,3,7],bonus:.16},{s:'7',pcs:[0,4,7,10],bonus:.2},{s:'maj7',pcs:[0,4,7,11],bonus:.18},{s:'m7',pcs:[0,3,7,10],bonus:.18},{s:'sus4',pcs:[0,5,7],bonus:.1},{s:'dim',pcs:[0,3,6],bonus:.08}
];
function inferChords(poly,options={}){
  if(!poly?.length)return[];const bpb=Math.max(1,+options.beatsPerBar||4),segment=bpb>=4?2:(String(options.timeSignature||'')==='6/8'?1.5:1),groups=new Map();
  for(const n of poly){const abs=((+n.bar||1)-1)*bpb+((+n.beat||1)-1),seg=Math.floor(abs/segment),k=String(seg);if(!groups.has(k))groups.set(k,new Array(12).fill(0));const w=Math.max(.08,+n.duration||.25)*(.55+Math.max(0,Math.min(1,+n.amplitude||.6)));groups.get(k)[((+n.concertMidi||60)%12+12)%12]+=w}
  const out=[];for(const [k,w] of [...groups.entries()].sort((a,b)=>+a[0]-+b[0])){const total=w.reduce((a,b)=>a+b,0);if(total<.22)continue;let best=null;for(let r=0;r<12;r++)for(const t of CHORD_TYPES){let hit=0,tones=0;for(const pc of t.pcs){const v=w[(r+pc)%12];hit+=v;if(v>total*.06)tones++}const miss=Math.max(0,total-hit),rootWeight=w[r],score=hit-miss*.28+rootWeight*.12+t.bonus;if(tones>=2&&(!best||score>best.score))best={score,r,t}}if(!best||best.score<total*.28)continue;const abs=+k*segment,bar=Math.floor(abs/bpb)+1,beat=+(abs-(bar-1)*bpb+1).toFixed(3),symbol=CHORD_ROOTS[best.r]+best.t.s;if(!out.length||out[out.length-1].symbol!==symbol)out.push({bar,beat,symbol,confidence:Math.max(.25,Math.min(.98,best.score/(total+.001)))})}
  return out;
}

async function fetchAudio(url){
  let r;try{r=await fetch(url,{mode:'cors',credentials:'omit'})}catch(e){throw new Error('That audio URL cannot be read by the browser (CORS blocked). Download/upload the audio file, or use Share tab audio instead.');}
  if(!r.ok)throw new Error('Audio URL returned HTTP '+r.status+'. Upload the audio file or use Share tab audio.');const b=await r.blob();if(!b.size)throw new Error('Audio URL returned an empty file.');return b;
}
function bestRecorderType(){for(const t of ['audio/webm;codecs=opus','audio/webm','audio/ogg;codecs=opus'])if(window.MediaRecorder?.isTypeSupported?.(t))return t;return''}
async function startTabCapture(onState){
  if(activeCapture)throw new Error('A tab-audio capture is already running.');if(!navigator.mediaDevices?.getDisplayMedia)throw new Error('Tab-audio capture needs current Chrome or Edge on HTTPS.');
  const display=await navigator.mediaDevices.getDisplayMedia({video:true,audio:true,preferCurrentTab:true,selfBrowserSurface:'include',surfaceSwitching:'include',systemAudio:'include'});const audioTracks=display.getAudioTracks();
  if(!audioTracks.length){display.getTracks().forEach(t=>t.stop());throw new Error('No shared audio was received. Choose the YouTube/Spotify tab and enable “Share tab audio”.');}
  const audioOnly=new MediaStream(audioTracks),mime=bestRecorderType(),rec=mime?new MediaRecorder(audioOnly,{mimeType:mime}):new MediaRecorder(audioOnly),chunks=[];
  let resolveStopped,rejectStopped;const stopped=new Promise((res,rej)=>{resolveStopped=res;rejectStopped=rej});
  rec.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data)};rec.onerror=e=>rejectStopped(new Error(e.error?.message||'Tab recording failed.'));rec.onstop=()=>{const blob=new Blob(chunks,{type:rec.mimeType||mime||'audio/webm'});display.getTracks().forEach(t=>t.stop());finishedCapture=blob;activeCapture=null;resolveStopped(blob)};
  const video=display.getVideoTracks()[0];if(video)video.addEventListener('ended',()=>{if(rec.state!=='inactive')rec.stop()});rec.start(500);activeCapture={display,rec,stopped,startedAt:Date.now()};onState?.('recording');return{startedAt:activeCapture.startedAt};
}
async function stopTabCapture(){if(!activeCapture){if(finishedCapture){const b=finishedCapture;finishedCapture=null;return b}throw new Error('No tab-audio capture is running.');}const x=activeCapture;if(x.rec.state!=='inactive')x.rec.stop();const b=await x.stopped;finishedCapture=null;return b}
function isCapturing(){return!!activeCapture}
window.MUSIC63_TRANSCRIBE={detectSource,transcribeBlob,fetchAudio,startTabCapture,stopTabCapture,isCapturing,toScoreEvents,engineInfo:{name:'Spotify Basic Pitch',version:'1.0.1'}};
})();
