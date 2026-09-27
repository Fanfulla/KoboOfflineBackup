import { describe, it, expect } from 'vitest';
import { parseKoboVersionFile, readDeviceVersion, modelNameForId } from './koboDevice.ts';
import { MemDirHandle, freshDevice } from '../test/memoryFs.ts';

describe('koboDevice — .kobo/version parsing', () => {
  it('extracts firmware and model, never the serial number', () => {
    const info = parseKoboVersionFile(
      'N418XXXXXXXXX,4.1.15,4.38.21908,4.1.15,4.1.15,00000000-0000-0000-0000-000000000390\n',
    );
    expect(info).toEqual({ firmwareVersion: '4.38.21908', modelId: '390', model: 'Kobo Libra Colour' });
    expect(JSON.stringify(info)).not.toContain('N418');
  });

  it('handles unknown model ids gracefully', () => {
    expect(modelNameForId('999')).toBe('Kobo (model 999)');
  });

  it('returns null for malformed content', () => {
    expect(parseKoboVersionFile('garbage')).toBeNull();
    expect(parseKoboVersionFile('')).toBeNull();
  });

  it('reads the version file from a device handle', async () => {
    const dev = await freshDevice();
    await dev.writeText(
      '.kobo/version',
      'SN,4.1.15,4.41.23145,4.1.15,4.1.15,00000000-0000-0000-0000-000000000388',
    );
    expect(await readDeviceVersion(dev.handle)).toMatchObject({
      model: 'Kobo Libra 2',
      firmwareVersion: '4.41.23145',
    });
  });

  it('returns null when the version file is missing', async () => {
    expect(await readDeviceVersion(new MemDirHandle().handle)).toBeNull();
  });
});
