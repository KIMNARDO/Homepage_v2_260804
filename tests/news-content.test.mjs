import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateNews, visibleNews, getNewsPage, renderNewsItems, renderNewsFilters } from '../news-renderer.mjs';

const actual = JSON.parse(readFileSync(new URL('../content/news.json', import.meta.url), 'utf8'));
const fixture = count => ({
  categories: [{ id: 'company', label: '기업 소식' }, { id: 'education', label: '교육 활동' }],
  items: Array.from({ length: count }, (_, index) => ({
    id: `story-${index}`, category: index % 2 ? 'education' : 'company', kind: 'announcement',
    title: `소식 ${index}`, source: '팹스넷', summary: '소식 요약', paragraphs: ['소식 내용'], date: null,
  })),
});

test('현재 소식 데이터가 게시에 필요한 내용을 갖춘다', () => {
  assert.equal(validateNews(actual), actual);
});

test('새 소식이 늘어나도 페이지당 최대 네 건을 보여주고 마지막 페이지를 보존한다', () => {
  const data = fixture(9);
  assert.deepEqual([0, 1, 2].map(page => getNewsPage(data, 'all', page).items.length), [4, 4, 1]);
  assert.equal(getNewsPage(data, 'all', 50).items[0].id, 'story-8');
  assert.equal(getNewsPage(data, 'all', -1).page, 0);
});

test('분류를 바꾸면 해당 소식만 반환하고 페이지 범위를 맞춘다', () => {
  const result = getNewsPage(fixture(9), 'education', 2);
  assert.equal(result.pages, 1);
  assert.equal(result.page, 0);
  assert.equal(result.total, 4);
  assert.ok(result.items.every(item => item.category === 'education'));
});

test('작성 중인 소식은 목록과 분류 개수에 포함되지 않는다', () => {
  const data = fixture(3);
  data.items[1].published = false;
  assert.equal(visibleNews(data).length, 2);
  assert.equal(getNewsPage(data).total, 2);
  assert.doesNotMatch(renderNewsFilters(data), /data-news-filter="education"/);
});

test('중복 ID, 분류 오류, 유효하지 않은 날짜와 주소를 거부한다', () => {
  const duplicate = fixture(2);
  duplicate.items[1].id = duplicate.items[0].id;
  assert.throws(() => validateNews(duplicate), /ID/);
  const category = fixture(1);
  category.items[0].category = 'unknown';
  assert.throws(() => validateNews(category), /분류/);
  const date = fixture(1);
  date.items[0].date = '2026-02-31';
  assert.throws(() => validateNews(date), /날짜/);
  const url = fixture(1);
  url.items[0].sourceUrl = 'javascript:alert(1)';
  assert.throws(() => validateNews(url), /주소/);
});

test('제목을 HTML로 해석하지 않고 문자로 표시한다', () => {
  const data = fixture(1);
  data.items[0].title = '<script>alert("news")</script>';
  const html = renderNewsItems(data.items, data);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
});

test('방송의 시작·종료 시간 누락과 역전된 구간을 거부한다', () => {
  const data = structuredClone(actual);
  const video = data.items.find(item => item.kind === 'video').video;
  video.end = undefined;
  assert.throws(() => validateNews(data), /방송/);
  video.end = video.start;
  assert.throws(() => validateNews(data), /방송/);
  video.end = 401;
  video.start = -1;
  assert.throws(() => validateNews(data), /방송/);
});

test('소식이 없는 분류도 빈 상태를 안전하게 표시한다', () => {
  const result = getNewsPage(fixture(0));
  assert.equal(result.pages, 1);
  assert.equal(result.total, 0);
  assert.match(renderNewsItems(result.items, fixture(0)), /등록된 소식이 없습니다/);
});
