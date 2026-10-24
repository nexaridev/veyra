# Third party sources

Veyra is licensed under GPLv3. Each dependency retains its original notices and applicable terms.

## uBlock Origin 1.75.0

The unmodified Chromium package and Mozilla signed Firefox XPI are retained in this directory. Their checksums are recorded in the lock metadata at `ublock-lock.json`. The complete upstream source archive is included as `uBlock-1.75.0-source.tar.gz`.

[Upstream tag](https://github.com/gorhill/uBlock/tree/1.75.0)

[Upstream release](https://github.com/gorhill/uBlock/releases/tag/1.75.0)

The unpacked Chromium directory has these Veyra adaptations: background.html loads veyra-network-adapter.js; js/vapi.js preserves the extended chrome namespace supplied by the Electron API layer; manifest.json includes a stable public extension identity key; LICENSE.txt contains the GPLv3 text. The network adapter forwards WebRequest events through Electron while leaving the upstream rule engine and filtering decisions intact. The original archive is available for comparison.

The public suffix implementation in src/public-suffix.cjs is derived from the same upstream library with its ES module export replaced by a CommonJS export. Its original copyright and licensing notice is retained. The bundled Public Suffix List retains its own source header.

The Android XPI is unmodified. GeckoView verifies the Mozilla signature during installation. Private tab access requires a separate user choice in the installation prompt.

## Electron extension API layer

electron-chrome-extensions 4.9.0 is used under its GPLv3 option. The exact npm package and dependency integrity values are pinned in package-lock.json. Its distributed license notices remain in node_modules when packaged.

[API layer source](https://github.com/samuelmaddock/electron-browser-shell)

## Other dependencies

Electron and Chromium notices are shipped with the Windows runtime. GeckoView dependencies and Android metadata are pinned in the Android build configuration. The Windows installer includes Bouncy Castle notices. Consult those distributions for their respective licenses.
