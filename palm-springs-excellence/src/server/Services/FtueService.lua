--[[
    FtueService.lua — First-time user experience (Roblox onboarding guidance)
    https://create.roblox.com/docs/production/game-design/onboarding

    Goals: teach essentials, get to fun quickly, leave player wanting more.
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local RemoteManager = require(ReplicatedStorage:WaitForChild("RemoteManager"))

local FtueService = {}
FtueService._economyService = nil
FtueService._completed = {} -- userId → true

local STEPS = {
    {
        delay = 3,
        text = "Welcome to Palm Springs Paradise! Walk to a turquoise plot marker and hold E to claim your desert home.",
    },
    {
        delay = 12,
        text = "Earn SunCoins: tend the community garden, run the fashion show, or open a shop on El Paseo.",
    },
    {
        delay = 22,
        text = "Open the HUD buttons (Plot, Garden, Fashion, Shop). Type /help in chat for test commands in Studio.",
    },
}

function FtueService:init(economyService)
    self._economyService = economyService
    print("[FtueService] Initialized (" .. #STEPS .. " onboarding steps)")
end

function FtueService:onPlayerReady(player: Player)
    if self._completed[player.UserId] then
        return
    end
    local data = self._economyService and self._economyService:getPlayerData(player)
    if not data then
        return
    end
    -- Returning player: skip if they already own a plot or joined before today
    if data.plotId or (data.stats and (data.stats.totalCoinsEarned or 0) > 0) then
        self._completed[player.UserId] = true
        return
    end
    if data.firstJoin ~= data.lastLogin then
        self._completed[player.UserId] = true
        return
    end

    task.spawn(function()
        for i, step in ipairs(STEPS) do
            task.wait(i == 1 and step.delay or (step.delay - STEPS[i - 1].delay))
            if not player.Parent then
                return
            end
            RemoteManager:fireClient("NotifyPlayer", player, "[FTUE " .. i .. "/" .. #STEPS .. "] " .. step.text)
        end
        self._completed[player.UserId] = true
        RemoteManager:fireClient("NotifyPlayer", player,
            "You're ready! Claim a plot, then pick a home style from the Plot panel.")
    end)
end

function FtueService:clearPlayer(player: Player)
    self._completed[player.UserId] = nil
end

return FtueService
