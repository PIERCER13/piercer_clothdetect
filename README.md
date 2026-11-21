# 👕 Piercer Cloth Detect (Roupas Repetidas)

Sistema avançado de auditoria, detecção e quarentena de roupas e texturas duplicadas para FiveM.
Desenvolvido com compatibilidade total ao **`framezero_bridge`**, funcionando em **qualquer base** (vRP, vRPex, Creative, ESX, QBCore, Qbox, etc.).

Disponível em duas versões integradas com suporte bilíngue (**PT-BR / EN**):
1. **Versão In-Game (NUI FiveM)** com comando configurável e visual compacto sem fundo escuro.
2. **Versão Web Standalone** para abrir no seu navegador (Google Chrome, Edge, etc.) a qualquer momento com 2 cliques.

---

## ⚡ O que o sistema detecta?

Analisa os modelos 3D (`.ydd`) e texturas (`.ytd`) através de hashes criptográficos (MD5), identificando:

* **100% Clones no Mesmo Gênero (Crítico):** Exatamente o mesmo modelo 3D e texturas em pastas ou addons diferentes (ex: `mp_m_freemode_01_addon` e `addon2`), consumindo slots e memória de streaming à toa.
* **100% Clones Unissex / Cross-Gender:** Itens idênticos duplicados entre pastas masculinas e femininas.
* **Retexturas:** Roupas que usam o mesmo modelo 3D, mas possuem estampas/texturas diferentes.
* **Props / Acessórios Compartilhados:** Acessórios unissex (bolsas, armas brancas, chapéus, óculos).
* **Cálculo de Desperdício:** Mostra o espaço em MB/GB que as duplicatas consomem.

---

## 🚀 Como Usar

### 1. No Servidor FiveM (In-Game)

1. No seu `server.cfg`, garanta que o recurso seja iniciado após o bridge:
   ```cfg
   ensure framezero_bridge
   ensure piercer_clothdetect
   ```
2. No jogo, com uma permissão de admin configurada no `config.lua`:
   * Digite **`/clothdetect`** (ou `/clothdup` / `/roupasrepetidas`).
   * A interface NUI compacta abrirá na sua tela com seletor de idioma `[ PT / EN ]`.
   * Você pode navegar pelos filtros, pesquisar roupas, ver detalhes e mover duplicatas para quarentena.
   * Pressione **ESC** para fechar.
3. No console do servidor:
   * Digite `clothdetect_scan` para rodar uma nova varredura completa.

---

### 2. No Navegador Web (Sem precisar do FiveM aberto)

1. Acesse a pasta:  
   `resources/[framezero-dev-scripts]/piercer_clothdetect/tools`
2. **Para rodar uma nova varredura:**
   * Dê 2 cliques em `scan.bat`.
3. **Para abrir o Painel Web:**
   * Dê 2 cliques em `start_web.bat`.
   * O painel abrirá automaticamente no seu navegador em `http://localhost:3456`.
