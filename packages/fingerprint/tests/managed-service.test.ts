import { expect, test } from 'bun:test';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { startManagedService } from '../src/managed-service';

const waitFor = async (check: () => boolean) => {
  for (let i = 0; i < 100; i++) {
    if (check()) return;
    await Bun.sleep(20);
  }
  throw new Error('Timed out waiting for host takeover');
};

test('two hosts share one compatible service and the survivor takes over', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'fingerprint-hosts-'));
  const opts = { demo: true, dataDir: dir, uiDir: join(dir, 'ui') };
  await mkdir(opts.uiDir);
  await writeFile(join(opts.uiDir, 'index.html'), '<head></head>');
  const a = await startManagedService({ ...opts, port: 0 }, 20);
  let b: Awaited<ReturnType<typeof startManagedService>> | undefined;
  let c: Awaited<ReturnType<typeof startManagedService>> | undefined;
  try {
    const port = a.port;
    b = await startManagedService({ ...opts, port }, 20);
    expect(a.role).toBe('owner');
    expect(b.role).toBe('attached');
    await a.close();
    await waitFor(() => b!.role === 'owner');
    expect(b.port).toBe(port);
    c = await startManagedService({ ...opts, port }, 20);
    expect(c.role).toBe('attached');
    await c.close();
    expect((await fetch(`http://127.0.0.1:${port}/_fingerprint/health`)).ok).toBe(true);
    await expect(
      startManagedService({ ...opts, dataDir: join(dir, 'different'), port }),
    ).rejects.toThrow('incompatible');
  } finally {
    await a.close();
    await b?.close();
    await c?.close();
    await rm(dir, { recursive: true, force: true });
  }
});

test('simultaneous hosts elect one owner without touching another application', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'fingerprint-election-'));
  const reservation = Bun.serve({
    hostname: '127.0.0.1',
    port: 0,
    fetch: () => new Response('not fingerprint'),
  });
  const port = reservation.port!;
  try {
    await expect(startManagedService({ port, dataDir: dir, demo: true })).rejects.toThrow(
      'incompatible',
    );
    expect(await (await fetch(`http://127.0.0.1:${port}`)).text()).toBe('not fingerprint');
  } finally {
    reservation.stop(true);
  }
  const hosts: Awaited<ReturnType<typeof startManagedService>>[] = [];
  try {
    const results = await Promise.allSettled(
      Array.from({ length: 3 }, () => startManagedService({ port, dataDir: dir, demo: true }, 20)),
    );
    for (const result of results) if (result.status === 'fulfilled') hosts.push(result.value);
    expect(results.every((result) => result.status === 'fulfilled')).toBe(true);
    expect(hosts.filter((host) => host.role === 'owner')).toHaveLength(1);
  } finally {
    await Promise.all(hosts.map((host) => host.close()));
    await rm(dir, { recursive: true, force: true });
  }
});
