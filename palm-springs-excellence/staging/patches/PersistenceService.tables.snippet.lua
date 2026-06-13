-- Align Supabase REST paths with migration (RUBRIC R11)
-- Add to GameConfig.lua:
GameConfig.Supabase = {
    Tables = {
        PlotLayouts = "psp_plot_layouts",
        GardenEvents = "psp_garden_events",
        FashionResults = "psp_fashion_results",
        Transactions = "psp_transactions",
        Analytics = "psp_analytics",
    },
}

-- In PersistenceService.lua replace string literals:
-- "plot_layouts" -> GameConfig.Supabase.Tables.PlotLayouts
-- "garden_states" -> use insert to GameConfig.Supabase.Tables.GardenEvents with event_type
-- "analytics_events" -> GameConfig.Supabase.Tables.Analytics
