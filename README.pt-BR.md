# piercer_clothdetect

[English](README.md)

Encontra roupas e texturas repetidas na pasta `stream` comparando os arquivos `.ydd` e `.ytd` por hash MD5,
mostrando quanto espaço de streaming cada grupo desperdiça. Tem **NUI in-game** (`/clothdetect`) e
**painel web** (`tools/start_web.bat`), sem fundo escuro no jogo e funcionando mesmo com o servidor desligado.

## Instalação

```cfg
ensure framezero_bridge
ensure piercer_clothdetect
```

Permissão in-game: grupos em `config.lua` (via `framezero_bridge`), ACE (`add_ace group.admin piercer.admin allow`)
ou `identifiers` fixos. Exige **Node.js** instalado na máquina do servidor para rodar a varredura e a quarentena.

## Idioma

- Cada pessoa pode alternar entre `PT` e `EN` no topo da NUI ou do painel web; a escolha fica salva naquele navegador.
- Todos os textos da interface ficam no objeto `I18N` em `web/app.js`, compartilhado pela NUI e pelo painel web.

## O que detecta

| Tipo | Critério | Observação |
|---|---|---|
| **100% Clone (mesmo gênero)** | Mesmo `.ydd` (MD5) e mesmas `.ytd` (quantidade, tamanho e MD5) | Caso crítico: consome slots e memória de streaming à toa (ex.: mesma peça em `addon` e `addon2`). |
| **100% Clone (unissex M/F)** | Mesmo `.ydd` e mesmas `.ytd` entre pastas `mp_m_` e `mp_f_` | Cópia idêntica duplicada entre o masculino e o feminino. |
| **Retextura (mesmo gênero)** | Mesmo `.ydd` (MD5), mas `.ytd` diferentes | Mesma malha 3D usada com outras estampas ou variações de textura. |
| **Props / unissex (M/F)** | Mesmo `.ydd` entre `mp_m_` e `mp_f_` com texturas diferentes | Comum em bolsas, chapéus, óculos e acessórios compartilhados. |

## Como funciona

- O scanner agrupa primeiro todos os `.ydd` pelo tamanho em bytes e só calcula o MD5 quando há empate, o que deixa a leitura rápida mesmo em pastas grandes.
- Em cada grupo, a primeira pasta encontrada fica marcada como **original mantido** e as demais entram como **cópias redundantes** no cálculo de desperdício (ordenado do maior peso em MB para o menor).
- Filtros por tipo de duplicata, categoria (`JBIB`, `LOWR`, `FEET`, `P_HEAD`...) e pack `addon`, além de busca por nome da pasta e inspeção dos arquivos `.ydd`/`.ytd`.
- **Quarentena**: move (não apaga) a pasta da cópia para `[framezero-cloth]/_backup_duplicatas/<addon>_<categoria>/<pasta>`, grava o histórico em `data/quarantine_log.json` e já tira o item da lista. Com o servidor ligado, rode `refresh` e reinicie o resource de roupas depois de limpar (e ajuste a sequência/ `.meta` se remover itens do meio de um addon).
- Cada varredura atualiza `data/duplicates.json`, `web/data.json` (usado pela NUI) e `data/duplicates.csv` (também baixável pelo botão **Exportar CSV**).

## Scanner e painel web

- **Escanear**: botão **Escanear Agora** (NUI ou web), comando `clothdetect_scan` (ou `clothdup_scan`) no console do servidor, ou `tools/scan.bat` fora do jogo. Para apontar outra pasta manualmente: `node tools/scanner.js --stream "C:\caminho\stream"`.
- **Painel web**: `tools/start_web.bat` abre `http://localhost:3456/`. Lê `data/duplicates.json` direto do disco e executa novas varreduras e quarentenas pelo próprio Node (`tools/web_server.js`), então funciona com o FiveM fechado.

## Ajustes

- `config.lua`: comandos in-game (`/clothdetect`, `/clothdup`, `/roupasrepetidas`) e permissões (`bridge`, `ace`, `identifiers`).
- `tools/scanner.js`, `tools/quarantine.js` e `tools/web_server.js`: caminho padrão da pasta `stream` (`[framezero-cloth]/style-cloth-addon/stream`), pasta de backup (`_backup_duplicatas`) e porta do painel web (`3456`).
