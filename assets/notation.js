(function(g){'use strict';
const NS='http://www.w3.org/2000/svg';
const INSTRUMENTS={
  'Clarinet Bb':{label:'Clarinet B♭',soundingOffset:-2,program:71},
  'Clarinet Bb (as written)':{label:'Clarinet B♭ (as written)',soundingOffset:0,program:71},
  'Alto Sax Eb':{label:'Alto Sax E♭',soundingOffset:-9,program:65},
  'Tenor Sax Bb':{label:'Tenor Sax B♭',soundingOffset:-14,program:66},
  Piano:{label:'Piano',soundingOffset:0,program:0},Accordion:{label:'Accordion',soundingOffset:0,program:21},
  Guitar:{label:'Guitar',soundingOffset:0,program:24},Violin:{label:'Violin',soundingOffset:0,program:40}
};
const sharp=['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
const flat=['C','D♭','D','E♭','E','F','G♭','G','A♭','A','B♭','B'];
const flatKeys=new Set(['F','Bb','Eb','Ab','Db','Gb','Cb','Dm','Gm','Cm','Fm','Bbm','Ebm']);
const KEY_SIG={C:{},G:{F:1},D:{F:1,C:1},A:{F:1,C:1,G:1},E:{F:1,C:1,G:1,D:1},B:{F:1,C:1,G:1,D:1,A:1},'F#':{F:1,C:1,G:1,D:1,A:1,E:1},F:{B:-1},Bb:{B:-1,E:-1},Eb:{B:-1,E:-1,A:-1},Ab:{B:-1,E:-1,A:-1,D:-1},Db:{B:-1,E:-1,A:-1,D:-1,G:-1},Gb:{B:-1,E:-1,A:-1,D:-1,G:-1,C:-1}};
const LIDX={C:0,D:1,E:2,F:3,G:4,A:5,B:6}, NSEMI={C:0,D:2,E:4,F:5,G:7,A:9,B:11}, LETTERS=['C','D','E','F','G','A','B'];
function normKey(k='C'){return String(k||'C').replace('♭','b').replace('♯','#').replace(/m$/,'')}
function beatsPerBar(song){const t=String(song?.timeSignature||'4/4').split('/').map(Number),n=t[0]||4,d=t[1]||4;return Math.max(1,n*(4/d))}
function midiName(m,key='C'){m=Math.max(0,Math.min(127,Math.round(+m||60)));const n=(flatKeys.has(String(key).replace('♭','b'))?flat:sharp)[m%12];return n+(Math.floor(m/12)-1)}
function parts(m,key='C'){const x=midiName(m,key).match(/^([A-G])([♯♭]?)(-?\d+)$/);return{l:x[1],a:x[2],o:+x[3]}}
function dindex(m,key='C'){const p=parts(m,key);return p.o*7+LIDX[p.l]}
function el(n,a={},t=''){const x=document.createElementNS(NS,n);Object.entries(a).forEach(([k,v])=>x.setAttribute(k,v));if(t)x.textContent=t;return x}
function y(m,b,gap,key){return b-(dindex(m,key)-(4*7+2))*(gap/2)}
function naturalMidiFromDiatonic(di,key='C',accidental='auto'){let octave=Math.floor(di/7),li=((di%7)+7)%7,letter=LETTERS[li],m=(octave+1)*12+NSEMI[letter],adj=0;if(accidental==='sharp')adj=1;else if(accidental==='flat')adj=-1;else if(accidental==='natural')adj=0;else adj=(KEY_SIG[normKey(key)]||{})[letter]||0;return Math.max(0,Math.min(127,m+adj))}
function accidentalForMidi(m,key='C'){return parts(m,key).a||''}
function layout(song,part){const notes=part?.notes||[],ch=song?.chords||[],requested=+song?.scoreBars||0,max=Math.max(4,requested,...notes.map(n=>+n.bar||1),...ch.map(c=>+c.bar||1)),bps=Math.max(1,Math.min(8,+song?.barsPerRow||4)),systems=Math.ceil(max/bps),W=1120,left=145,right=26,gap=13,sysH=218,H=54+systems*sysH,barW=(W-left-right)/bps;return{max,bps,systems,W,left,right,gap,sysH,H,barW}}
function durationFlag(grp,x,yy,up,d){if(d>=1)return;const sx=up?x+6:x-6,top=up?yy-32:yy+32,dir=up?1:-1;const p=el('path',{d:`M ${sx} ${top} q ${12*dir} ${7} ${15*dir} ${18}`,class:'flag'});grp.appendChild(p);if(d<.5)grp.appendChild(el('path',{d:`M ${sx} ${top+(up?8:-8)} q ${12*dir} ${7} ${15*dir} ${18}`,class:'flag'}))}
function deleteHandle(grp,x,yy,show){const g=el('g',{class:'note-delete-handle'+(show?' visible':''),'data-delete-handle':'1',transform:`translate(${x+19} ${yy-18})`});g.appendChild(el('circle',{cx:0,cy:0,r:9,class:'note-delete-circle'}));g.appendChild(el('line',{x1:-3.6,y1:-3.6,x2:3.6,y2:3.6,class:'note-delete-x'}));g.appendChild(el('line',{x1:3.6,y1:-3.6,x2:-3.6,y2:3.6,class:'note-delete-x'}));grp.appendChild(g)}
function noteHitArea(grp,x,yy){grp.insertBefore(el('rect',{x:x-15,y:yy-24,width:30,height:48,rx:8,class:'note-hit-area'}),grp.firstChild)}
function render(host,song,part,opts={}){
  host.innerHTML='';
  const notes=(part?.notes||[]).map((n,i)=>({...n,_i:i})).sort((a,b)=>(a.bar-b.bar)||(a.beat-b.beat)),ch=song?.chords||[],L=layout(song,part),bpb=beatsPerBar(song),svg=el('svg',{viewBox:`0 0 ${L.W} ${L.H}`,class:'score-svg','data-bars-per-row':L.bps});
  svg.appendChild(el('text',{x:20,y:25,class:'score-mini-title'},`${song?.title||'Untitled'} — ${part?.name||part?.instrument||'Part'}`));
  for(let s=0;s<L.systems;s++){
    const btm=40+s*L.sysH+83;
    svg.appendChild(el('text',{x:15,y:btm-14,class:'instrument-label'},INSTRUMENTS[part?.instrument]?.label||part?.name||'Part'));
    for(let l=0;l<5;l++)svg.appendChild(el('line',{x1:L.left,y1:btm-l*L.gap,x2:L.W-L.right,y2:btm-l*L.gap,class:'staff-line'}));
    svg.appendChild(el('text',{x:L.left-54,y:btm-3,class:'clef'},'𝄞'));
    svg.appendChild(el('text',{x:L.left-25,y:btm-18,class:'time'},song?.timeSignature||'4/4'));
    for(let j=0;j<=L.bps;j++)svg.appendChild(el('line',{x1:L.left+j*L.barW,y1:btm,x2:L.left+j*L.barW,y2:btm-4*L.gap,class:'bar-line'}));
    for(let j=0;j<L.bps;j++){
      const bar=s*L.bps+j+1;if(bar>L.max)continue;const bx=L.left+j*L.barW;
      svg.appendChild(el('text',{x:bx+5,y:btm-4*L.gap-14,class:'bar-number'},bar));
      ch.filter(c=>(+c.bar||1)===bar).forEach(c=>svg.appendChild(el('text',{x:bx+((+c.beat||1)-1)/bpb*L.barW+10,y:btm-4*L.gap-29,class:'chord'},c.symbol||'')));
      const barNotes=notes.filter(n=>(+n.bar||1)===bar).map(n=>{const dur=Math.max(.125,+n.duration||1),x=bx+(((+n.beat||1)-1)+Math.min(dur,.9)/2)/bpb*L.barW+3,yy=y(+n.midi||60,btm,L.gap,song?.key||'C');return{...n,dur,x,yy}});
      const beamMap=new Map(),beamGroups=[];
      if(opts.beamNotes!==false){
        const unit=String(song?.timeSignature||'4/4')==='6/8'?1.5:1;
        const buckets=new Map();
        for(const n of barNotes){const k=Math.floor(((+n.beat||1)-1+1e-6)/unit);if(!buckets.has(k))buckets.set(k,[]);buckets.get(k).push(n)}
        for(const arr of buckets.values()){
          let run=[];const flush=()=>{if(run.length>=2){const beamY=Math.min(...run.map(n=>n.yy))-34,g={notes:[...run],beamY};beamGroups.push(g);run.forEach(n=>beamMap.set(n._i,g))}run=[]};
          for(const n of arr.sort((a,b)=>(a.beat-b.beat))){if(!n.rest&&n.dur<=.5){if(run.length){const prev=run[run.length-1],gap=(+n.beat||1)-(+prev.beat||1);if(gap>Math.max(.51,prev.dur+.13))flush()}run.push(n)}else flush()}flush();
        }
      }
      for(const n of barNotes){
        const {dur,x,yy}=n,showDelete=!!opts.deleteMode||n._i===opts.selectedIndex;
        if(n.rest){const ry=btm-15,grp=el('g',{class:`score-note rest-group${n._i===opts.selectedIndex?' selected':''}`,'data-index':n._i,'data-bar':bar,'data-beat':n.beat,'data-midi':n.midi,tabindex:'0'});grp.appendChild(el('rect',{x:x-16,y:ry-24,width:32,height:42,rx:8,class:'note-hit-area'}));grp.appendChild(el('text',{x:x-7,y:ry,class:'rest'},dur>=4?'𝄻':dur>=2?'𝄼':dur>=1?'𝄽':'𝄾'));deleteHandle(grp,x,ry,showDelete);svg.appendChild(grp);continue}
        if(yy>btm+L.gap/4)for(let ly=btm+L.gap;ly<=yy+1;ly+=L.gap)svg.appendChild(el('line',{x1:x-9,y1:ly,x2:x+9,y2:ly,class:'ledger'}));
        if(yy<btm-4*L.gap-L.gap/4)for(let ly=btm-5*L.gap;ly>=yy-1;ly-=L.gap)svg.appendChild(el('line',{x1:x-9,y1:ly,x2:x+9,y2:ly,class:'ledger'}));
        const p=parts(+n.midi||60,song?.key||'C'),grp=el('g',{class:`score-note${n._i===opts.selectedIndex?' selected':''}`,'data-index':n._i,'data-bar':bar,'data-beat':n.beat,'data-midi':n.midi,tabindex:'0'});noteHitArea(grp,x,yy);if(p.a)grp.appendChild(el('text',{x:x-19,y:yy+5,class:'acc'},p.a));grp.appendChild(el('ellipse',{cx:x,cy:yy,rx:7.4,ry:4.8,class:dur>=2?'note-head open':'note-head'}));
        if(dur<4){const bg=beamMap.get(n._i);if(bg){const sx=x+6.5;grp.appendChild(el('line',{x1:sx,y1:yy,x2:sx,y2:bg.beamY,class:'stem'}))}else{const up=yy>btm-2*L.gap,sx=up?x+6.5:x-6.5,sy=up?yy-32:yy+32;grp.appendChild(el('line',{x1:sx,y1:yy,x2:sx,y2:sy,class:'stem'}));durationFlag(grp,x,yy,up,dur)}}
        const noteNameY=Math.max(btm+27,yy+25);if(opts.showNoteNames!==false)grp.appendChild(el('text',{x:x-13,y:noteNameY,class:'note-name'},midiName(+n.midi||60,song?.key||'C')));if(n.lyric)grp.appendChild(el('text',{x:x-14,y:Math.max(btm+46,yy+44),class:'lyric'},n.lyric));deleteHandle(grp,x,yy,showDelete);svg.appendChild(grp)
      }
      for(const g of beamGroups){const xs=g.notes.map(n=>n.x+6.5),x1=Math.min(...xs),x2=Math.max(...xs);svg.appendChild(el('line',{x1,y1:g.beamY,x2,y2:g.beamY,class:'beam'}));for(let q=0;q<g.notes.length-1;q++){const a=g.notes[q],b=g.notes[q+1];if(a.dur<=.25&&b.dur<=.25)svg.appendChild(el('line',{x1:a.x+6.5,y1:g.beamY+6,x2:b.x+6.5,y2:g.beamY+6,class:'beam beam-secondary'}))}}
    }
  }
  host.appendChild(svg);return svg
}
function clientToSvg(svg,clientX,clientY){const r=svg.getBoundingClientRect(),vb=svg.viewBox.baseVal;return{x:(clientX-r.left)/r.width*vb.width+vb.x,y:(clientY-r.top)/r.height*vb.height+vb.y}}
function pointToMusic(svg,clientX,clientY,song,part,accidental='auto',snap=.25){const P=clientToSvg(svg,clientX,clientY),L=layout(song,part),bpb=beatsPerBar(song),sys=Math.max(0,Math.min(L.systems-1,Math.floor((P.y-40)/L.sysH))),btm=40+sys*L.sysH+83,j=Math.max(0,Math.min(L.bps-1,Math.floor((P.x-L.left)/L.barW))),bar=sys*L.bps+j+1,within=P.x-(L.left+j*L.barW),rawBeat=1+(within/L.barW)*bpb,beat=Math.max(1,Math.min(bpb,1+Math.round((rawBeat-1)/snap)*snap)),step=Math.round((btm-P.y)/(L.gap/2)),di=4*7+2+step,midi=naturalMidiFromDiatonic(di,song?.key||'C',accidental);return{bar,beat:+beat.toFixed(3),midi,system:sys}}
function transposePart(p,s){p=JSON.parse(JSON.stringify(p||{}));p.notes=(p.notes||[]).map(n=>({...n,midi:Math.max(0,Math.min(127,(+n.midi||60)+s))}));return p}
function soundingMidi(w,inst){return(+w||60)+(INSTRUMENTS[inst]?.soundingOffset||0)}
function instrumentOptions(){return Object.entries(INSTRUMENTS).map(([value,v])=>({value,label:v.label}))}
g.MUSIC63_NOTATION={INSTRUMENTS,midiName,render,transposePart,soundingMidi,instrumentOptions,pointToMusic,beatsPerBar,layout,accidentalForMidi};
})(window);
