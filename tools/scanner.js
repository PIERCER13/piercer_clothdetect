const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const scriptDir = __dirname;
const resourceDir = path.resolve(scriptDir, '..');
const defaultStreamDir = path.resolve(resourceDir, '..', '..', '[framezero-cloth]', 'style-cloth-addon', 'stream');

const args = process.argv.slice(2);
let streamDir = defaultStreamDir;
for (let i = 0; i < args.length; i++) {
    if (args[i] === '--stream' && args[i + 1]) {
        streamDir = path.resolve(args[i + 1]);
        i++;
    }
}

if (!fs.existsSync(streamDir)) {
    const candidates = [
        path.resolve(process.cwd(), 'style-data/resources/[framezero-cloth]/style-cloth-addon/stream'),
        path.resolve('C:/Users/Administrator/Desktop/[framezero-vrp]/style-data/resources/[framezero-cloth]/style-cloth-addon/stream')
    ];
    for (const c of candidates) {
        if (fs.existsSync(c)) {
            streamDir = c;
            break;
        }
    }
}

console.log(`[FrameZero Cloth Detector] Escaneando: ${streamDir}`);
const startTime = Date.now();

let totalFiles = 0;
let totalYdd = 0;
let totalYtd = 0;

const itemFoldersMap = new Map();
const allYdds = [];

function getGenderFromPath(p) {
    const lower = p.toLowerCase();
    if (lower.includes('mp_m_freemode') || lower.includes('mp_m_') || lower.includes('\\mp_m')) return 'Male';
    if (lower.includes('mp_f_freemode') || lower.includes('mp_f_') || lower.includes('\\mp_f')) return 'Female';
    return 'Unisex/Outro';
}

function getCategoryFromPath(p) {
    const parts = p.split(/[\\/]/);
    for (const part of parts) {
        if (part.includes('(') && (part.includes('MAX') || part.includes('JBIB') || part.includes('LOWR') || part.includes('FEET'))) {
            return part;
        }
        if (part.includes('JBIB') || part.includes('LOWR') || part.includes('FEET') || 
            part.includes('TEEF') || part.includes('ACCS') || part.includes('HAIR') || 
            part.includes('P_HEAD') || part.includes('P_EYES') || part.includes('P_EARS') || 
            part.includes('TASK') || part.includes('BERD') || part.includes('HAND') ||
            part.includes('DECL') || part.includes('UPPR') || part.includes('P_LWRIST') || part.includes('P_RWRIST')) {
            return part;
        }
    }
    return 'Outros';
}

function getAddonFromPath(p) {
    const parts = p.split(/[\\/]/);
    for (const part of parts) {
        if (part.toLowerCase().startsWith('mp_m_freemode_01_addon') || part.toLowerCase().startsWith('mp_f_freemode_01_addon')) {
            return part;
        }
    }
    return 'addon';
}

function walk(dir) {
    let entries;
    try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (e) {
        return;
    }

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walk(fullPath);
        } else {
            totalFiles++;
            const ext = path.extname(entry.name).toLowerCase();
            if (ext === '.ydd' || ext === '.ytd') {
                let stat;
                try {
                    stat = fs.statSync(fullPath);
                } catch (e) {
                    continue;
                }

                const dirName = path.dirname(fullPath);
                if (!itemFoldersMap.has(dirName)) {
                    itemFoldersMap.set(dirName, {
                        folderPath: dirName,
                        folderName: path.basename(dirName),
                        addon: getAddonFromPath(dirName),
                        category: getCategoryFromPath(dirName),
                        gender: getGenderFromPath(dirName),
                        totalSize: 0,
                        ydds: [],
                        ytds: []
                    });
                }

                const item = itemFoldersMap.get(dirName);
                item.totalSize += stat.size;

                if (ext === '.ydd') {
                    totalYdd++;
                    const yddObj = {
                        name: entry.name,
                        path: fullPath,
                        size: stat.size,
                        folderPath: dirName
                    };
                    item.ydds.push(yddObj);
                    allYdds.push(yddObj);
                } else if (ext === '.ytd') {
                    totalYtd++;
                    item.ytds.push({
                        name: entry.name,
                        path: fullPath,
                        size: stat.size
                    });
                }
            }
        }
    }
}

walk(streamDir);
console.log(`[FrameZero Cloth Detector] Arquivos varridos: ${totalFiles} | YDD: ${totalYdd} | YTD: ${totalYtd} em ${Date.now() - startTime}ms`);

const sizeGroups = new Map();
for (const ydd of allYdds) {
    if (!sizeGroups.has(ydd.size)) {
        sizeGroups.set(ydd.size, []);
    }
    sizeGroups.get(ydd.size).push(ydd);
}

const hashGroups = new Map();
for (const [size, group] of sizeGroups.entries()) {
    if (group.length > 1) {
        for (const ydd of group) {
            try {
                const buf = fs.readFileSync(ydd.path);
                const hash = crypto.createHash('md5').update(buf).digest('hex');
                ydd.hash = hash;
                if (!hashGroups.has(hash)) {
                    hashGroups.set(hash, []);
                }
                hashGroups.get(hash).push(ydd);
            } catch (e) {}
        }
    }
}

const fileHashCache = new Map();
function hashFile(filePath) {
    if (fileHashCache.has(filePath)) return fileHashCache.get(filePath);
    try {
        const buf = fs.readFileSync(filePath);
        const h = crypto.createHash('md5').update(buf).digest('hex');
        fileHashCache.set(filePath, h);
        return h;
    } catch (e) {
        return null;
    }
}

const duplicateGroups = [];
let totalWastedBytes = 0;
let groupCounter = 1;

for (const [hash, ydds] of hashGroups.entries()) {
    if (ydds.length > 1) {
        const items = [];
        const seenFolders = new Set();

        for (const ydd of ydds) {
            if (seenFolders.has(ydd.folderPath)) continue;
            seenFolders.add(ydd.folderPath);

            const folderItem = itemFoldersMap.get(ydd.folderPath);
            if (!folderItem) continue;

            items.push({
                folderName: folderItem.folderName,
                folderPath: folderItem.folderPath,
                addon: folderItem.addon,
                category: folderItem.category,
                gender: folderItem.gender,
                totalSize: folderItem.totalSize,
                yddFile: ydd.name,
                yddSize: ydd.size,
                ytdCount: folderItem.ytds.length,
                ytds: folderItem.ytds
            });
        }

        if (items.length > 1) {
            const genders = new Set(items.map(i => i.gender));
            const isCrossGender = genders.size > 1 && genders.has('Male') && genders.has('Female');
            const isSameGender = !isCrossGender;

            let isExactMatch = true;
            const firstItem = items[0];
            for (let i = 1; i < items.length; i++) {
                const cur = items[i];
                if (cur.ytds.length !== firstItem.ytds.length) {
                    isExactMatch = false;
                    break;
                }

                const firstSizes = firstItem.ytds.map(y => y.size).sort().join(',');
                const curSizes = cur.ytds.map(y => y.size).sort().join(',');
                if (firstSizes !== curSizes) {
                    isExactMatch = false;
                    break;
                }

                const firstHashes = firstItem.ytds.map(y => hashFile(y.path)).sort().join(',');
                const curHashes = cur.ytds.map(y => hashFile(y.path)).sort().join(',');
                if (firstHashes !== curHashes) {
                    isExactMatch = false;
                    break;
                }
            }

            let type = 'same_gender';
            if (isCrossGender && isExactMatch) {
                type = 'exact_match_cross_gender';
            } else if (isCrossGender) {
                type = 'cross_gender';
            } else if (isExactMatch) {
                type = 'exact_match_same_gender';
            } else {
                type = 'retexture_same_gender';
            }

            // Clean item representation for JSON (no need for raw ytd array paths)
            const cleanItems = items.map(it => ({
                folderName: it.folderName,
                folderPath: it.folderPath,
                addon: it.addon,
                category: it.category,
                gender: it.gender,
                totalSize: it.totalSize,
                yddFile: it.yddFile,
                yddSize: it.yddSize,
                ytdCount: it.ytdCount,
                ytdFiles: it.ytds.map(y => y.name)
            }));

            let wastedInGroup = 0;
            for (let i = 1; i < cleanItems.length; i++) {
                wastedInGroup += cleanItems[i].totalSize;
            }
            totalWastedBytes += wastedInGroup;

            duplicateGroups.push({
                id: `DUP-${String(groupCounter++).padStart(4, '0')}`,
                yddHash: hash,
                yddSize: cleanItems[0].yddSize,
                type: type,
                isExactMatch: isExactMatch,
                isSameGender: isSameGender,
                isCrossGender: isCrossGender,
                category: cleanItems[0].category,
                genders: Array.from(genders),
                wastedBytes: wastedInGroup,
                primaryItem: cleanItems[0],
                duplicateItems: cleanItems.slice(1),
                allCount: cleanItems.length
            });
        }
    }
}

// Sort groups: largest wasted size first
duplicateGroups.sort((a, b) => b.wastedBytes - a.wastedBytes);

const wastedMB = (totalWastedBytes / (1024 * 1024)).toFixed(2);
const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

const stats = {
    scannedAt: new Date().toISOString(),
    scanDurationSeconds: parseFloat(totalTime),
    streamDirectory: streamDir,
    totalFiles: totalFiles,
    totalYdd: totalYdd,
    totalYtd: totalYtd,
    totalItemFolders: itemFoldersMap.size,
    duplicateGroupsCount: duplicateGroups.length,
    exactMatchSameGenderCount: duplicateGroups.filter(g => g.type === 'exact_match_same_gender').length,
    exactMatchCrossGenderCount: duplicateGroups.filter(g => g.type === 'exact_match_cross_gender').length,
    retextureSameGenderCount: duplicateGroups.filter(g => g.type === 'retexture_same_gender').length,
    crossGenderCount: duplicateGroups.filter(g => g.type === 'cross_gender').length,
    totalWastedBytes: totalWastedBytes,
    totalWastedMB: parseFloat(wastedMB)
};

console.log('\n======================================================');
console.log(`[FrameZero Cloth Detector] Scan Concluído em ${totalTime}s!`);
console.log(`- Total de Pastas de Roupas: ${itemFoldersMap.size}`);
console.log(`- Grupos com Duplicatas: ${duplicateGroups.length}`);
console.log(`- 100% Idênticas no MESMO Gênero (Crítico): ${stats.exactMatchSameGenderCount}`);
console.log(`- 100% Idênticas Cross-Gender (M vs F): ${stats.exactMatchCrossGenderCount}`);
console.log(`- Variações de Textura (Mesmo Gênero): ${stats.retextureSameGenderCount}`);
console.log(`- Props / Acessórios Unissex (M vs F): ${stats.crossGenderCount}`);
console.log(`- Espaço Desperdiçado Estimado: ${wastedMB} MB`);
console.log('======================================================\n');

// Save outputs
const dataDir = path.resolve(resourceDir, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const webDir = path.resolve(resourceDir, 'web');
if (!fs.existsSync(webDir)) fs.mkdirSync(webDir, { recursive: true });

const resultData = { stats, groups: duplicateGroups };

fs.writeFileSync(path.join(dataDir, 'duplicates.json'), JSON.stringify(resultData, null, 2), 'utf8');
fs.writeFileSync(path.join(webDir, 'data.json'), JSON.stringify(resultData, null, 2), 'utf8');

let csv = 'ID;Tipo;Categoria;Genero;Tamanho_YDD;Espaco_Desperdicado_MB;Original_Addon;Original_Pasta;Duplicata_Addon;Duplicata_Pasta;Duplicata_Caminho\n';
for (const g of duplicateGroups) {
    const wastedMBItem = (g.wastedBytes / (1024 * 1024)).toFixed(2);
    for (const dup of g.duplicateItems) {
        csv += `"${g.id}";"${g.type}";"${g.category.replace(/"/g, '""')}";"${g.genders.join('/')}";${g.yddSize};${wastedMBItem};"${g.primaryItem.addon}";"${g.primaryItem.folderName.replace(/"/g, '""')}";"${dup.addon}";"${dup.folderName.replace(/"/g, '""')}";"${dup.folderPath.replace(/"/g, '""')}"\n`;
    }
}
fs.writeFileSync(path.join(dataDir, 'duplicates.csv'), csv, 'utf8');

console.log(`[FrameZero Cloth Detector] Arquivos gerados com sucesso.`);
