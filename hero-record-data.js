// Public illustrative records for the three hero models. Document IDs, recipients
// and distribution states belong to the demo, not to the product screenshots.
export const records = {
  ev: [
    {key:'Battery enclosure', photoPoint:[53.8, 47.39], name:'상부 덮개', parent:'배터리 팩', count:1, document:'EV-101'},
    {key:'Cell 1 1', photoPoint:[45.47, 66.26], name:'셀 모듈', parent:'배터리 팩', count:12, document:'EV-102'},
    {key:'Motor -1', photoPoint:[29.36, 73.07], name:'구동 모터', parent:'구동계', count:2, document:'EV-103'},
    {key:'Wheel 1 -1', photoPoint:[34.07, 87.28], name:'휠 조립품', parent:'차륜', count:4, document:'EV-104'}
  ],
  aircraft: [
    {key:'Frames', photoPoint:[55.77, 51.26], name:'동체 프레임', parent:'동체 구조', count:8, document:'AC-201', review:'프레임 배치'},
    {key:'Avionics', photoPoint:[42.1, 59.7], name:'전자장비 트레이', parent:'항공전자 장비실', count:4, document:'AC-202', review:'트레이 장착 위치'},
    {key:'Fan 1', photoPoint:[42.61, 67.06], name:'팬 조립품', parent:'우측 엔진', count:1, document:'AC-203', review:'엔진 조립 관계'},
    {key:'Wing 1', photoPoint:[68.82, 64.54], name:'우측 주익', parent:'주익 조립체', count:1, document:'AC-204', review:'주익 결합 위치'}
  ],
  building: [
    {name:'1층 로비', document:'A-101', recipient:'로비 시공팀', status:'수신 완료'},
    {name:'2층 업무 공간', document:'A-102', recipient:'실내 시공팀', status:'수신 대기'},
    {name:'3층 테라스 스튜디오', document:'A-103', recipient:'테라스 시공팀', status:'재배포'}
  ]
};

export function documentId(kind, item, key) {
  if (kind !== 'ev') return item.document;
  const [type, side, row] = key.split(' ');
  const hand = side === '1' ? 'R' : 'L';
  if (type === 'Cell') return item.document + '-' + hand + (Number(row)+1);
  if (type === 'Motor') return item.document + (side === '-1' ? '-F' : '-R');
  if (type === 'Wheel') return item.document + '-' + (row === '-1' ? 'F' : 'R') + hand;
  return item.document;
}

function partLocation(key) {
  const [type, side, row] = key.split(' ');
  if (type === 'Cell') return (side === '1' ? '우측 ' : '좌측 ') + (Number(row) + 1) + '열';
  if (type === 'Motor') return side === '-1' ? '전방' : '후방';
  if (type === 'Wheel') return (row === '-1' ? '전방 ' : '후방 ') + (side === '1' ? '우측' : '좌측');
  return '';
}

export function recordSelection(kind, index, key = records[kind][index].key) {
  const {name, parent, count} = records[kind][index];
  const building = kind === 'building';
  const path = building ? '캠퍼스 › '+(index+1)+'층 › 건축 평면도' :
    [kind === 'ev' ? '전기차' : '항공기', parent, name].join(' › ') + ' · '+count+'개';
  const location = kind === 'ev' ? partLocation(key) : '';
  const file = building ? 'floor-'+(index+1)+'.svg' : kind+'-'+key.replaceAll(' ','_')+'.png';
  return {kind, index, key, name, path:location ? path+' · '+location : path, drawing:'/models/linked-drawings/'+file};
}
