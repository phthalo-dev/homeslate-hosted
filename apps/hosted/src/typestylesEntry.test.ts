import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const srcDir = path.dirname(fileURLToPath(import.meta.url));

function listStyleModules(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listStyleModules(full);
    return entry.name.endsWith('.styles.ts') ? [full] : [];
  });
}

describe('typestyles-entry', () => {
  it('imports every *.styles.ts module so production extraction includes it', () => {
    const entry = readFileSync(path.join(srcDir, 'typestyles-entry.ts'), 'utf8');
    const imported = new Set(
      [...entry.matchAll(/import '(\.[^']+)';/g)].map((m) => path.resolve(srcDir, `${m[1]}.ts`)),
    );
    const missing = listStyleModules(srcDir)
      .filter((file) => !imported.has(file))
      .map((file) => path.relative(srcDir, file));
    expect(missing).toEqual([]);
  });

  it('has no CSS modules left in the hosted app', () => {
    const walk = (dir: string): string[] =>
      readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return walk(full);
        return entry.name.endsWith('.css') ? [path.relative(srcDir, full)] : [];
      });
    expect(walk(srcDir)).toEqual([]);
  });
});
