const fs = require('fs');
const path = require('path');

const resourceDir = path.resolve(__dirname, '..');
const dataDir = path.join(resourceDir, 'data');
const logFile = path.join(dataDir, 'quarantine_log.json');

// Base backup dir
const backupBaseDir = path.resolve(resourceDir, '..', '..', '[framezero-cloth]', '_backup_duplicatas');

function getLog() {
    if (fs.existsSync(logFile)) {
        try {
            return JSON.parse(fs.readFileSync(logFile, 'utf8'));
        } catch (e) {
            return [];
        }
    }
    return [];
}

function saveLog(log) {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(logFile, JSON.stringify(log, null, 2), 'utf8');
}

function quarantineItem(targetFolderPath) {
    if (!targetFolderPath || !fs.existsSync(targetFolderPath)) {
        return { success: false, error: 'Pasta não encontrada ou caminho inválido.' };
    }

    const folderName = path.basename(targetFolderPath);
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    
    // Maintain relative subfolder hierarchy inside backup
    const parentDirName = path.basename(path.dirname(targetFolderPath));
    const grandParentDirName = path.basename(path.dirname(path.dirname(targetFolderPath)));
    
    const destDir = path.join(backupBaseDir, `${grandParentDirName}_${parentDirName}`, folderName);

    try {
        if (!fs.existsSync(path.dirname(destDir))) {
            fs.mkdirSync(path.dirname(destDir), { recursive: true });
        }

        // Rename/move folder to backup
        fs.renameSync(targetFolderPath, destDir);

        const log = getLog();
        const entry = {
            id: 'Q-' + Date.now(),
            quarantinedAt: new Date().toISOString(),
            originalPath: targetFolderPath,
            backupPath: destDir,
            folderName: folderName
        };
        log.push(entry);
        saveLog(log);

        // Update duplicates.json by removing this item from duplicate lists
        const dupPath = path.join(dataDir, 'duplicates.json');
        if (fs.existsSync(dupPath)) {
            const data = JSON.parse(fs.readFileSync(dupPath, 'utf8'));
            for (let i = data.groups.length - 1; i >= 0; i--) {
                const group = data.groups[i];
                group.duplicateItems = group.duplicateItems.filter(item => path.normalize(item.folderPath) !== path.normalize(targetFolderPath));
                if (group.duplicateItems.length === 0) {
                    data.groups.splice(i, 1);
                }
            }
            fs.writeFileSync(dupPath, JSON.stringify(data, null, 2), 'utf8');
            fs.writeFileSync(path.join(resourceDir, 'web', 'data.json'), JSON.stringify(data, null, 2), 'utf8');
        }

        return { success: true, message: `Item movido com segurança para backup: ${destDir}`, entry };
    } catch (e) {
        return { success: false, error: `Falha ao mover item: ${e.message}` };
    }
}

module.exports = {
    quarantineItem,
    getLog
};
