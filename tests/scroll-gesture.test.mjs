import test from 'node:test';
import assert from 'node:assert/strict';
import { createWheelStepGate } from '../scroll-gesture.mjs';

test('a mouse notch advances once and a new gesture can advance again', () => {
  const step = createWheelStepGate();
  assert.equal(step({ deltaY: 120 }, 0), 1);
  assert.equal(step({ deltaY: 120 }, 250), 1);
});

test('one long momentum gesture cannot skip several scenes', () => {
  const step = createWheelStepGate();
  const results = Array.from({ length: 100 }, (_, i) => step({ deltaY: 12 }, i * 16));
  assert.equal(results.filter(Boolean).length, 1);
  assert.equal(step({ deltaY: 1000 }, 1900), 1);
});

test('tiny movements and a direction change do not cause an accidental transition', () => {
  const step = createWheelStepGate();
  assert.equal(step({ deltaY: 18 }, 0), 0);
  assert.equal(step({ deltaY: 30 }, 20), 0);
  assert.equal(step({ deltaY: -40 }, 40), 0);
  assert.equal(step({ deltaY: -40 }, 60), -1);
});

test('line and page units have the same intentional gesture behavior', () => {
  assert.equal(createWheelStepGate()({ deltaY: 5, deltaMode: 1 }, 0), 1);
  assert.equal(createWheelStepGate()({ deltaY: -1, deltaMode: 2 }, 0, 920), -1);
});

test('horizontal scroll and zoom do not change hero scenes', () => {
  const step = createWheelStepGate();
  assert.equal(step({ deltaX: 180, deltaY: 40 }, 0), 0);
  assert.equal(step({ deltaY: 120, ctrlKey: true }, 30), 0);
  assert.equal(step({ deltaY: 0 }, 60), 0);
});

test('separate small gestures do not accumulate into an unexpected transition', () => {
  const step = createWheelStepGate();
  assert.equal(step({ deltaY: 40 }, 0), 0);
  assert.equal(step({ deltaY: 40 }, 300), 0);
});
