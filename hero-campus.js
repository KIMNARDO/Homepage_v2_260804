import floorMeshes from './campus-meshes.json';

import { recordSelection } from './hero-record-data.js';

export function setupCampus(viewer, stage) {
  const slide = stage.closest('figure');
  const layers = stage.querySelector('.building-layers');
  const choices = Array.from(slide.querySelectorAll('[data-floor]'));
  const pins = [];
  let opened = false;

  function separate(open) {
    opened = open;
    viewer.currentTime = open ? Math.max(0,viewer.duration-.001) : 0;
    layers.setAttribute('aria-pressed', String(open));
    layers.textContent = open ? '층 다시 조립' : '층별 분해';
    pins.forEach((pin,i) => {
      const x = [-.5,.43,-.65][i];
      viewer.updateHotspot({name:pin.slot,position:x+'m '+(.76+i*1.32+(open?i*.7:0))+'m '+[2.16,2.10,1.63][i]+'m'});
    });
  }
  function highlight(index) {
    viewer.model?.materials.forEach(mat=>{
      const floor = /^Level ([123]) fascia$/.exec(mat.name);
      if (floor) mat.pbrMetallicRoughness.setBaseColorFactor(Number(floor[1])===index+1 ? [.62,.78,.25,1] : [.44,.46,.44,1]);
    });
  }
  function select(index) {
    if (!stage.classList.contains('model-ready')) return;
    separate(true);
    highlight(index);
    choices.forEach((button,i) => {
      for (const control of [button,pins[i]]) control.setAttribute('aria-pressed',String(index===i));
    });
    slide.dispatchEvent(new CustomEvent('hero-record-select', {
      bubbles:true, detail:recordSelection('building', index)
    }));
  }
  choices.forEach((button,i) => {
    const pin=document.createElement('button');
    pin.type='button';pin.slot='hotspot-floor-'+i;pin.className='campus-pin';
    pin.textContent=(i+1)+'F';pin.dataset.normal='0 0 1';pin.dataset.position='0m '+(.76+i*1.32)+'m 2m';
    pin.setAttribute('aria-label',(i+1)+'층 평면도와 배포 화면 보기');
    viewer.append(pin);pins.push(pin);
    pin.addEventListener('click',()=>select(i));
  });
  let press;
  viewer.addEventListener('pointerdown',e=>{
    press=e.isPrimary && e.button===0 && !e.target.closest('button') ? [e.clientX,e.clientY] : null;
  });
  viewer.addEventListener('pointermove',e=>{
    if(press && Math.hypot(e.clientX-press[0],e.clientY-press[1])>5) press=null;
  });
  viewer.addEventListener('pointercancel',()=>{press=null;});
  viewer.addEventListener('pointerup',e=>{
    if (!press || !viewer.loaded) return;
    press=null;
    const hit=viewer.surfaceFromPoint(e.clientX,e.clientY);
    if(!hit)return;
    const i=floorMeshes.indexOf(Number(hit.split(' ')[0]));
    if(i>=0)select(i);
  });
  viewer.animationName=viewer.availableAnimations[0];
  stage.classList.add('model-ready');
  layers.hidden=false;
  separate(false);
  layers.addEventListener('click',()=>separate(!opened));
  function reset() {
    if(!viewer.loaded)return;
    separate(false);
    highlight(-1);
    for(const control of [...choices,...pins])control.setAttribute('aria-pressed','false');
  }
  return {select, reset};
}
