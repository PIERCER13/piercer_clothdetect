local RES_NAME = GetCurrentResourceName()
local isUiOpen = false

CreateThread(function()
    SetNuiFocus(false, false)
    SendNUIMessage({ action = 'close' })
end)

RegisterNetEvent(RES_NAME .. ':openUI', function()
    if isUiOpen then return end
    isUiOpen = true
    SetNuiFocus(true, true)

    SendNUIMessage({
        action = 'open'
    })
end)

RegisterNetEvent(RES_NAME .. ':rescanDone', function()
    SendNUIMessage({
        action = 'refresh'
    })
end)

-- Fechar a NUI
local function closeUI()
    if not isUiOpen then return end
    isUiOpen = false
    SetNuiFocus(false, false)
    SendNUIMessage({ action = 'close' })
end

-- Callbacks vindos do JavaScript da NUI
RegisterNUICallback('close', function(_, cb)
    closeUI()
    cb({ ok = true })
end)

RegisterNUICallback('rescan', function(_, cb)
    TriggerServerEvent(RES_NAME .. ':triggerRescan')
    cb({ ok = true })
end)

RegisterNUICallback('quarantine', function(data, cb)
    if data and data.folderPath then
        TriggerServerEvent(RES_NAME .. ':quarantine', data.folderPath)
        cb({ ok = true })
    else
        cb({ ok = false, error = 'Caminho inválido' })
    end
end)

-- Se o recurso parar, remove o foco do mouse
AddEventHandler('onResourceStop', function(res)
    if res == RES_NAME and isUiOpen then
        SetNuiFocus(false, false)
    end
end)
