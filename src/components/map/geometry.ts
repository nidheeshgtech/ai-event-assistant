import type { EventDataset, Hall } from '@/types/event';

/** Floorplan coordinate space (SVG viewBox units). Schematic only — not to scale. */
export const MAP_W = 1200;
export const MAP_H = 800;

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const SLOTS: Rect[] = [
  { x: 30, y: 30, w: 555, h: 320 },
  { x: 615, y: 30, w: 555, h: 320 },
  { x: 30, y: 450, w: 555, h: 320 },
  { x: 615, y: 450, w: 555, h: 320 },
];

export const CONCOURSE: Rect = { x: 30, y: 362, w: 1140, h: 76 };

const HEADER = 44;
const STAGE_W = 118;
const COLS = 5;

export function hallRect(h: Hall): Rect {
  return SLOTS[h.slot] ?? SLOTS[0];
}

export function stageRect(h: Hall): Rect {
  const r = hallRect(h);
  return { x: r.x + r.w - STAGE_W - 14, y: r.y + HEADER + 8, w: STAGE_W, h: 92 };
}

export interface StandShape extends Rect {
  code: string;
  hallId: string;
}

/** Stand slots laid out 5 per row, left to right, top to bottom, numbered 01..standCount. */
export function standShapes(data: EventDataset, h: Hall): StandShape[] {
  const r = hallRect(h);
  const hasStage = data.stages.some((s) => s.hallId === h.id);
  const left = r.x + 16;
  const right = r.x + r.w - 16 - (hasStage ? STAGE_W + 12 : 0);
  const top = r.y + HEADER + 8;
  const bottom = r.y + r.h - 16;
  const rows = Math.max(1, Math.ceil(h.standCount / COLS));
  const gap = 8;
  const w = (right - left - gap * (COLS - 1)) / COLS;
  const hh = Math.min(58, (bottom - top - gap * (rows - 1)) / rows);
  return Array.from({ length: h.standCount }, (_, i) => ({
    code: `H${h.number}-${String(i + 1).padStart(2, '0')}`,
    hallId: h.id,
    x: left + (i % COLS) * (w + gap),
    y: top + Math.floor(i / COLS) * (hh + gap),
    w,
    h: hh,
  }));
}

/** Facility marker position from its zone and 0..1 coordinates. */
export function facilityPoint(data: EventDataset, zone: string, x: number, y: number): { cx: number; cy: number } {
  const hall = data.halls.find((h) => h.id === zone);
  const r = hall ? hallRect(hall) : CONCOURSE;
  const pad = 14;
  return { cx: r.x + pad + x * (r.w - pad * 2), cy: r.y + pad + y * (r.h - pad * 2) };
}
