Config = {}

Config.Commands = {
    'clothdetect',
    'clothdup',
    'roupasrepetidas'
}

Config.Permissions = {
    bridge = { 
        'admin', 
        'Admin', 
        'admin.permissao', 
        'admin.acesso', 
        'superadmin', 
        'owner',
        'mod'
    },
    ace = { 
        'piercer.admin',
        'command.clothdetect',
        'command.clothdup' 
    },
    identifiers = {
        -- 'license:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        -- 'discord:123456789012345678'
    }
}

-- Pastas monitoradas (relativas à raiz da base ou caminhos absolutos)
Config.StreamFolders = {
    -- sua pasta aqui, ex: 'resources/[framezero-cloth]/stream'
}

-- Pasta de backup/quarentena onde as duplicatas serão salvas ao serem isoladas
Config.QuarantineFolder = 'preencha aqui'

-- Porta do servidor web standalone
Config.WebPort = 3456
