-- Add at top of TestCommands.lua after service requires:
local RunService = game:GetService("RunService")

-- Replace TestCommands:init body start with:
function TestCommands:init(services: table)
    self._services = services

    if not RunService:IsStudio() then
        warn("[TestCommands] Disabled outside Roblox Studio (RUBRIC R07)")
        return
    end

    -- ... rest of existing init (PlayerAdded chat listeners)

-- Add at start of _handleChat:
function TestCommands:_handleChat(player, message)
    if not RunService:IsStudio() then
        return
    end
    -- ... existing handler
