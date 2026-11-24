Auth = {}

local function lower(s) return tostring(s):lower() end

local function listHas(list, fn)
    if type(list) ~= 'table' then return false end
    for _, v in ipairs(list) do
        local ok, res = pcall(fn, tostring(v))
        if ok and res then return true end
    end
    return false
end

function Auth.isAllowed(src)
    src = tonumber(src)
    if not src then return false end
    if src == 0 then return true end -- console server

    local p = Config.Permissions

    if listHas(p.bridge, function(perm) return framezero.HasPermission(src, perm) end) then
        return true
    end

    if listHas(p.ace, function(ace) return IsPlayerAceAllowed(src, ace) end) then
        return true
    end

    if type(p.identifiers) == 'table' and #p.identifiers > 0 then
        for _, id in ipairs(GetPlayerIdentifiers(src)) do
            for _, allowed in ipairs(p.identifiers) do
                if lower(id) == lower(allowed) then return true end
            end
        end
    end

    return false
end

function Auth.notify(src, kind, message)
    local ok = pcall(framezero.Notify, src, kind, message, 6000)
    if not ok then
        TriggerClientEvent('chat:addMessage', src, { 
            color = { 0, 242, 254 },
            multiline = true,
            args = { 'FrameZero Cloth', message } 
        })
    end
end

CreateThread(function()
    if framezero.WaitReady(15000) then
        local info = (framezero.Info and framezero.Info()) or {}
        print(('^2[FrameZero Cloth Detector] Integrado ao framezero_bridge (^3%s^2)^7'):format(tostring(info.framework or 'Framework Ativo')))
    else
        print('^3[FrameZero Cloth Detector] Aguardando framezero_bridge...^7')
    end
end)
