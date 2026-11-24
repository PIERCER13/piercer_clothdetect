const I18N = {
    pt: {
        subtitle: 'Auditoria e Detecção de Roupas Duplicadas',
        btnExport: 'Exportar CSV',
        btnRescan: 'Escanear Agora',
        statGroups: 'Grupos Duplicados',
        statGroupsSub: 'Roupas com mesma malha 3D',
        statWasted: 'Espaço Desperdiçado',
        statWastedSub: 'Redundância de Streaming',
        statClones: '100% Clones (Mesmo Gênero)',
        statClonesSub: 'Mesh + Texturas Idênticas',
        statUnisex: 'Unissex / Props (M vs F)',
        statUnisexSub: 'Itens compartilhados',
        tabAll: 'Todas',
        tabExactSame: '100% Clones Mesmo Gênero',
        tabRetexture: 'Retexturas Mesmo Gênero',
        tabExactCross: 'Clones Unissex M/F',
        tabCross: 'Props M/F',
        allCategories: 'Todas as Categorias',
        allAddons: 'Todos os Addons',
        searchPlaceholder: 'Buscar por pasta, loja ou nome...',
        emptyTitle: 'Nenhuma duplicata encontrada',
        emptySub: 'Nenhuma roupa repetida corresponde aos filtros selecionados.',
        statusReady: 'Pronto',
        statusLoading: 'Carregando dados...',
        statusScanning: 'Varrendo pasta stream...',
        modalTitle: 'Detalhes da Duplicata',
        modalSubtitle: 'Visualização aprofundada dos arquivos',
        originalBadge: 'Original Mantido',
        duplicateBadge: 'Cópia Redundante',
        wastedLabel: 'Desperdiça: ',
        sizeLabel: 'Tamanho: ',
        texturesLabel: 'Texturas: ',
        btnCopy: 'Copiar',
        btnQuarantine: 'Quarentena',
        btnInspect: 'Inspecionar',
        confirmQuarantine: 'Mover esta roupa repetida para a pasta de backup/quarentena?\n\n',
        copiedToast: 'Caminho copiado!',
        quarantineSuccess: 'Item movido para backup com sucesso!',
        scanSuccess: 'Varredura concluída!',
        csvSuccess: 'Relatório CSV baixado!',
        badgeExactSame: '100% Clone (Mesmo Gênero)',
        badgeExactCross: '100% Clone (M/F)',
        badgeRetexture: 'Retextura',
        badgeProp: 'Prop / Unissex',
        genderMale: 'Masc',
        genderFemale: 'Fem'
    },
    en: {
        subtitle: 'Clothing Duplicates Audit & Detection',
        btnExport: 'Export CSV',
        btnRescan: 'Scan Now',
        statGroups: 'Duplicate Groups',
        statGroupsSub: 'Clothes sharing same 3D mesh',
        statWasted: 'Wasted Storage',
        statWastedSub: 'Streaming Redundancy',
        statClones: '100% Clones (Same Gender)',
        statClonesSub: 'Identical Mesh & Textures',
        statUnisex: 'Unisex / Props (M vs F)',
        statUnisexSub: 'Shared cross-gender items',
        tabAll: 'All',
        tabExactSame: '100% Clones Same Gender',
        tabRetexture: 'Retextures Same Gender',
        tabExactCross: 'Unisex Clones M/F',
        tabCross: 'Props M/F',
        allCategories: 'All Categories',
        allAddons: 'All Addons',
        searchPlaceholder: 'Search by folder, store or name...',
        emptyTitle: 'No duplicates found',
        emptySub: 'No duplicate clothes match the selected filters.',
        statusReady: 'Ready',
        statusLoading: 'Loading data...',
        statusScanning: 'Scanning stream folder...',
        modalTitle: 'Duplicate Details',
        modalSubtitle: 'In-depth file & mesh inspection',
        originalBadge: 'Original Retained',
        duplicateBadge: 'Redundant Copy',
        wastedLabel: 'Wastes: ',
        sizeLabel: 'Size: ',
        texturesLabel: 'Textures: ',
        btnCopy: 'Copy',
        btnQuarantine: 'Quarantine',
        btnInspect: 'Inspect',
        confirmQuarantine: 'Move this duplicate cloth folder to backup/quarantine?\n\n',
        copiedToast: 'Path copied to clipboard!',
        quarantineSuccess: 'Item safely moved to backup folder!',
        scanSuccess: 'Scan completed successfully!',
        csvSuccess: 'CSV Report downloaded!',
        badgeExactSame: '100% Clone (Same Gender)',
        badgeExactCross: '100% Clone (M/F)',
        badgeRetexture: 'Retexture',
        badgeProp: 'Prop / Unisex',
        genderMale: 'Male',
        genderFemale: 'Female'
    }
};

let currentLang = localStorage.getItem('piercer_lang') || 'pt';

let state = {
    stats: {},
    groups: [],
    filteredGroups: [],
    activeFilter: 'all',
    selectedCategory: '',
    selectedAddon: '',
    searchQuery: '',
    isScanning: false
};

const isFiveM = (typeof window.GetParentResourceName === 'function') || 
                (window.invokeNative !== undefined) || 
                (window.location.protocol === 'nui:');

const resourceName = isFiveM ? window.GetParentResourceName() : 'piercer_clothdetect';

// DOM elements
const appEl = document.getElementById('app');
const statTotalGroups = document.getElementById('stat-total-groups');
const statWastedSpace = document.getElementById('stat-wasted-space');
const statExactSameGender = document.getElementById('stat-exact-same-gender');
const statCrossGender = document.getElementById('stat-cross-gender');

const countAll = document.getElementById('count-all');
const countExactSame = document.getElementById('count-exact-same');
const countRetexture = document.getElementById('count-retexture');
const countExactCross = document.getElementById('count-exact-cross');
const countCross = document.getElementById('count-cross');

const selectCategory = document.getElementById('select-category');
const selectAddon = document.getElementById('select-addon');
const searchInput = document.getElementById('search-input');
const duplicateList = document.getElementById('duplicate-list');
const emptyState = document.getElementById('empty-state');
const loadingState = document.getElementById('loading');
const loadingText = document.getElementById('loading-text');

const statusSummary = document.getElementById('status-summary');
const statusPath = document.getElementById('status-path');

const btnRescan = document.getElementById('btn-rescan');
const btnExportCsv = document.getElementById('btn-export-csv');
const btnClose = document.getElementById('btn-close');
const iconRescan = document.getElementById('icon-rescan');

const modalDetails = document.getElementById('modal-details');
const modalClose = document.getElementById('modal-close');
const modalTitle = document.getElementById('modal-title');
const modalSubtitle = document.getElementById('modal-subtitle');
const modalBody = document.getElementById('modal-body');

const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');

const langPtBtn = document.getElementById('lang-pt');
const langEnBtn = document.getElementById('lang-en');

function t(key) {
    return (I18N[currentLang] && I18N[currentLang][key]) || (I18N['pt'][key]) || key;
}

function updateLanguageUI() {
    langPtBtn.classList.toggle('active', currentLang === 'pt');
    langEnBtn.classList.toggle('active', currentLang === 'en');

    document.getElementById('t-subtitle').textContent = t('subtitle');
    document.getElementById('t-btn-export').textContent = t('btnExport');
    document.getElementById('t-btn-rescan').textContent = t('btnRescan');
    
    document.getElementById('t-stat-groups').textContent = t('statGroups');
    document.getElementById('t-stat-groups-sub').textContent = t('statGroupsSub');
    document.getElementById('t-stat-wasted').textContent = t('statWasted');
    document.getElementById('t-stat-wasted-sub').textContent = t('statWastedSub');
    document.getElementById('t-stat-clones').textContent = t('statClones');
    document.getElementById('t-stat-clones-sub').textContent = t('statClonesSub');
    document.getElementById('t-stat-unisex').textContent = t('statUnisex');
    document.getElementById('t-stat-unisex-sub').textContent = t('statUnisexSub');

    document.getElementById('t-tab-all').textContent = t('tabAll');
    document.getElementById('t-tab-exact-same').textContent = t('tabExactSame');
    document.getElementById('t-tab-retexture').textContent = t('tabRetexture');
    document.getElementById('t-tab-exact-cross').textContent = t('tabExactCross');
    document.getElementById('t-tab-cross').textContent = t('tabCross');

    searchInput.placeholder = t('searchPlaceholder');
    document.getElementById('t-empty-title').textContent = t('emptyTitle');
    document.getElementById('t-empty-sub').textContent = t('emptySub');
    document.getElementById('t-status-ready').textContent = t('statusReady');

    // Update select options placeholders
    if (selectCategory.options.length > 0) {
        selectCategory.options[0].textContent = t('allCategories');
    }
    if (selectAddon.options.length > 0) {
        selectAddon.options[0].textContent = t('allAddons');
    }

    renderList();
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('piercer_lang', lang);
    updateLanguageUI();
}

langPtBtn.addEventListener('click', () => setLanguage('pt'));
langEnBtn.addEventListener('click', () => setLanguage('en'));

function showToast(msg, isError = false) {
    toastMessage.textContent = msg;
    toast.style.borderColor = isError ? '#ef4444' : '#8B5CF6';
    toast.classList.remove('hidden');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

function formatMB(bytes) {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function formatKB(bytes) {
    return (bytes / 1024).toFixed(1) + ' KB';
}

async function loadData() {
    showLoading(true, t('statusLoading'));
    try {
        let res;
        if (isFiveM) {
            res = await fetch('data.json?t=' + Date.now());
        } else {
            try {
                res = await fetch('/api/data');
                if (!res.ok) throw new Error();
            } catch (e) {
                res = await fetch('data.json?t=' + Date.now());
            }
        }

        const data = await res.json();
        if (data && data.groups) {
            setData(data);
        } else {
            showToast('Nenhum dado encontrado.', true);
        }
    } catch (e) {
        console.error('Falha ao carregar dados:', e);
        showToast('Erro ao carregar banco de dados.', true);
    } finally {
        showLoading(false);
    }
}

function setData(data) {
    state.stats = data.stats || {};
    state.groups = data.groups || [];

    statTotalGroups.textContent = state.stats.duplicateGroupsCount || state.groups.length;
    statWastedSpace.textContent = `${state.stats.totalWastedMB || 0} MB`;
    statExactSameGender.textContent = state.stats.exactMatchSameGenderCount || 0;
    statCrossGender.textContent = (state.stats.exactMatchCrossGenderCount || 0) + (state.stats.crossGenderCount || 0);

    countAll.textContent = state.groups.length;
    countExactSame.textContent = state.groups.filter(g => g.type === 'exact_match_same_gender').length;
    countRetexture.textContent = state.groups.filter(g => g.type === 'retexture_same_gender').length;
    countExactCross.textContent = state.groups.filter(g => g.type === 'exact_match_cross_gender').length;
    countCross.textContent = state.groups.filter(g => g.type === 'cross_gender').length;

    statusSummary.textContent = `${state.groups.length} grupos (${state.stats.totalFiles || 0} files)`;
    if (state.stats.streamDirectory) {
        statusPath.textContent = state.stats.streamDirectory.split('\\').slice(-2).join('\\');
    }

    populateDropdowns();
    applyFilters();
}

function populateDropdowns() {
    const categories = new Set();
    const addons = new Set();

    for (const g of state.groups) {
        if (g.category) categories.add(g.category);
        if (g.primaryItem && g.primaryItem.addon) addons.add(g.primaryItem.addon);
        for (const dup of g.duplicateItems) {
            if (dup.addon) addons.add(dup.addon);
        }
    }

    const prevCat = selectCategory.value;
    const prevAddon = selectAddon.value;

    selectCategory.innerHTML = `<option value="">${t('allCategories')}</option>`;
    Array.from(categories).sort().forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        selectCategory.appendChild(opt);
    });
    selectCategory.value = prevCat;

    selectAddon.innerHTML = `<option value="">${t('allAddons')}</option>`;
    Array.from(addons).sort().forEach(add => {
        const opt = document.createElement('option');
        opt.value = add;
        opt.textContent = add;
        selectAddon.appendChild(opt);
    });
    selectAddon.value = prevAddon;
}

function applyFilters() {
    let result = state.groups;

    if (state.activeFilter !== 'all') {
        result = result.filter(g => g.type === state.activeFilter);
    }

    if (state.selectedCategory) {
        result = result.filter(g => g.category === state.selectedCategory);
    }

    if (state.selectedAddon) {
        result = result.filter(g => {
            if (g.primaryItem && g.primaryItem.addon === state.selectedAddon) return true;
            return g.duplicateItems.some(d => d.addon === state.selectedAddon);
        });
    }

    if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase();
        result = result.filter(g => {
            const inId = g.id.toLowerCase().includes(q);
            const inCat = (g.category || '').toLowerCase().includes(q);
            const inPrimary = (g.primaryItem.folderName || '').toLowerCase().includes(q) ||
                              (g.primaryItem.addon || '').toLowerCase().includes(q);
            const inDups = g.duplicateItems.some(d => 
                (d.folderName || '').toLowerCase().includes(q) || 
                (d.addon || '').toLowerCase().includes(q)
            );
            return inId || inCat || inPrimary || inDups;
        });
    }

    state.filteredGroups = result;
    renderList();
}

function renderList() {
    duplicateList.innerHTML = '';

    if (state.filteredGroups.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }
    emptyState.classList.add('hidden');

    const displayList = state.filteredGroups.slice(0, 80);

    for (const g of displayList) {
        const card = createGroupCard(g);
        duplicateList.appendChild(card);
    }

    if (state.filteredGroups.length > 80) {
        const notice = document.createElement('div');
        notice.className = 'item-meta';
        notice.style.justifyContent = 'center';
        notice.style.padding = '10px';
        notice.innerHTML = `Mostrando 80 de ${state.filteredGroups.length} itens.`;
        duplicateList.appendChild(notice);
    }
}

function createGroupCard(g) {
    const card = document.createElement('div');
    card.className = `group-card ${g.isExactMatch ? 'is-exact' : (g.isCrossGender ? 'is-cross' : 'is-retexture')}`;

    let typeBadge = '';
    if (g.type === 'exact_match_same_gender') {
        typeBadge = `<span class="badge badge-exact">${t('badgeExactSame')}</span>`;
    } else if (g.type === 'exact_match_cross_gender') {
        typeBadge = `<span class="badge badge-exact">${t('badgeExactCross')}</span>`;
    } else if (g.type === 'retexture_same_gender') {
        typeBadge = `<span class="badge badge-retexture">${t('badgeRetexture')}</span>`;
    } else {
        typeBadge = `<span class="badge badge-cross">${t('badgeProp')}</span>`;
    }

    const genderBadges = (g.genders || []).map(gen => {
        const cls = gen === 'Male' ? 'badge-gender-male' : (gen === 'Female' ? 'badge-gender-female' : 'badge-addon');
        const label = gen === 'Male' ? t('genderMale') : (gen === 'Female' ? t('genderFemale') : gen);
        return `<span class="badge ${cls}">${label}</span>`;
    }).join(' ');

    const wastedFormatted = formatMB(g.wastedBytes);

    let duplicatesHtml = '';
    for (const dup of g.duplicateItems) {
        duplicatesHtml += `
            <div class="item-box">
                <div class="item-box-label label-duplicate">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    ${t('duplicateBadge')}
                </div>
                <div class="item-name">${escapeHtml(dup.folderName)}</div>
                <div class="item-meta">
                    <span class="badge badge-addon">${escapeHtml(dup.addon)}</span>
                    <span>${t('sizeLabel')}${formatMB(dup.totalSize)}</span>
                    <span>${t('texturesLabel')}${dup.ytdCount} .ytd</span>
                </div>
                <div class="item-actions">
                    <button class="btn btn-secondary btn-copy" data-path="${escapeHtml(dup.folderPath)}">
                        ${t('btnCopy')}
                    </button>
                    <button class="btn btn-danger btn-quarantine" data-path="${escapeHtml(dup.folderPath)}" data-id="${g.id}">
                        ${t('btnQuarantine')}
                    </button>
                </div>
            </div>
        `;
    }

    card.innerHTML = `
        <div class="group-header">
            <div class="group-title-area">
                <span class="group-id">${g.id}</span>
                ${typeBadge}
                ${genderBadges}
                <span class="badge badge-addon">${escapeHtml(g.category)}</span>
            </div>
            <div class="group-wasted">
                ${t('wastedLabel')}${wastedFormatted}
            </div>
        </div>

        <div class="comparison-container">
            <!-- Original -->
            <div class="item-box">
                <div class="item-box-label label-original">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    ${t('originalBadge')}
                </div>
                <div class="item-name">${escapeHtml(g.primaryItem.folderName)}</div>
                <div class="item-meta">
                    <span class="badge badge-addon">${escapeHtml(g.primaryItem.addon)}</span>
                    <span>${t('sizeLabel')}${formatMB(g.primaryItem.totalSize)}</span>
                    <span>${t('texturesLabel')}${g.primaryItem.ytdCount} .ytd</span>
                </div>
                <div class="item-actions">
                    <button class="btn btn-secondary btn-copy" data-path="${escapeHtml(g.primaryItem.folderPath)}">
                        ${t('btnCopy')}
                    </button>
                    <button class="btn btn-secondary btn-inspect" data-group-id="${g.id}">
                        ${t('btnInspect')}
                    </button>
                </div>
            </div>

            <!-- Cópias -->
            ${duplicatesHtml}
        </div>
    `;

    card.querySelectorAll('.btn-copy').forEach(btn => {
        btn.addEventListener('click', () => {
            const p = btn.getAttribute('data-path');
            navigator.clipboard.writeText(p);
            showToast(t('copiedToast'));
        });
    });

    card.querySelectorAll('.btn-quarantine').forEach(btn => {
        btn.addEventListener('click', () => {
            const p = btn.getAttribute('data-path');
            const id = btn.getAttribute('data-id');
            quarantineAction(p, id);
        });
    });

    card.querySelectorAll('.btn-inspect').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-group-id');
            inspectGroup(id);
        });
    });

    return card;
}

async function quarantineAction(targetPath, groupId) {
    if (!confirm(`${t('confirmQuarantine')}${targetPath}`)) {
        return;
    }

    showLoading(true, t('btnQuarantine') + '...');
    try {
        let res;
        if (isFiveM) {
            res = await fetch(`https://${resourceName}/quarantine`, {
                method: 'POST',
                body: JSON.stringify({ folderPath: targetPath })
            });
        } else {
            res = await fetch('/api/quarantine', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ folderPath: targetPath })
            });
        }

        const data = await res.json();
        if (data.success) {
            showToast(t('quarantineSuccess'));
            await loadData();
        } else {
            showToast(data.error || 'Erro', true);
        }
    } catch (e) {
        showToast('Falha na quarentena.', true);
    } finally {
        showLoading(false);
    }
}

function inspectGroup(groupId) {
    const g = state.groups.find(x => x.id === groupId);
    if (!g) return;

    modalTitle.textContent = `${g.id} — ${t('modalTitle')}`;
    modalSubtitle.textContent = `Categoria: ${g.category} | Hash: ${g.yddHash}`;

    let html = `
        <div style="background: #09090B; border: 1px solid #25212B; padding: 10px; border-radius: 6px;">
            <div style="font-weight: 700; color: #10b981; font-size: 0.75rem; margin-bottom: 4px;">${t('originalBadge')}:</div>
            <div style="font-size: 0.75rem; font-family: monospace; color: #fff;">${escapeHtml(g.primaryItem.folderPath)}</div>
            <div style="margin-top: 6px; font-size: 0.7rem; color: #a1a1aa;">
                ${t('texturesLabel')} (${g.primaryItem.ytdCount}): ${(g.primaryItem.ytdFiles || []).join(', ')}
            </div>
        </div>
    `;

    for (let i = 0; i < g.duplicateItems.length; i++) {
        const dup = g.duplicateItems[i];
        html += `
            <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); padding: 10px; border-radius: 6px;">
                <div style="font-weight: 700; color: #ef4444; font-size: 0.75rem; margin-bottom: 4px;">${t('duplicateBadge')} ${i + 1}:</div>
                <div style="font-size: 0.75rem; font-family: monospace; color: #fff;">${escapeHtml(dup.folderPath)}</div>
                <div style="margin-top: 6px; font-size: 0.7rem; color: #a1a1aa;">
                    ${t('texturesLabel')} (${dup.ytdCount}): ${(dup.ytdFiles || []).join(', ')}
                </div>
            </div>
        `;
    }

    modalBody.innerHTML = html;
    modalDetails.classList.remove('hidden');
}

async function triggerRescan() {
    if (state.isScanning) return;
    state.isScanning = true;
    iconRescan.style.animation = 'spin 1s linear infinite';
    showLoading(true, t('statusScanning'));

    try {
        let res;
        if (isFiveM) {
            res = await fetch(`https://${resourceName}/rescan`, { method: 'POST', body: '{}' });
        } else {
            res = await fetch('/api/rescan', { method: 'POST' });
        }
        showToast(t('scanSuccess'));
        await loadData();
    } catch (e) {
        showToast('Falha na comunicação do scanner.', true);
    } finally {
        state.isScanning = false;
        iconRescan.style.animation = 'none';
        showLoading(false);
    }
}

function exportCsv() {
    if (state.groups.length === 0) {
        showToast('Sem dados para exportar.', true);
        return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,ID;Tipo;Categoria;Generos;Tamanho_YDD_Bytes;Desperdicio_MB;Original_Addon;Original_Pasta;Duplicata_Addon;Duplicata_Pasta;Duplicata_Caminho\n';

    for (const g of state.groups) {
        const wastedMB = (g.wastedBytes / (1024 * 1024)).toFixed(2);
        for (const dup of g.duplicateItems) {
            csvContent += `"${g.id}";"${g.type}";"${(g.category||'').replace(/"/g, '""')}";"${(g.genders||[]).join('/')}";${g.yddSize};${wastedMB};"${g.primaryItem.addon}";"${g.primaryItem.folderName.replace(/"/g, '""')}";"${dup.addon}";"${dup.folderName.replace(/"/g, '""')}";"${dup.folderPath.replace(/"/g, '""')}"\n`;
        }
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `piercer_clothdetect_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(t('csvSuccess'));
}

function closeApp() {
    appEl.style.display = 'none';
    if (isFiveM) {
        fetch(`https://${resourceName}/close`, { method: 'POST', body: '{}' });
    }
}

function showLoading(show, text = 'Carregando...') {
    if (show) {
        loadingText.textContent = text;
        loadingState.classList.remove('hidden');
    } else {
        loadingState.classList.add('hidden');
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
}

// Event Listeners
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.activeFilter = btn.getAttribute('data-filter');
        applyFilters();
    });
});

selectCategory.addEventListener('change', e => {
    state.selectedCategory = e.target.value;
    applyFilters();
});

selectAddon.addEventListener('change', e => {
    state.selectedAddon = e.target.value;
    applyFilters();
});

searchInput.addEventListener('input', e => {
    state.searchQuery = e.target.value.trim();
    applyFilters();
});

btnRescan.addEventListener('click', triggerRescan);
btnExportCsv.addEventListener('click', exportCsv);
btnClose.addEventListener('click', closeApp);

modalClose.addEventListener('click', () => {
    modalDetails.classList.add('hidden');
});
modalDetails.addEventListener('click', e => {
    if (e.target === modalDetails) modalDetails.classList.add('hidden');
});

// ESC
window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        if (!modalDetails.classList.contains('hidden')) {
            modalDetails.classList.add('hidden');
        } else {
            closeApp();
        }
    }
});

// FiveM NUI listener
window.addEventListener('message', event => {
    const item = event.data;
    if (item && item.action === 'open') {
        appEl.style.display = 'flex';
        updateLanguageUI();
        loadData();
    } else if (item && item.action === 'close') {
        appEl.style.display = 'none';
    } else if (item && item.action === 'refresh') {
        loadData();
    }
});

// Standalone Browser
if (!isFiveM) {
    appEl.style.display = 'flex';
    document.addEventListener('DOMContentLoaded', () => {
        updateLanguageUI();
        loadData();
    });
}
