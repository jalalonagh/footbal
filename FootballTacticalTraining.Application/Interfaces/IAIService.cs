namespace FootballTacticalTraining.Application.Interfaces;

public interface IAIService
{
    Task<string> ChatAsync(string systemPrompt, string userMessage, decimal temperature = 0.7m, int maxTokens = 2048);
    Task<string> AnalyzeTacticalAsync(string scenario, string players);
    Task<string> GenerateTrainingPlanAsync(string playerLevel, string focusArea);
    Task<string> EvaluatePerformanceAsync(string stats);
    Task<AISuggestionResponse> GetTacticalSuggestionAsync(AITacticalSuggestionRequest request);
}

public class AITacticalSuggestionRequest
{
    public string SelectedPlayerId { get; set; } = "";
    public int SelectedPlayerNumber { get; set; }
    public string SelectedPlayerPosition { get; set; } = "";
    public int SelectedPlayerTeam { get; set; }
    public double SelectedPlayerX { get; set; }
    public double SelectedPlayerY { get; set; }
    public bool HasBall { get; set; }
    public List<AIPlayerInfo> AllPlayers { get; set; } = new();
    public AIPlayerInfo? BallHolder { get; set; }
    public string? ScenarioContext { get; set; }
}

public class AIPlayerInfo
{
    public string Id { get; set; } = "";
    public string Position { get; set; } = "";
    public int TeamId { get; set; }
    public double X { get; set; }
    public double Y { get; set; }
    public int Number { get; set; }
    public bool IsGoalkeeper { get; set; }
    public bool HasBall { get; set; }
}

public class AISuggestionResponse
{
    public string Explanation { get; set; } = "";
    public AIPlayerSuggestion SelectedPlayerSuggestion { get; set; } = new();
    public List<AIPlayerSuggestion> TeammateSuggestions { get; set; } = new();
    public AIPlayerSuggestion? PassTarget { get; set; }
}

public class AIPlayerSuggestion
{
    public string PlayerId { get; set; } = "";
    public double MoveX { get; set; }
    public double MoveY { get; set; }
    public string Action { get; set; } = "";
    public string Reason { get; set; } = "";
}
