fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'piercer_clothdetect'
author 'piercer'
description 'Auditoria, detecção e quarentena de roupas duplicadas (In-Game NUI e Painel Web)'
version '1.0.0'

-- Compatibilidade total com framezero_bridge para qualquer base
dependency 'framezero_bridge'

ui_page 'web/index.html'

shared_scripts {
    'config.lua',
    '@framezero_bridge/import.lua'
}

client_scripts {
    'client/main.lua'
}

server_scripts {
    'server/auth.lua',
    'server/main.lua'
}

files {
    'web/index.html',
    'web/style.css',
    'web/app.js',
    'web/data.json'
}
