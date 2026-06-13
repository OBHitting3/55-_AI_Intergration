-- init.server.lua — FTUE + excellence wiring
local FtueService = require(script.Services.FtueService)

-- After EventService init, before TestCommands:
FtueService:init(EconomyService)
EconomyService:setGamePassService(GamePassService)
EconomyService:setEventService(EventService)

-- In onPlayerAdded, replace welcome-only task.delay block tail with:
    pcall(function()
        PlotService:restorePlayerFromData(player, data)
    end)
    task.delay(1, function()
        if player.Parent then
            FtueService:onPlayerReady(player)
        end
    end)
