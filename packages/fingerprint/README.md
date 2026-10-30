# Magpie Fingerprint

[简体中文](README.zh-CN.md) · [Magpie](https://github.com/yetone/magpie) · [lm-detector](https://github.com/Ikaleio/lm-detector)

Investigate suspected model substitution directly in Magpie. Compare numeric
response fingerprints across providers or repeat a run after a service changes.
The page reuses Magpie’s configured models and gateway; the pinned
`lmfpd-sdk` detector ranks nearby reference-bank models. Rankings are evidence
for investigation, not proof of model identity.

![Fingerprint workspace (explicit demo data)](docs/preview.png)

- Select up to 24 models across providers, with the same three challenges per batch.
- Reuse Magpie authentication and native endpoint metadata; optionally pin an account.
- Follow live sample counts, cancel work, and inspect the actual response route.
- Compare ranked candidates, including partial and unscorable outcomes.
- Keep raw replies and data versions in local history; export or copy JSON.
- Magpie's native page bridge, controls and design tokens; follows the host's theme and language.
- Compact model lists, keyboard-accessible view tabs, and narrow-screen layouts.

## Install

Install **Fingerprint** from **Plugins → Discover**, or use the CLI. Requires
a current Magpie release with `page.service` support and Bun 1.4.2+:

```sh
magpie plugin add @magpie-community/page-fingerprint
```

Open **Fingerprint** in the sidebar, or choose **Fingerprint** from a provider's menu.
Starting a detection sends three requests per selected model and uses that provider's quota.

## Development

Run these commands from `packages/fingerprint/`. Source, tests and the built
`dist/` assets are checked in. Installation and the offline tests do not need
package downloads: `vendor/lmfpd-sdk` pins the MIT SDK at 0.2.0. Only rebuilding
the UI and running the type checker require the development dependencies.
Build-tool versions are pinned in `package.json`. There are no install/pack
lifecycle scripts; after a source change, run the
build and commit the resulting `dist/` files.

The standalone project and release history are at
[KaranocaVe/magpie-fingerprint](https://github.com/KaranocaVe/magpie-fingerprint).

```sh
bun install
bun run check
bun start
```

The plugin page service listens on `3488` by default and uses Magpie's gateway
at `http://127.0.0.1:3425`. The first bootstrap downloads and caches the
lm-detector reference bank; Refresh rechecks it. Reference data requests carry
no provider credentials or model replies. Only an explicitly started job sends
sampling prompts through the configured gateway. See [integration.md](integration.md) for gateway
authentication, `magpie web`, environment variables, and the explicit `--demo`
fixture.

## Scope and limits

The first release supports numeric fingerprinting. A run uses a pinned
reference version, three shared challenges per batch, bounded work, and
cancellation. It records proposed, observed, and failed evidence separately;
it does not prove provider identity, authenticate a model, or infer hidden
tokenizers. `--demo` runs an isolated illustrative workflow without model calls.

Magpie middleware and protocol adapters still apply. A changed actual provider/model
invalidates that target's aggregate score. Account pinning is optional; it does not
turn a routed channel into an upstream identity guarantee. Tokenizer probing is deferred.

MIT licensed. Third-party notices are in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
