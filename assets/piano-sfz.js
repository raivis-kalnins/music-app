/* Music63 SFZ/WAV piano bank importer. Handles the standard SFZ sample/key/velocity/loop subset.
   No network, no eval, no code execution from SFZ; files are always selected explicitly by user.
   Unknown SFZ opcodes are intentionally ignored. */
(function(global) {'use strict';
  const clean = s => String(s || '').replace(/\\/g, '/').replace(/^(?:\.\/)+/, '').replace(/^\/+/, '').toLowerCase();
  function pitch(v) {
    if (v == null || v === '') return null;
    if (/^\d{1,3}$/.test(String(v))) return Math.min(127, +v);
    const m = String(v).trim().match(/^([a-g])([#b]?)(-?\d)$/i);
    if (!m) return null;
    const pc = {c:0,d:2,e:4,f:5,g:7,a:9,b:11}[m[1].toLowerCase()];
    return (Number(m[3]) + 1) * 12 + pc + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  }
  function attributes(body) {
    // In SFZ opcodes, values extend until the next key= expression or section header.
    const result = {}, re = /(?:^|\s)([a-z_][\w]*)\s*=\s*/gi, at = [];
    let m;
    while ((m = re.exec(body))) at.push({key:m[1].toLowerCase(),start:m.index,end:re.lastIndex});
    for (let i=0;i<at.length;i++) {
      const a=at[i], value=body.slice(a.end,i+1<at.length?at[i+1].start:undefined).trim();
      result[a.key]=value.replace(/^['"]|['"]$/g,'');
    }
    return result;
  }
  function parseSfz(text) {
    const src=String(text||'').replace(/\/\*[^]*?\*\//g,'').replace(/\/\/[^\r\n]*/g,'');
    if (/^\s*#include\b/im.test(src)) throw Error('SFZ includes external .sfz files; use a self-contained SFZ/WAV bank.');
    const re=/<(control|global|master|group|region)>/gi, heads=[], regions=[];
    let match;while((match=re.exec(src)))heads.push({section:match[1].toLowerCase(),start:match.index,end:re.lastIndex});
    let control={},globalOps={},master={},group={};
    for(let i=0;i<heads.length;i++){
      const h=heads[i],ops=attributes(src.slice(h.end,i+1<heads.length?heads[i+1].start:undefined));
      if(h.section==='control')control={...control,...ops};
      if(h.section==='global')globalOps={...globalOps,...ops};
      if(h.section==='master'){master=ops;group={};}
      if(h.section==='group')group=ops;
      if(h.section!=='region')continue;
      const o={...globalOps,...master,...group,...ops};
      if(!o.sample || /^(?:\*|silence)$/i.test(o.sample) || o.trigger==='release')continue;
      const root=pitch(o.pitch_keycenter??o.key??60),low=pitch(o.lokey??o.key??root),high=pitch(o.hikey??o.key??root);
      if(root===null||low===null||high===null)continue;
      const sample=clean((control.default_path||'')+o.sample);
      if(!sample)continue;
      regions.push({sample,root,low,high,lowvel:Math.max(1,Number(o.lovel)||1),highvel:Math.min(127,Number(o.hivel)||127),loopMode:o.loop_mode||'no_loop',loopStart:Number(o.loop_start)||0,loopEnd:Number(o.loop_end)||0});
    }
    return regions;
  }
  function sampleNameNote(filename){
    const n=String(filename||'').replace(/\.(wav|wave)$/i,'');
    const m=n.match(/(?:^|[^a-z0-9])(\d{2,3})(?=$|[^a-z0-9])/i);
    if(m&&+m[1]>=21&&+m[1]<=108)return+m[1];
    const mm=n.match(/(?:^|[^a-z0-9])([a-g])([#b]?)(-?\d)(?=$|[^a-z0-9]|v[lh])/i);
    return mm?pitch(mm[1]+mm[2]+mm[3]):null;
  }
  function sampleNameVelocity(filename){
    const name=String(filename||'');
    const m=name.match(/(?:^|[_\s-])(?:v|vel|velocity)(\d{1,3})(?=$|[_\s.\-])/i);
    return m?Math.min(127,Math.max(1,+m[1])):/vL\.(?:wav|wave)$/i.test(name)?45:/vH\.(?:wav|wave)$/i.test(name)?110:96;
  }
  function matchPath(sample,files) {
    const path=clean(sample).replace(/\.flac$/i,'.wav').replace(/\.wave$/i,'.wav');
    const exact=files.find(f=>f.path===path||f.path.endsWith('/'+path));
    if(exact)return exact;
    const base=path.split('/').pop();
    const matches=files.filter(f=>f.path.split('/').pop()===base);
    return matches.length===1?matches[0]:null;
  }
  async function prepareFiles(fileList,opts={}) {
    const maxFiles=opts.maxFiles||256,maxBytes=opts.maxBytes||250*1024*1024;
    const files=[...fileList].filter(f=>f&&f.name);
    const wavs=files.filter(f=>/\.wav$/i.test(f.name));
    if(!wavs.length)throw Error('Nav atrasti WAV paraugi. Lejupielādē FreePats SFZ WAV (nevis FLAC/SF2), atarhivē .7z un izvēlies visu mapi.');
    if(wavs.length>maxFiles)throw Error('Par daudz skaņas failu (maksimums '+maxFiles+').');
    if(wavs.reduce((sum,f)=>sum+(f.size||0),0)>maxBytes)throw Error('Skaņu banka ir pārāk liela šai ierīcei (maksimums '+Math.round(maxBytes/1048576)+' MiB).');
    const indexed=wavs.map(f=>({file:f,path:clean(f.webkitRelativePath||f.name)}));
    const sfzFiles=files.filter(f=>/\.sfz$/i.test(f.name));
    let sfz=null,regions=[];
    for(const f of sfzFiles){
      const parsed=parseSfz(await f.text());
      if(parsed.length){sfz=f;regions=parsed;break;}
    }
    const list=[];
    if(regions.length){
      for(const region of regions){
        const match=matchPath(region.sample,indexed);
        if(!match)continue;
        list.push({...region,file:match.file});
      }
      if(!list.length)throw Error('SFZ kartējumā norādītie WAV faili nav atrasti. Izvēlies visu atarhivēto mapi (kopā ar samples/ apakšmapi).');
    }else{
      for(const file of wavs){
        const note=sampleNameNote(file.name);
        if(note===null||note<21||note>108)continue;
        const vel=sampleNameVelocity(file.name);
        list.push({file,root:note,low:note,high:note,lowvel:vel,highvel:vel,loopMode:'no_loop',loopStart:0,loopEnd:0});
      }
      if(!list.length)throw Error('Neizdevās noteikt WAV notis. FreePats bankai izvēlies SFZ failu un WAV failus kopā.');
    }
    return {name:sfz?sfz.name.replace(/\.sfz$/i,''):"Local WAV piano",regions:list,missing:Math.max(0,regions.length-list.length),bytes:wavs.reduce((s,f)=>s+(f.size||0),0)};
  }
  function choose(regions,note,velocity) {
    if(!regions?.length)return null;
    let best=null,score=Infinity;
    for(const sample of regions){
      const low=Number.isFinite(sample.low)?sample.low:sample.root;
      const high=Number.isFinite(sample.high)?sample.high:sample.root;
      const lvel=Number.isFinite(sample.lowvel)?sample.lowvel:1;
      const hvel=Number.isFinite(sample.highvel)?sample.highvel:127;
      const keyPenalty=note<low?(low-note)*250:note>high?(note-high)*250:0;
      const velocityPenalty=velocity<lvel?(lvel-velocity)*3:velocity>hvel?(velocity-hvel)*3:0;
      const centerPenalty=Math.abs(note-sample.root)*.08;
      const scoreHere=keyPenalty+velocityPenalty+centerPenalty;
      if(scoreHere<score){score=scoreHere;best=sample;}
    }
    return best;
  }
  global.Music63PianoSFZ={parseSfz,prepareFiles,choose,pitch};
})(typeof window!=='undefined'?window:globalThis);
