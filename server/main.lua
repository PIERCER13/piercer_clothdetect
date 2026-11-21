local RES_NAME = GetCurrentResourceName()
local resPath = GetResourcePath(RES_NAME)

-- Ação de Quarentena / Isolar duplicata
RegisterNetEvent(RES_NAME .. ':quarantine', function(targetFolderPath)
    local src = source
    if not Auth.isAllowed(src) then
        return Auth.notify(src, 'error', 'Você não tem permissão para realizar esta ação.')
    end

    if not targetFolderPath or targetFolderPath == '' then
        return Auth.notify(src, 'error', 'Caminho de pasta inválido.')
    end

    local nodeScript = ('node "%s/tools/quarantine_cli.js" "%s"'):format(resPath, targetFolderPath:gsub('"', '\\"'))
    os.execute(nodeScript)

    TriggerClientEvent(RES_NAME .. ':rescanDone', src)
    Auth.notify(src, 'success', 'Item movido para a pasta de backup/quarentena!')
end)

-- Re-escanear via comando ou botão da NUI
RegisterNetEvent(RES_NAME .. ':triggerRescan', function(requesterSrc)
    local src = requesterSrc or source
    if src ~= 0 and not Auth.isAllowed(src) then
        return Auth.notify(src, 'error', 'Sem permissão para re-escanear.')
    end

    print('^3[Piercer Cloth Detect] Iniciando varredura da pasta stream...^7')
    local cmd = ('node "%s/tools/scanner.js"'):format(resPath)
    
    CreateThread(function()
        os.execute(cmd)
        print('^2[Piercer Cloth Detect] Varredura concluída e web/data.json atualizado!^7')
        if src and src ~= 0 then
            TriggerClientEvent(RES_NAME .. ':rescanDone', src)
            Auth.notify(src, 'success', 'Varredura de roupas concluída!')
        end
    end)
end)

-- Console commands
RegisterCommand('clothdetect_scan', function(src)
    if src ~= 0 then return end
    TriggerEvent(RES_NAME .. ':triggerRescan', 0)
end, true)

RegisterCommand('clothdup_scan', function(src)
    if src ~= 0 then return end
    TriggerEvent(RES_NAME .. ':triggerRescan', 0)
end, true)

-- Ingame commands
for _, cmd in ipairs(Config.Commands) do
    RegisterCommand(cmd, function(src)
        if Auth.isAllowed(src) then
            TriggerClientEvent(RES_NAME .. ':openUI', src)
        else
            Auth.notify(src, 'error', 'Você não possui permissão para acessar o detector de roupas.')
        end
    end, false)
end
