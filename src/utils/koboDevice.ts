/**
 * Device identification from `.kobo/version`.
 *
 * The file is a single comma-separated line:
 *   <serial>,<kernel>,<firmware>,<kernel>,<kernel>,00000000-0000-0000-0000-000000000<model id>
 * The serial number is personal data: it is parsed out and never kept.
 */
import type { KoboSource } from './deviceSource.ts';

/**
 * Model ids as shipped in Nickel (extracted from libnickel by pgaskin/koboutils
 * kobo-nickeldev). Unknown ids fall back to "Kobo (model N)".
 */
const KOBO_MODELS: Record<string, string> = {
  '310': 'Kobo Touch',
  '320': 'Kobo Touch',
  '330': 'Kobo Glo',
  '340': 'Kobo Mini',
  '350': 'Kobo Aura HD',
  '360': 'Kobo Aura',
  '370': 'Kobo Aura H2O',
  '371': 'Kobo Glo HD',
  '372': 'Kobo Touch 2.0',
  '373': 'Kobo Aura ONE',
  '374': 'Kobo Aura H2O Edition 2',
  '375': 'Kobo Aura Edition 2',
  '376': 'Kobo Clara HD',
  '377': 'Kobo Forma',
  '378': 'Kobo Aura H2O Edition 2',
  '379': 'Kobo Aura Edition 2',
  '380': 'Kobo Forma',
  '381': 'Kobo Aura ONE',
  '382': 'Kobo Nia',
  '383': 'Kobo Sage',
  '384': 'Kobo Libra H2O',
  '386': 'Kobo Clara 2E',
  '387': 'Kobo Elipsa',
  '388': 'Kobo Libra 2',
  '389': 'Kobo Elipsa 2E',
  '390': 'Kobo Libra Colour',
  '391': 'Kobo Clara BW',
  '393': 'Kobo Clara Colour',
};

export interface KoboVersionInfo {
  firmwareVersion: string;
  modelId: string;
  model: string;
}

export function modelNameForId(modelId: string): string {
  return KOBO_MODELS[modelId] ?? `Kobo (model ${modelId})`;
}

export function parseKoboVersionFile(text: string): KoboVersionInfo | null {
  const fields = text.trim().split(',');
  if (fields.length < 6) return null;

  const firmwareVersion = fields[2]!.trim();
  const modelId = fields[fields.length - 1]!.trim().match(/(\d{3})$/)?.[1];
  if (!modelId || !/^\d+(\.\d+)+$/.test(firmwareVersion)) return null;

  return { firmwareVersion, modelId, model: modelNameForId(modelId) };
}

export async function readDeviceVersion(source: KoboSource): Promise<KoboVersionInfo | null> {
  const file = await source.getFile('.kobo/version');
  return file ? parseKoboVersionFile(await file.text()) : null;
}
