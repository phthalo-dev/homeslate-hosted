import { createElement, type ComponentType } from 'react';
import {
  IconAlarm,
  IconCalendar,
  IconCalendarWeek,
  IconChartLine,
  IconChecklist,
  IconClock,
  IconCloud,
  IconHourglass,
  IconLayoutGrid,
  IconNews,
  IconPhoto,
  IconTrophy,
} from '@tabler/icons-react';
import type { DashboardLayout } from '../types/widget';
import { cx } from '../ui/system';
import { layoutThumbnail as s } from './LayoutThumbnail.styles';

type Glyph = ComponentType<{ size?: number; stroke?: number }>;

/** One glyph per widget type in `@homeslate/widgets`. */
const GLYPHS: Record<string, Glyph> = {
  clock: IconClock,
  weather: IconCloud,
  calendar: IconCalendar,
  'google-calendar': IconCalendar,
  'google-calendar-day': IconCalendar,
  'google-calendar-month': IconCalendar,
  'week-calendar': IconCalendarWeek,
  todo: IconChecklist,
  news: IconNews,
  photo: IconPhoto,
  'google-photo-collage': IconPhoto,
  stocks: IconChartLine,
  sports: IconTrophy,
  alarms: IconAlarm,
  timers: IconHourglass,
};

/** Rows a 16:10 wall tablet shows at the editor's 80px row height (12 columns). */
const MIN_ROWS = 8;

interface Props {
  layout: Pick<DashboardLayout, 'widgets' | 'columns' | 'hidden'>;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * A miniature of a view, drawn from its widget grid (`x/y/w/h` on the view's columns) with a
 * glyph per widget type. Decorative: the view's name and widget count sit next to it.
 */
export function LayoutThumbnail({ layout, size = 'md', className }: Props) {
  const columns = layout.columns || 12;
  const rows = Math.max(MIN_ROWS, ...layout.widgets.map((w) => w.layout.y + w.layout.h));
  const glyphSize = size === 'sm' ? 10 : 14;

  return (
    <div
      className={cx(s.frame, className)}
      data-size={size}
      data-hidden={layout.hidden || undefined}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}
      aria-hidden
    >
      {layout.widgets.length === 0 ? <span className={s.empty}>Empty</span> : null}
      {layout.widgets.map((widget) => {
        const { x, y, w, h } = widget.layout;
        const glyph = GLYPHS[widget.type] ?? IconLayoutGrid;
        return (
          <span
            key={widget.id}
            className={s.tile}
            style={{ gridColumn: `${x + 1} / span ${w}`, gridRow: `${y + 1} / span ${h}` }}
          >
            {w >= 2 && h >= 2 ? createElement(glyph, { size: glyphSize, stroke: 1.75 }) : null}
          </span>
        );
      })}
    </div>
  );
}
