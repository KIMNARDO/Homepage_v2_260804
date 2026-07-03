// 3D 아이콘: 배경 제거(플러드필) + 휘도 기반 듀오톤 리컬러 + 트림 + webp
// WSL: node scripts/_iconproc.mjs   (Playwright Chromium 사용)
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs';

const ROOT = '/mnt/d/jarvix/projects/papsnet-homepage/papsnet-homepage-main/';
const SRC = '/mnt/d/jarvix/projects/papsnet-homepage/newicon/stitch_modern_corporate_icon_redesign/';
const NEW16 = '/mnt/d/jarvix/projects/papsnet-homepage/newicon/new16/'; // 낱개 <name>.png
const OUT = ROOT + 'images/icons3d/';
mkdirSync(OUT, { recursive: true });

const COLORS = { blue:'#2563eb', green:'#16a34a', purple:'#7c3aed', amber:'#d97706', orange:'#ea580c', red:'#dc2626', cyan:'#0891b2' };

// 새로 추가한 16종(낱개 파일). 이름이 곧 파일명.
const NEW16SET = new Set(['view_in_ar','file_copy','search','swap_horiz','lock','support_agent','factory','view_timeline','route','warning','layers','calculate','tune','settings','handshake','smart_toy']);

// 아이콘 이름 → 소스 폴더 식별 키워드 (기존 스티치 폴더용)
const KW = {
  draw:'pencil_edit_tool', account_tree:'hierarchy_tree', hub:'hub_or_network', monitoring:'monitoring_or_data',
  manage_history:'history_management', payments:'payments_or_stacked', speed:'speed_or_a_speedometer', trending_up:'trending_up',
  shield:'security_shield_front', gpp_maybe:'shield_with_an_alert', group:'group_of_people', description:'document_file_with_text',
  fact_check:'fact_check', calendar_month:'a_calendar', groups:'multiple_user_groups', article:'article_or_news',
  forum:'chat_bubble', task_alt:'task_completion', notifications:'notification_bell', directions_car:'contemporary_car',
  memory:'microchip', medical_services:'medical_services', database:'a_database', published_with_changes:'publishing_with_changes',
  query_stats:'query_statistics', verified:'scalloped_badge', dashboard:'dashboard_grid',
};

// 제품 상세 페이지용 조합 (페이지 테마색으로 단색 통일)
const JOBS = [
  // CADWin (cyan)
  ['smart_toy','cyan'],['account_tree','cyan'],['published_with_changes','cyan'],['draw','cyan'],['view_in_ar','cyan'],
  ['file_copy','cyan'],['verified','cyan'],['manage_history','cyan'],['hub','cyan'],['database','cyan'],
  // Clip PDM (blue)
  ['database','blue'],['search','blue'],['manage_history','blue'],['account_tree','blue'],['swap_horiz','blue'],
  ['lock','blue'],['hub','blue'],['file_copy','blue'],['payments','blue'],['support_agent','blue'],['draw','blue'],
  ['factory','blue'],['forum','blue'],
  // Clip PMS (orange)
  ['manage_history','orange'],['view_timeline','orange'],['route','orange'],['monitoring','orange'],['task_alt','orange'],
  ['warning','orange'],['group','orange'],['calendar_month','orange'],['query_stats','orange'],['dashboard','orange'],
  ['fact_check','orange'],['hub','orange'],
  // Multi-BOM (green)
  ['account_tree','green'],['search','green'],['hub','green'],['layers','green'],['verified','green'],['task_alt','green'],
  ['swap_horiz','green'],['database','green'],
  // Clip CMS (purple)
  ['description','purple'],['calculate','purple'],['tune','purple'],['published_with_changes','purple'],['trending_up','purple'],
  ['handshake','purple'],['swap_horiz','purple'],['groups','purple'],['file_copy','purple'],['settings','purple'],
  ['database','purple'],['account_tree','purple'],['factory','purple'],
];

const folders = readdirSync(SRC, { withFileTypes:true }).filter(d=>d.isDirectory()).map(d=>d.name);
function srcFor(name){
  if(NEW16SET.has(name)) return NEW16 + name + '.png';
  const kw = KW[name]; const f = folders.find(x=>x.includes(kw));
  if(!f) throw new Error('폴더 못찾음: '+name+' ('+kw+')');
  return SRC + f + '/screen.png';
}

const browser = await chromium.launch();
const page = await browser.newPage();
const done = [];
for (const [name, color] of JOBS) {
  const b64 = readFileSync(srcFor(name)).toString('base64');
  const webpB64 = await page.evaluate(async ({ b64, hex, outSize }) => {
    const hexToRgb = h => [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
    const mix = (a,b,t)=>[a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t];
    const img = new Image(); img.src='data:image/png;base64,'+b64; await img.decode();
    const W=img.naturalWidth, H=img.naturalHeight;
    const c=document.createElement('canvas'); c.width=W; c.height=H;
    const ctx=c.getContext('2d'); ctx.drawImage(img,0,0);
    const id=ctx.getImageData(0,0,W,H); const d=id.data;
    // 배경·그림자 = 저채도(회색) 픽셀. 모서리에서 연결된 회색만 제거(아이콘 내부 흰색은 보존)
    const near=i=>{const r=d[i],g=d[i+1],b=d[i+2];const mx=Math.max(r,g,b),mn=Math.min(r,g,b);return mx===0?true:((mx-mn)/mx)<0.25;};
    // 모서리에서 플러드필 → 배경 투명
    const vis=new Uint8Array(W*H); const st=[0,W-1,(H-1)*W,H*W-1];
    while(st.length){ const p=st.pop(); if(vis[p])continue; vis[p]=1; const i=p*4; if(!near(i))continue;
      d[i+3]=0; const x=p%W,y=(p/W)|0;
      if(x>0)st.push(p-1); if(x<W-1)st.push(p+1); if(y>0)st.push(p-W); if(y<H-1)st.push(p+W); }
    // 휘도 범위 계산
    let minL=1,maxL=0;
    for(let i=0;i<d.length;i+=4){ if(d[i+3]>16){ const L=(0.299*d[i]+0.587*d[i+1]+0.114*d[i+2])/255; if(L<minL)minL=L; if(L>maxL)maxL=L; } }
    const rng=Math.max(0.001,maxL-minL);
    const tc=hexToRgb(hex);
    const dark=mix(tc,[9,13,20],0.34), light=mix(tc,[255,255,255],0.58);
    for(let i=0;i<d.length;i+=4){ if(d[i+3]<16)continue;
      let L=(0.299*d[i]+0.587*d[i+1]+0.114*d[i+2])/255; let t=(L-minL)/rng; t=Math.max(0,Math.min(1,t));
      const o=mix(dark,light,t); d[i]=o[0]; d[i+1]=o[1]; d[i+2]=o[2]; }
    ctx.putImageData(id,0,0);
    // 트림(불투명 bbox)
    let x0=W,y0=H,x1=0,y1=0;
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){ if(d[(y*W+x)*4+3]>24){ if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y; } }
    const bw=x1-x0+1, bh=y1-y0+1;
    const margin=Math.round(outSize*0.06), inner=outSize-margin*2, scale=inner/Math.max(bw,bh);
    const out=document.createElement('canvas'); out.width=outSize; out.height=outSize;
    const octx=out.getContext('2d'); octx.imageSmoothingEnabled=true; octx.imageSmoothingQuality='high';
    const dw=bw*scale, dh=bh*scale;
    octx.drawImage(c, x0,y0,bw,bh, (outSize-dw)/2,(outSize-dh)/2, dw,dh);
    return out.toDataURL('image/webp',0.92).split(',')[1];
  }, { b64, hex: COLORS[color], outSize: 176 });
  const file = `${name}-${color}.webp`;
  writeFileSync(OUT + file, Buffer.from(webpB64,'base64'));
  done.push(file);
}
await browser.close();
console.log('OK ('+done.length+'):', done.join(', '));
