// Hearth & Ledger — entrypoint for repository iosai2035/best-household-budget-site-20261126.
// Node 22, standard library only. It hands the site in: it copies app/ (the
// static site: index, styles, data, money, store, charts, views, guide, the
// CSV export module and the router) and screenshots/ (its renders) from beside
// this file into the output directory, then writes output/dossier.json with
// buildDossier from the vendored make.fun library — the summary the judge reads. The program runs
// twice and must write the same bytes both times, so it does nothing that
// depends on the clock or on chance. vendor/makefun-frontend.ts is the kit's
// copy, unchanged; the scorer rebuilds the dossier with its own copy and the
// two must match byte for byte.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

try {
  mkdirSync(out, { recursive: true });
  cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
  mkdirSync(join(out, 'screenshots'), { recursive: true });
  if (existsSync(join(here, 'screenshots'))) {
    cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
  }

  // The caps match the gate: at most 4 screenshots, each at most 256 KiB; app/
  // at most 993 files and directories and 16 MiB in all; the dossier text at
  // most 160 KiB.
  writeFileSync(
    join(out, 'dossier.json'),
    buildDossier(out, {
      text_max_bytes: 163840,
      screenshots: { max: 4, max_bytes: 262144 },
      app_max_files: 993,
      app_max_bytes: 16777216,
    }),
  );
} catch (error) {
  console.error(`Hearth & Ledger: could not build the entry in ${out}: ${error.message}`);
  process.exit(1);
}
