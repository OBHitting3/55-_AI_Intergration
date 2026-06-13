-- PlotService: restore claim + home from DataStore on join (RUBRIC R10)
-- Add after buildHome function block:

--- Reapply saved plot ownership and home without charging (join rehydration).
function PlotService:restorePlayerFromData(player: Player, data: table)
    if not data or not data.plotId then
        return
    end
    local plotId = data.plotId
    local plot = self._plots[plotId]
    if not plot or plot.ownerId then
        return
    end
    plot.ownerId = player.UserId
    -- Mirror claimPlot visual updates (marker color, billboard) without removeCoins
    local plotsFolder = workspace:FindFirstChild("Plots")
    if plotsFolder then
        local marker = plotsFolder:FindFirstChild("PlotMarker_" .. plotId)
        if marker then
            local prompt = marker:FindFirstChild("ClaimPlotPrompt")
            if prompt then prompt:Destroy() end
            marker.Color = GameConfig.Colors.DustyPink
            marker.Transparency = 0.5
        end
    end
    if data.homeStyle and GameConfig.HomeStyles[data.homeStyle] then
        self:buildHome(player, data.homeStyle)
    end
    print("[PlotService] Rehydrated plot #" .. plotId .. " for " .. player.Name)
end

-- In init.server.lua onPlayerAdded, after EconomyService:createLeaderstats:
    pcall(function()
        PlotService:restorePlayerFromData(player, data)
    end)
