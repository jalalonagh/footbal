namespace FootballTacticalTraining.Application.Interfaces;

public interface IAIService
{
    Task<string> ChatAsync(string systemPrompt, string userMessage, decimal temperature = 0.7m, int maxTokens = 2048);
    Task<string> AnalyzeTacticalAsync(string scenario, string players);
    Task<string> GenerateTrainingPlanAsync(string playerLevel, string focusArea);
    Task<string> EvaluatePerformanceAsync(string stats);
    Task<AISuggestionResponse> GetTacticalSuggestionAsync(AITacticalSuggestionRequest request);
    Task<PassSimulationResponse> SimulatePassAsync(PassSimulationRequest request);
    Task<AIArticleResponse> GenerateArticleAsync(AIArticleRequest request);
}

public class AIArticleRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Summary { get; set; }
    public string? FocusKeyword { get; set; }
    public string Language { get; set; } = "English";
    public int WordCount { get; set; } = 1500;
}

public class AIArticleResponse
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string MetaTitle { get; set; } = string.Empty;
    public string MetaDescription { get; set; } = string.Empty;
    public string FocusKeyword { get; set; } = string.Empty;
    public string Keywords { get; set; } = string.Empty;
    public string Excerpt { get; set; } = string.Empty;
    public int ReadingTimeMinutes { get; set; } = 0;
    public string SchemaJson { get; set; } = "{}";
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

public class PassSimulationRequest
{
    public string BallHolderId { get; set; } = "";
    public int BallHolderNumber { get; set; }
    public string BallHolderPosition { get; set; } = "";
    public double BallHolderX { get; set; }
    public double BallHolderY { get; set; }
    public int TeamId { get; set; }
    public List<AIPlayerInfo> AllPlayers { get; set; } = new();
    public string? ScenarioContext { get; set; }
}

public class PassSimulationResponse
{
    public string TargetPlayerId { get; set; } = "";
    public string TargetPlayerName { get; set; } = "";
    public int TargetPlayerNumber { get; set; }
    public double TargetX { get; set; }
    public double TargetY { get; set; }
    public string PassType { get; set; } = "";
    public string Reason { get; set; } = "";
    public string Trajectory { get; set; } = "straight";
}
