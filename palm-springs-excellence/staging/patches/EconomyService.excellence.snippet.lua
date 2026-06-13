-- EconomyService: wire game pass + event multipliers (RUBRIC R03, R09)
-- Add module-level after EconomyService table:
EconomyService._gamePassService = nil
EconomyService._eventService = nil

function EconomyService:setGamePassService(gamePassService)
    self._gamePassService = gamePassService
end

function EconomyService:setEventService(eventService)
    self._eventService = eventService
end

-- In addCoins(), after validation, before data.sunCoins += amount:
    local multiplier = 1
    if self._gamePassService then
        multiplier = multiplier * self._gamePassService:getCoinMultiplier(player)
    end
    if self._eventService then
        local shopBonus = self._eventService:getShopBonus()
        if reason and string.find(reason, "Shop") and shopBonus > 0 then
            multiplier = multiplier * (1 + shopBonus)
        end
    end
    amount = math.floor(amount * multiplier)
    if amount <= 0 then return false end

-- In addPrestige() if it exists, multiply by eventService:getPrestigeMultiplier()

-- In init.server.lua after GamePassService:init:
EconomyService:setGamePassService(GamePassService)
EconomyService:setEventService(EventService)
