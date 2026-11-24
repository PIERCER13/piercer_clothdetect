# piercer_clothdetect

[Português (BR)](README.pt-BR.md)

Finds duplicate clothing models and textures in your `stream` folder by comparing `.ydd` and `.ytd` files via MD5
hash, showing how much streaming memory each group wastes. It has an **in-game NUI** (`/clothdetect`) and a
**web panel** (`tools/start_web.bat`) that works even with the server offline. Both are available in **English
and Portuguese (BR)**.

## Installation

```cfg
ensure framezero_bridge
ensure piercer_clothdetect
```

In-game permission: groups in `config.lua` (via `framezero_bridge`), ACE (`add_ace group.admin piercer.admin allow`),
or fixed `identifiers`. Requires **Node.js** installed on the server machine to run scans and quarantine actions.

## Language

- Anyone can switch between `PT` and `EN` at the top of the NUI or web panel; the choice is saved in that browser.
- All UI strings live in the `I18N` object inside `web/app.js`, shared by the NUI and the web panel.

## What it detects

| Type | Criteria | Notes |
|---|---|---|
| **100% Clone (same gender)** | Same `.ydd` (MD5) and identical `.ytd` files (count, size and MD5) | Critical case: wastes clothing slots and streaming memory (e.g. the exact same piece in `addon` and `addon2`). |
| **100% Clone (unisex M/F)** | Same `.ydd` and identical `.ytd` files across `mp_m_` and `mp_f_` folders | Exact copy duplicated between male and female folders. |
| **Retexture (same gender)** | Same `.ydd` (MD5), but different `.ytd` files | Same 3D mesh reused with different prints or texture variations. |
| **Props / unisex (M/F)** | Same `.ydd` across `mp_m_` and `mp_f_` with different textures | Common for shared bags, hats, glasses and accessories. |

## How it works

- The scanner groups every `.ydd` by byte size first and only computes MD5 hashes when sizes match, keeping scans fast even on large clothing packs.
- Within each group, the first folder found is kept as the **retained original** and the rest are marked as **redundant copies** when calculating wasted space (sorted from largest MB waste to smallest).
- Filter by duplicate type, component category (`JBIB`, `LOWR`, `FEET`, `P_HEAD`...) and `addon` pack, search by folder name, and inspect individual `.ydd`/`.ytd` files.
- **Quarantine**: moves (does not delete) the duplicate folder into `[framezero-cloth]/_backup_duplicatas/<addon>_<category>/<folder>`, logs the move in `data/quarantine_log.json`, and removes the entry from the active list. If the server is running, run `refresh` and restart your clothing resource afterwards (and re-sequence / rebuild `.meta` files if you remove items from the middle of an addon).
- Every scan writes `data/duplicates.json`, `web/data.json` (read by the NUI) and `data/duplicates.csv` (also downloadable via **Export CSV**).

## Scanner and web panel

- **Scanning**: click **Scan Now** (NUI or web), run `clothdetect_scan` (or `clothdup_scan`) in the server console, or run `tools/scan.bat` outside the game. To scan a custom path manually: `node tools/scanner.js --stream "C:\path\to\stream"`.
- **Web panel**: `tools/start_web.bat` opens `http://localhost:3456/`. It reads `data/duplicates.json` straight from disk and runs scans and quarantine moves through Node (`tools/web_server.js`), so it works with FiveM closed.

## Settings

- `config.lua`: in-game commands (`/clothdetect`, `/clothdup`, `/roupasrepetidas`) and permissions (`bridge`, `ace`, `identifiers`).
- `tools/scanner.js`, `tools/quarantine.js` and `tools/web_server.js`: default `stream` path (`[framezero-cloth]/style-cloth-addon/stream`), backup directory (`_backup_duplicatas`) and standalone web port (`3456`).
