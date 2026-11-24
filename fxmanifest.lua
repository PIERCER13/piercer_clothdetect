fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'piercer_clothdetect'
author 'piercer'

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
