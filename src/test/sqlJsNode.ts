/**
 * sql.js locates its WASM through a bundler URL in the browser build; under
 * node we point it at the installed binary. Import this module (via vi.mock
 * factory) BEFORE anything that loads sql.js.
 */
import { fileURLToPath } from 'node:url';
import type { SqlJsConfig, SqlJsStatic } from 'sql.js';

export const SQL_WASM_PATH = fileURLToPath(
  new URL('../../node_modules/sql.js/dist/sql-wasm.wasm', import.meta.url),
);

export async function sqlJsNodeMock(
  importOriginal: () => Promise<{ default: (cfg?: SqlJsConfig) => Promise<SqlJsStatic> }>,
) {
  const real = (await importOriginal()).default;
  return { default: (cfg: SqlJsConfig = {}) => real({ ...cfg, locateFile: () => SQL_WASM_PATH }) };
}
