// index.html의 .icard-ic 글리프 → 3D webp <img> 로 일괄 교체 (카드 c-색상 기준)
import { readFileSync, writeFileSync } from 'fs';
const f = '/mnt/d/jarvix/projects/papsnet-homepage/papsnet-homepage-main/index.html';
let html = readFileSync(f, 'utf8');
// 소스 아이콘이 없어 대체하는 매핑
const SUB = { difference: 'account_tree', cached: 'published_with_changes' };
let n = 0; const used = [];
html = html.replace(
  /(class="icard (c-[a-z]+)"[^>]*>\s*)<span class="icard-ic"><span class="material-symbols-rounded"[^>]*>([a-z_]+)<\/span><\/span>/g,
  (m, prefix, cc, glyph) => {
    const color = cc.slice(2);
    const base = SUB[glyph] || glyph;
    const file = `${base}-${color}`;
    n++; used.push(file);
    return prefix + `<span class="icard-ic"><img src="images/icons3d/${file}.webp" alt="" loading="lazy" decoding="async"></span>`;
  }
);
writeFileSync(f, html);
console.log('replaced =', n);
console.log(used.join('\n'));
