import { recipe } from '../ui/system';
import { brand } from '../ui/theme';

export const homeslateMark = recipe({
  name: 'homeslate-mark',
  slots: ['svg', 'bar', 'accent', 'frame'],
  styles: {
    base: {
      svg: { display: 'block', flexShrink: 0 },
      // Token refs resolve on the element, so the mark follows the nearest
      // `data-color-mode` (the always-dark marketing pages inside a light app).
      bar: { fill: brand.mark.var },
      accent: { fill: brand.markAccent.var },
      frame: { fill: brand.markFrame.var },
    },
  },
});
