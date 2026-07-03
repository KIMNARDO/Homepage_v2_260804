// product-*.html의 기능 아이콘 글리프 → 3D webp <img> 교체 (페이지 테마색 단색)
// 대상 컨테이너: .cap-bento-icon / .spec-card-icon / .outcome-icon / .integration-logo-item
// 제외: 히어로 배지(.product-badge), 네비/푸터 등 UI 글리프
import { readFileSync, writeFileSync, existsSync } from 'fs';
const ROOT = '/mnt/d/jarvix/projects/papsnet-homepage/papsnet-homepage-main/';
const OUTdir = ROOT + 'images/icons3d/';

const PAGES = {
  'product-cadwin.html':'cyan',
  'product-clippdm.html':'blue',
  'product-clippms.html':'orange',
  'product-multibom.html':'green',
  'product-clipcms.html':'purple',
};
// 소스가 없어 기존 3D로 대체하는 매핑(중복 회피 포함)
const SUB = {
  sync:'published_with_changes', sync_alt:'published_with_changes',
  history:'manage_history', schedule:'manage_history', event_note:'manage_history',
  storage:'database', savings:'payments',
  order_approve:'task_alt', analytics:'query_stats', view_kanban:'dashboard',
  compare_arrows:'swap_horiz', content_copy:'file_copy',
  request_quote:'description', park:'hub',
};
const used = new Set();
function imgFor(glyph, color){
  const src = SUB[glyph] || glyph;
  const file = `${src}-${color}`;
  used.add(file);
  return `<img src="images/icons3d/${file}.webp" alt="" loading="lazy" decoding="async">`;
}

for(const [file,color] of Object.entries(PAGES)){
  let html = readFileSync(ROOT+file,'utf8');
  let n=0;
  const wrap = /(<div class="(?:cap-bento-icon|spec-card-icon|outcome-icon)">)\s*<span class="material-symbols-rounded">([a-z_]+)<\/span>\s*(<\/div>)/g;
  html = html.replace(wrap, (m,a,g,b)=>{ n++; return a+imgFor(g,color)+b; });
  const logo = /(<div class="integration-logo-item">)\s*<span class="material-symbols-rounded">([a-z_]+)<\/span>/g;
  html = html.replace(logo, (m,a,g)=>{ n++; return a+'\n                    '+imgFor(g,color); });
  writeFileSync(ROOT+file, html);
  console.log(file.padEnd(24), color.padEnd(7), 'replaced', n);
}
// 참조된 webp 존재 확인
const missing = [...used].filter(f=>!existsSync(OUTdir+f+'.webp'));
console.log('\n참조 파일 수:', used.size, '| 누락:', missing.length ? missing.join(', ') : '없음');
