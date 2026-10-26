import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent as RPointerEvent } from 'react';
import gsap from 'gsap';
import { loc } from '@/engine/text';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';
import { useLang } from '@/i18n/LangProvider';
import type { EventDataset } from '@/types/event';
import { FACILITY_ICON } from '../assistant/Cards';
import { Icon } from '../ui/Icon';
import { CONCOURSE, MAP_H, MAP_W, facilityPoint, hallRect, stageRect, standShapes, type Rect } from './geometry';

interface View {
  x: number;
  y: number;
  k: number;
}

interface Props {
  data: EventDataset;
  selectedStand?: string;
  selectedHall?: string;
  selectedFacilities?: string[];
  /** Stands matching the current search (outlined). */
  matches?: Set<string>;
  onSelectStand: (code: string) => void;
  onSelectHall: (id: string) => void;
  onSelectFacility: (id: string) => void;
}

const MIN_K = 1;
const MAX_K = 5;
const clampK = (k: number) => Math.min(MAX_K, Math.max(MIN_K, k));

/** Keep the plan inside the viewport at the given zoom. */
function clampView(v: View): View {
  const k = clampK(v.k);
  const minX = MAP_W - MAP_W * k;
  const minY = MAP_H - MAP_H * k;
  return { k, x: Math.min(0, Math.max(minX, v.x)), y: Math.min(0, Math.max(minY, v.y)) };
}

const short = (name: string, max: number) => (name.length > max ? `${name.slice(0, max - 1)}…` : name);

export function FloorPlan({ data, selectedStand, selectedHall, selectedFacilities = [], matches, onSelectStand, onSelectHall, onSelectFacility }: Props) {
  const { lang, t } = useLang();
  const svgRef = useRef<SVGSVGElement>(null);
  const [view, setView] = useState<View>({ x: 0, y: 0, k: 1 });
  const viewRef = useRef(view);
  viewRef.current = view;
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ moved: number; startDist?: number; startK?: number } | null>(null);

  const stands = useMemo(() => data.halls.flatMap((h) => standShapes(data, h)), [data]);
  const byStand = useMemo(() => new Map(data.exhibitors.map((e) => [e.stand.toUpperCase(), e])), [data]);

  /** Client pixel → map units. */
  const toMap = useCallback((clientX: number, clientY: number) => {
    const r = svgRef.current!.getBoundingClientRect();
    return { x: ((clientX - r.left) / r.width) * MAP_W, y: ((clientY - r.top) / r.height) * MAP_H };
  }, []);

  const zoomAt = useCallback((factor: number, px = MAP_W / 2, py = MAP_H / 2) => {
    const v = viewRef.current;
    const k = clampK(v.k * factor);
    const f = k / v.k;
    setView(clampView({ k, x: px - (px - v.x) * f, y: py - (py - v.y) * f }));
  }, []);

  /** Smoothly centre a rectangle at a comfortable zoom. */
  const focusRect = useCallback((r: Rect, k: number) => {
    const target = clampView({ k, x: MAP_W / 2 - (r.x + r.w / 2) * k, y: MAP_H / 2 - (r.y + r.h / 2) * k });
    if (prefersReducedMotion()) return setView(target);
    const from = { ...viewRef.current };
    gsap.to(from, { ...target, duration: 0.7, ease: 'power3.inOut', onUpdate: () => setView({ ...from }) });
  }, []);

  // Fly to whatever is selected (from the URL, the search box or the assistant).
  useEffect(() => {
    if (selectedStand) {
      const s = stands.find((x) => x.code === selectedStand);
      if (s) return focusRect(s, 2.6);
    }
    if (selectedHall) {
      const h = data.halls.find((x) => x.id === selectedHall);
      if (h) return focusRect(hallRect(h), 1.7);
    }
    if (selectedFacilities.length === 1) {
      const f = data.facilities.find((x) => x.id === selectedFacilities[0]);
      if (f) {
        const p = facilityPoint(data, f.zone, f.x, f.y);
        return focusRect({ x: p.cx - 40, y: p.cy - 40, w: 80, h: 80 }, 2.4);
      }
    }
    if (!selectedStand && !selectedHall && !selectedFacilities.length) focusRect({ x: 0, y: 0, w: MAP_W, h: MAP_H }, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStand, selectedHall, selectedFacilities.join(','), data]);

  // Wheel zoom needs a non-passive listener to stop the page scrolling.
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && Math.abs(e.deltaY) < 1) return;
      e.preventDefault();
      const p = toMap(e.clientX, e.clientY);
      zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, p.x, p.y);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [toMap, zoomAt]);

  const onPointerDown = (e: RPointerEvent<SVGSVGElement>) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) gesture.current = { moved: 0 };
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      gesture.current = { moved: 99, startDist: Math.hypot(a.x - b.x, a.y - b.y), startK: viewRef.current.k };
    }
  };

  const onPointerMove = (e: RPointerEvent<SVGSVGElement>) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev || !gesture.current) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const r = svgRef.current!.getBoundingClientRect();
    if (pointers.current.size === 2 && gesture.current.startDist) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const mid = toMap((a.x + b.x) / 2, (a.y + b.y) / 2);
      const k = clampK(gesture.current.startK! * (dist / gesture.current.startDist));
      zoomAt(k / viewRef.current.k, mid.x, mid.y);
      return;
    }
    const dx = ((e.clientX - prev.x) / r.width) * MAP_W;
    const dy = ((e.clientY - prev.y) / r.height) * MAP_H;
    gesture.current.moved += Math.abs(dx) + Math.abs(dy);
    // Only capture once it is really a drag, so taps still reach the stands.
    if (gesture.current.moved > 6 && !svgRef.current!.hasPointerCapture(e.pointerId)) svgRef.current!.setPointerCapture(e.pointerId);
    if (gesture.current.moved > 6) setView((v) => clampView({ ...v, x: v.x + dx, y: v.y + dy }));
  };

  const onPointerUp = (e: RPointerEvent<SVGSVGElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 0) setTimeout(() => (gesture.current = null), 0);
  };

  /** Ignore the click that ends a drag. */
  const tap = (fn: () => void) => () => {
    if (gesture.current && gesture.current.moved > 6) return;
    fn();
  };
  const key = (fn: () => void) => (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fn();
    }
  };

  const zoomed = view.k > 1.6;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-midnight-900/70" dir="ltr">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        className="floorplan block aspect-[3/2] w-full select-none"
        role="group"
        aria-label={t('map.title')}
        aria-describedby="map-instructions"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <defs>
          <pattern id="fp-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M24 0H0V24" fill="none" stroke="rgba(255,255,255,0.035)" />
          </pattern>
        </defs>
        <rect width={MAP_W} height={MAP_H} fill="url(#fp-grid)" />
        <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
          {/* Concourse */}
          <rect {...rectProps(CONCOURSE)} rx={18} fill="rgba(255,255,255,0.035)" stroke="rgba(255,255,255,0.12)" strokeDasharray="6 6" />
          <text x={CONCOURSE.x + 14} y={CONCOURSE.y - 3} className="fill-slate-500 font-display text-[10px] font-semibold uppercase tracking-[0.25em]" lang={lang}>
            {t('map.concourse')}
          </text>

          {data.halls.map((h) => {
            const r = hallRect(h);
            const active = selectedHall === h.id;
            const stage = data.stages.find((s) => s.hallId === h.id);
            return (
              <g key={h.id}>
                <rect {...rectProps(r)} rx={22} fill={active ? 'rgb(var(--brand-primary) / 0.10)' : 'rgba(255,255,255,0.03)'} stroke={active ? 'rgb(var(--brand-primary))' : 'rgba(255,255,255,0.14)'} strokeWidth={active ? 2.5 : 1.2} />
                <g role="button" tabIndex={0} aria-label={`${loc(h.name, lang)} — ${loc(h.theme, lang)}`} onClick={tap(() => onSelectHall(h.id))} onKeyDown={key(() => onSelectHall(h.id))} className="cursor-pointer">
                  <rect x={r.x + 10} y={r.y + 8} width={r.w - 20} height={30} rx={10} fill="transparent" />
                  <text x={r.x + 20} y={r.y + 29} className="fill-white font-display text-[17px] font-bold" lang={lang}>
                    {loc(h.name, lang)}
                    <tspan dx={10} className="fill-slate-400 text-[12px] font-medium">
                      {loc(h.theme, lang)}
                    </tspan>
                  </text>
                </g>
                {stage && (
                  <g>
                    <rect {...rectProps(stageRect(h))} rx={14} fill="rgb(var(--brand-accent) / 0.12)" stroke="rgb(var(--brand-accent) / 0.45)" />
                    <Icon name="megaphone" x={stageRect(h).x + stageRect(h).w / 2 - 10} y={stageRect(h).y + 18} size={20} className="text-brand-accent" />
                    <text x={stageRect(h).x + stageRect(h).w / 2} y={stageRect(h).y + 62} textAnchor="middle" className="fill-slate-200 text-[11px] font-semibold" lang={lang}>
                      {short(loc(stage.name, lang), 18)}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {stands.map((s) => {
            const ex = byStand.get(s.code);
            const selected = selectedStand === s.code;
            const match = matches?.has(s.code);
            const label = ex ? `${s.code}, ${ex.name}` : `${s.code}, ${t('map.empty')}`;
            return (
              <g
                key={s.code}
                className="stand cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label={label}
                aria-pressed={selected}
                onClick={tap(() => onSelectStand(s.code))}
                onKeyDown={key(() => onSelectStand(s.code))}
              >
                <title>{label}</title>
                {selected && <rect x={s.x - 5} y={s.y - 5} width={s.w + 10} height={s.h + 10} rx={12} fill="none" stroke="rgb(var(--brand-primary))" strokeWidth={2} className="animate-pulse" />}
                <rect
                  {...rectProps(s)}
                  rx={8}
                  fill={selected ? 'rgb(var(--brand-primary))' : ex ? 'rgb(var(--brand-accent) / 0.16)' : 'rgba(255,255,255,0.035)'}
                  stroke={match ? 'rgb(var(--brand-primary))' : ex ? 'rgb(var(--brand-accent) / 0.4)' : 'rgba(255,255,255,0.1)'}
                  strokeWidth={match ? 2.5 : 1}
                  strokeDasharray={ex ? undefined : '4 4'}
                />
                <text x={s.x + 7} y={s.y + 16} className={`font-mono text-[11px] font-bold ${selected ? 'fill-midnight-950' : ex ? 'fill-white' : 'fill-slate-500'}`}>
                  {s.code.split('-')[1]}
                </text>
                {ex && (
                  <text x={s.x + 7} y={s.y + s.h - 9} className={`text-[9.5px] font-medium ${selected ? 'fill-midnight-950' : 'fill-slate-300'}`}>
                    {short(ex.name, zoomed ? 14 : 11)}
                  </text>
                )}
              </g>
            );
          })}

          {data.facilities.map((f) => {
            const p = facilityPoint(data, f.zone, f.x, f.y);
            const on = selectedFacilities.includes(f.id);
            return (
              <g key={f.id} role="button" tabIndex={0} aria-label={`${loc(f.name, lang)}: ${loc(f.location, lang)}`} onClick={tap(() => onSelectFacility(f.id))} onKeyDown={key(() => onSelectFacility(f.id))} className="cursor-pointer">
                <title>{loc(f.name, lang)}</title>
                {on && <circle cx={p.cx} cy={p.cy} r={22} fill="rgb(var(--brand-primary) / 0.25)" className="animate-pulse" />}
                <circle cx={p.cx} cy={p.cy} r={14} fill={on ? 'rgb(var(--brand-primary))' : '#27272a'} stroke={on ? 'white' : 'rgba(255,255,255,0.35)'} strokeWidth={1.5} />
                <Icon name={FACILITY_ICON[f.type]} x={p.cx - 8} y={p.cy - 8} size={16} strokeWidth={2} className={on ? 'text-midnight-950' : 'text-slate-100'} />
              </g>
            );
          })}
        </g>
      </svg>

      <div className="absolute end-3 top-3 flex flex-col gap-1.5">
        {[
          { label: t('map.zoomIn'), icon: 'plus' as const, fn: () => zoomAt(1.4) },
          { label: t('map.zoomOut'), icon: 'minus' as const, fn: () => zoomAt(1 / 1.4) },
          { label: t('map.reset'), icon: 'restart' as const, fn: () => focusRect({ x: 0, y: 0, w: MAP_W, h: MAP_H }, 1) },
        ].map((b) => (
          <button key={b.icon} type="button" onClick={b.fn} aria-label={b.label} title={b.label} className="glass-strong grid h-10 w-10 place-items-center rounded-xl text-white hover:bg-white/10">
            <Icon name={b.icon} size={18} />
          </button>
        ))}
      </div>
      <p id="map-instructions" className="sr-only">
        {t('map.instructions')}
      </p>
    </div>
  );
}

function rectProps(r: Rect) {
  return { x: r.x, y: r.y, width: r.w, height: r.h };
}
