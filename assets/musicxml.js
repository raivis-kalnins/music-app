(function(g){'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const pitch=m=>{const names=[['C',0],['C',1],['D',0],['D',1],['E',0],['F',0],['F',1],['G',0],['G',1],['A',0],['A',1],['B',0]],x=names[((m%12)+12)%12];return{n:x[0],a:x[1],o:Math.floor(m/12)-1}};
function noteType(d){d=+d||1;if(d>=4)return'whole';if(d>=2)return'half';if(d>=1||Math.abs(d-2/3)<.03)return'quarter';if(d>=.5||Math.abs(d-1/3)<.03)return'eighth';if(d>=.25)return'16th';return'32nd'}
function fifths(song){return g.MUSIC63_NOTATION?.keyFifths?.(song?.key||'C',song?.mode||'major')||0}
function beatsPerBar(song){return g.MUSIC63_NOTATION?.beatsPerBar?.(song)||4}
function clefXml(clef,num=''){const n=num?` number="${num}"`:'';if(clef==='bass')return`<clef${n}><sign>F</sign><line>4</line></clef>`;if(clef==='percussion')return`<clef${n}><sign>percussion</sign><line>2</line></clef>`;return`<clef${n}><sign>G</sign><line>2</line></clef>`}
function diPitch(di){const L=['C','D','E','F','G','A','B'],i=((di%7)+7)%7,o=Math.floor(di/7);return{step:L[i],oct:o}}
function percDisplay(m){const step=g.MUSIC63_NOTATION?.INSTRUMENTS?null:null;const map={35:0,36:0,38:4,40:4,41:2,43:2,45:5,47:5,48:7,50:7,42:9,44:9,46:9,49:10,51:10,52:10,55:10,57:10,59:10},s=map[Math.round(+m||38)]??4;return diPitch(30+s)}
function tupletXml(n){if(+n.tuplet===3)return'<time-modification><actual-notes>3</actual-notes><normal-notes>2</normal-notes></time-modification>';if(+n.tuplet===5)return'<time-modification><actual-notes>5</actual-notes><normal-notes>4</normal-notes></time-modification>';return''}
function articulationXml(a){const map={staccato:'staccato',accent:'accent',tenuto:'tenuto',marcato:'strong-accent'};return a?`<articulations><${map[a]||'staccato'}/></articulations>`:''}
function harmonyXml(c){const m=String(c?.symbol||'').trim().match(/^([A-G])([#b♯♭]?)(.*)$/);if(!m)return'';const alt=m[2]==='#'||m[2]==='♯'?1:m[2]==='b'||m[2]==='♭'?-1:0,q=(m[3]||'').toLowerCase(),kind=q.startsWith('m7')?'minor-seventh':q.startsWith('maj7')?'major-seventh':q.startsWith('m')?'minor':q.startsWith('7')?'dominant':q.startsWith('dim')?'diminished':q.startsWith('sus')?'suspended-fourth':q.startsWith('6')?'major-sixth':'major';return`<harmony><root><root-step>${m[1]}</root-step>${alt?`<root-alter>${alt}</root-alter>`:''}</root><kind text="${esc(m[3]||'')}">${kind}</kind></harmony>`}
function noteXml(n,{voice,du,grand,perc,tieStop,slurStop,chord=false}){let pitchXml='';if(n.rest)pitchXml='<rest/>';else if(perc){const pp=percDisplay(n.midi);pitchXml=`<unpitched><display-step>${pp.step}</display-step><display-octave>${pp.oct}</display-octave></unpitched>`}else{const pp=pitch(Math.round(+n.midi||60));pitchXml=`<pitch><step>${pp.n}</step>${pp.a?'<alter>1</alter>':''}<octave>${pp.o}</octave></pitch>`}const not=[];if(tieStop)not.push('<tied type="stop"/>');if(n.tieToNext)not.push('<tied type="start"/>');if(slurStop)not.push('<slur type="stop" number="1"/>');if(n.slurToNext)not.push('<slur type="start" number="1"/>');const a=articulationXml(n.articulation);if(a)not.push(a);return`<note>${chord?'<chord/>':''}${pitchXml}<duration>${du}</duration><voice>${voice}</voice><type>${noteType(n.duration)}</type>${n.tieToNext?'<tie type="start"/>':''}${tieStop?'<tie type="stop"/>':''}${tupletXml(n)}${grand?`<staff>${n.staff==='bass'||(+n.midi||60)<60?2:1}</staff>`:''}${n.lyric?`<lyric><text>${esc(n.lyric)}</text></lyric>`:''}${not.length?`<notations>${not.join('')}</notations>`:''}</note>`}
function exportXML(song){const div=24,parts=song.parts||[],ids=parts.map((_,i)=>'P'+(i+1)),ts=String(song.timeSignature||'4/4').split('/'),beats=ts[0]||'4',beatType=ts[1]||'4',measureTicks=Math.max(1,Math.round(beatsPerBar(song)*div));let head=`<?xml version="1.0" encoding="UTF-8"?><score-partwise version="4.0"><work><work-title>${esc(song.title)}</work-title></work><identification><creator type="composer">${esc(song.composer)}</creator><encoding><software>Music 63 Studio</software></encoding></identification><part-list>`;
 parts.forEach((p,i)=>{const inf=g.MUSIC63_NOTATION?.INSTRUMENTS?.[p.instrument]||{},program=(+inf.program||0)+1;head+=`<score-part id="${ids[i]}"><part-name>${esc(p.name||p.instrument)}</part-name><score-instrument id="${ids[i]}-I1"><instrument-name>${esc(inf.label||p.instrument||'Instrument')}</instrument-name></score-instrument><midi-instrument id="${ids[i]}-I1"><midi-channel>${i%15+1}</midi-channel><midi-program>${program}</midi-program></midi-instrument></score-part>`});head+='</part-list>';
 let body='';parts.forEach((p,pi)=>{const inf=g.MUSIC63_NOTATION?.INSTRUMENTS?.[p.instrument]||{},off=+inf.soundingOffset||0,grand=g.MUSIC63_NOTATION?.isGrand?.(p),clef=g.MUSIC63_NOTATION?.partClef?.(p)||'treble',perc=inf.family==='percussion',all=(p.notes||[]).map((n,i)=>({...n,_i:i})).sort((a,b)=>(a.bar-b.bar)||(a.beat-b.beat)||((+a.voice||1)-(+b.voice||1))),tieStop=new Set(),slurStop=new Set();
  for(const v of [1,2]){const seq=all.filter(n=>(+n.voice||1)===v&&!n.rest);for(let i=1;i<seq.length;i++){const prev=seq[i-1],cur=seq[i];if(prev.tieToNext&&Math.round(+prev.midi||0)===Math.round(+cur.midi||0))tieStop.add(cur._i);if(prev.slurToNext)slurStop.add(cur._i)}}
  const max=Math.max(+song.scoreBars||1,1,...all.map(n=>+n.bar||1));body+=`<part id="${ids[pi]}">`;
  for(let bar=1;bar<=max;bar++){body+=`<measure number="${bar}">`;if(bar===1){body+=`<attributes><divisions>${div}</divisions><key><fifths>${fifths(song)}</fifths><mode>${song.mode==='minor'?'minor':'major'}</mode></key><time><beats>${esc(beats)}</beats><beat-type>${esc(beatType)}</beat-type></time>`;if(grand)body+='<staves>2</staves>'+clefXml('treble','1')+clefXml('bass','2');else body+=clefXml(clef);if(off)body+=`<transpose><chromatic>${off}</chromatic></transpose>`;body+=`</attributes><direction placement="above"><direction-type><metronome><beat-unit>quarter</beat-unit><per-minute>${+song.bpm||92}</per-minute></metronome></direction-type><sound tempo="${+song.bpm||92}"/></direction>`}
   const chords=(song.chords||[]).filter(c=>(+c.bar||1)===bar).sort((a,b)=>(+a.beat||1)-(+b.beat||1));for(const c of chords)body+=harmonyXml(c);
   const barNotes=all.filter(n=>(+n.bar||1)===bar),voices=[...new Set(barNotes.map(n=>+n.voice||1))].sort((a,b)=>a-b);if(!voices.length)voices.push(1);
   voices.forEach((voice,vi)=>{if(vi)body+=`<backup><duration>${measureTicks}</duration></backup>`;let cursor=0;const ns=barNotes.filter(n=>(+n.voice||1)===voice).sort((a,b)=>(+a.beat||1)-(+b.beat||1)||(+a.midi||0)-(+b.midi||0)),groups=new Map();for(const n of ns){const st=Math.max(0,Math.round(((+n.beat||1)-1)*div)),k=String(st);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(n)}for(const [k,grp] of groups){const start=+k;if(start>cursor)body+=`<forward><duration>${start-cursor}</duration></forward>`;let maxDu=0;grp.forEach((n,j)=>{const du=Math.max(1,Math.round((+n.duration||1)*div));maxDu=Math.max(maxDu,du);if(n.dynamic&&j===0)body+=`<direction placement="below"><direction-type><dynamics><${esc(n.dynamic)}/></dynamics></direction-type></direction>`;body+=noteXml(n,{voice,du,grand,perc,tieStop:tieStop.has(n._i),slurStop:slurStop.has(n._i),chord:j>0&&!n.rest})});cursor=Math.max(cursor,start+maxDu)}if(cursor<measureTicks)body+=`<forward><duration>${measureTicks-cursor}</duration></forward>`});body+='</measure>'}
  body+='</part>'});return head+body+'</score-partwise>'}
function download(song){const xml=exportXML(song),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([xml],{type:'application/vnd.recordare.musicxml+xml'}));a.download=(song.title||'song').replace(/[^\p{L}\p{N}_-]+/gu,'_')+'.musicxml';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1200)}
function inferInstrument(name,clef,grand){const n=String(name||'').toLowerCase();if(clef==='percussion')return'Drum Kit';if(grand&&/accordion|akordeon/.test(n))return'Accordion';if(grand)return'Piano';const tests=[['Clarinet Bb',/clarinet|klarnet/],['Alto Sax Eb',/alto.*sax|altsax/],['Tenor Sax Bb',/tenor.*sax/],['Flute',/flute|flauta/],['Oboe',/oboe|oboja/],['Bassoon',/bassoon|fagot/],['Trumpet',/trumpet|trompet/],['Trombone',/trombon/],['Violin',/violin|vijol/],['Viola',/viola/],['Cello',/cello|čell/],['Double Bass',/double bass|contrabass|kontrabas/],['Guitar',/guitar|ģitār/],['Accordion',/accordion|akordeon/],['Piano',/piano|klavier/]];for(const [i,r] of tests)if(r.test(n))return i;return clef==='bass'?'Cello':'Piano'}
function fifthKey(f,mode){const maj={0:'C',1:'G',2:'D',3:'A',4:'E',5:'B',6:'F#',7:'C#','-1':'F','-2':'Bb','-3':'Eb','-4':'Ab','-5':'Db','-6':'Gb','-7':'Cb'},min={0:'A',1:'E',2:'B',3:'F#',4:'C#',5:'G#',6:'D#',7:'A#','-1':'D','-2':'G','-3':'C','-4':'F','-5':'Bb','-6':'Eb','-7':'Ab'};return(mode==='minor'?min:maj)[f]||(mode==='minor'?'A':'C')}
function parseHarmony(h){const st=h.querySelector('root-step')?.textContent||'',al=+(h.querySelector('root-alter')?.textContent||0),kind=h.querySelector('kind'),txt=kind?.getAttribute('text')||'',kv=kind?.textContent||'';if(!st)return'';const acc=al===1?'#':al===-1?'b':'';if(txt)return st+acc+txt;const q=kv==='minor'?'m':kv==='dominant'?'7':kv==='major-seventh'?'maj7':kv==='minor-seventh'?'m7':kv==='diminished'?'dim':kv==='suspended-fourth'?'sus4':kv==='major-sixth'?'6':'';return st+acc+q}
function parse(text){
 const x=new DOMParser().parseFromString(text,'application/xml');
 if(x.querySelector('parsererror')) throw new Error('Invalid MusicXML.');
 const title=x.querySelector('work-title')?.textContent||'Imported MusicXML';
 const composer=x.querySelector('creator[type="composer"]')?.textContent||'';
 const bpm=+(x.querySelector('sound[tempo]')?.getAttribute('tempo')||x.querySelector('per-minute')?.textContent||92);
 const first=x.querySelector('part measure');
 const fif=+(first?.querySelector(':scope > attributes > key > fifths')?.textContent||0);
 const mode=(first?.querySelector(':scope > attributes > key > mode')?.textContent||'major').toLowerCase()==='minor'?'minor':'major';
 const key=fifthKey(fif,mode);
 const beats=first?.querySelector(':scope > attributes > time > beats')?.textContent||'4';
 const bt=first?.querySelector(':scope > attributes > time > beat-type')?.textContent||'4';
 const timeSignature=beats+'/'+bt;
 const sem={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
 const partNames={};
 x.querySelectorAll('score-part').forEach(sp=>{partNames[sp.id]=sp.querySelector('part-name')?.textContent||'Part'});
 const parts=[],chords=[];
 x.querySelectorAll('part').forEach((part,pi)=>{
  let notes=[],div=1,staffMode='',clef='treble',pendingDynamic='';
  part.querySelectorAll(':scope > measure').forEach((m,mi)=>{
   const nd=+(m.querySelector(':scope > attributes > divisions')?.textContent||div); if(nd)div=nd;
   if(m.querySelector(':scope > attributes > staves')?.textContent==='2') staffMode='grand';
   const sign=m.querySelector(':scope > attributes > clef > sign')?.textContent;
   if(sign==='F')clef='bass'; else if(sign==='percussion')clef='percussion'; else if(sign==='G')clef='treble';
   let pos=0; const lastOnsetByVoice={};
   for(const el of m.children){
    const tag=el.tagName;
    if(tag==='backup'){pos=Math.max(0,pos-(+(el.querySelector('duration')?.textContent||0)));continue}
    if(tag==='forward'){pos+=+(el.querySelector('duration')?.textContent||0);continue}
    if(tag==='direction'){
      const dyn=el.querySelector('dynamics')?.firstElementChild?.tagName;
      if(dyn)pendingDynamic=dyn;
      continue;
    }
    if(tag==='harmony'){
      const symbol=parseHarmony(el);
      if(symbol)chords.push({bar:mi+1,beat:1,symbol});
      continue;
    }
    if(tag!=='note')continue;
    const voice=+(el.querySelector('voice')?.textContent||1);
    const duTicks=+(el.querySelector('duration')?.textContent||div);
    const isChord=!!el.querySelector(':scope > chord');
    const onset=isChord?(lastOnsetByVoice[voice]??pos):pos;
    const dur=duTicks/div;
    const beat=1+onset/div;
    const lyric=el.querySelector('lyric text')?.textContent||'';
    const tuplet=+(el.querySelector('time-modification actual-notes')?.textContent||0);
    const art=el.querySelector('articulations staccato')?'staccato':el.querySelector('articulations accent')?'accent':el.querySelector('articulations tenuto')?'tenuto':el.querySelector('articulations strong-accent')?'marcato':'';
    const base={
      bar:mi+1, beat:+beat.toFixed(4), duration:dur, voice, lyric, tuplet:tuplet||0,
      articulation:art, dynamic:pendingDynamic||'',
      tieToNext:!!el.querySelector('tie[type="start"]'),
      slurToNext:!!el.querySelector('slur[type="start"]'),
      staff:el.querySelector('staff')?.textContent==='2'?'bass':'treble'
    };
    pendingDynamic='';
    if(el.querySelector('rest')){
      notes.push({...base,midi:60,rest:true});
    } else if(el.querySelector('unpitched')){
      const ds=el.querySelector('display-step')?.textContent||'B';
      const oc=+(el.querySelector('display-octave')?.textContent||4);
      const di=oc*7+({C:0,D:1,E:2,F:3,G:4,A:5,B:6}[ds]||0);
      const step=di-30,map=[36,36,41,41,38,38,45,47,48,42,46];
      const midi=map[Math.max(0,Math.min(10,step))]||38;
      notes.push({...base,midi,rest:false});
    } else {
      const st=el.querySelector('pitch step')?.textContent||'C';
      const al=+(el.querySelector('pitch alter')?.textContent||0);
      const oc=+(el.querySelector('pitch octave')?.textContent||4);
      const midi=(oc+1)*12+sem[st]+al;
      notes.push({...base,midi,velocity:88,rest:false});
    }
    lastOnsetByVoice[voice]=onset;
    if(!isChord)pos+=duTicks;
   }
  });
  const id=part.getAttribute('id')||'';
  const name=partNames[id]||('Part '+(pi+1));
  const instrument=inferInstrument(name,clef,staffMode==='grand');
  parts.push({
    id:'part_'+Math.random().toString(36).slice(2,10),name,instrument,
    staffMode:staffMode||(g.MUSIC63_NOTATION?.INSTRUMENTS?.[instrument]?.grand?'grand':undefined),
    clef:clef==='percussion'?'percussion':undefined,notes
  });
 });
 return {title,composer,bpm,key,mode,timeSignature,parts,chords,scoreBars:Math.max(1,...parts.flatMap(p=>p.notes.map(n=>n.bar||1)))};
}
g.MUSIC63_XML={download,exportXML,parse};
})(window);
