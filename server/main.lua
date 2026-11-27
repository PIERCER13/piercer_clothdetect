local RES_NAME = GetCurrentResourceName()
local resPath = GetResourcePath(RES_NAME)

-- O caminho vem do client e vai parar numa linha de comando: nunca é usado direto.
-- Só passa se for igual a uma cópia listada na última varredura e não tiver caracteres
-- que o terminal interpreta mesmo entre aspas.
local function findDuplicate(requested)
    if type(requested) ~= 'string' or requested == '' then return nil end
    local raw = LoadResourceFile(RES_NAME, 'data/duplicates.json')
    local ok, data = pcall(json.decode, raw or '')
    if not ok or type(data) ~= 'table' then return nil end
    for _, group in ipairs(data.groups or {}) do
        for _, item in ipairs(group.duplicateItems or {}) do
            if item.folderPath == requested and not requested:find('["%%$`\r\n]') then
                return item.folderPath
            end
        end
    end
    return nil
end

RegisterNetEvent(RES_NAME .. ':quarantine', function(targetFolderPath)
    local src = source
    if not Auth.isAllowed(src) then
        return Auth.notify(src, 'error', 'Você não tem permissão para realizar esta ação.')
    end

    local folder = findDuplicate(targetFolderPath)
    if not folder then
        return Auth.notify(src, 'error', 'Caminho recusado. Faça uma nova varredura e tente de novo.')
    end

    local nodeScript = ('node "%s/tools/quarantine_cli.js" "%s"'):format(resPath, folder)
    local ok = os.execute(nodeScript)

    TriggerClientEvent(RES_NAME .. ':rescanDone', src)
    if ok == true or ok == 0 then
        Auth.notify(src, 'success', 'Item movido para a pasta de backup/quarentena!')
    else
        Auth.notify(src, 'error', 'Não foi possível mover a pasta. Veja o console do servidor.')
    end
end)

RegisterNetEvent(RES_NAME .. ':triggerRescan', function()
    -- quem pede é sempre o source do evento: um argumento enviado pelo client
    -- (ex.: 0, "console") pularia a checagem de permissão. TriggerEvent local não tem source.
    local src = tonumber(source) or 0
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

RegisterCommand('clothdetect_scan', function(src)
    if src ~= 0 then return end
    TriggerEvent(RES_NAME .. ':triggerRescan', 0)
end, true)

RegisterCommand('clothdup_scan', function(src)
    if src ~= 0 then return end
    TriggerEvent(RES_NAME .. ':triggerRescan', 0)
end, true)

for _, cmd in ipairs(Config.Commands) do
    RegisterCommand(cmd, function(src)
        if Auth.isAllowed(src) then
            TriggerClientEvent(RES_NAME .. ':openUI', src)
        else
            Auth.notify(src, 'error', 'Você não possui permissão para acessar o detector de roupas.')
        end
    end, false)
end
