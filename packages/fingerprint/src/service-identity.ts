import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { options, type Options } from './config';
export const VERSION = '0.2.0';
export function serviceIdentity(input: Options = {}) {
  const opt = options(input);
  return {
    app: 'magpie-fingerprint',
    protocol: 1,
    version: VERSION,
    configuration: createHash('sha256')
      .update(
        JSON.stringify({
          gateway: opt.gateway,
          apiKey: opt.apiKey,
          dataDir: resolve(opt.dataDir),
          bankSource: opt.bankSource || null,
          demo: opt.demo,
          uiDir: opt.uiDir ? resolve(opt.uiDir) : null,
        }),
      )
      .digest('hex'),
  };
}
