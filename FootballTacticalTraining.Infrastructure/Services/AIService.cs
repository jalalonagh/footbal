using System.Text;
using System.Text.Json;
using FootballTacticalTraining.Application.Interfaces;
using Microsoft.Extensions.Options;

namespace FootballTacticalTraining.Infrastructure.Services;

public class AIService : IAIService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly AISettings _settings;

    public AIService(IHttpClientFactory httpClientFactory, IOptions<AISettings> settings)
    {
        _httpClientFactory = httpClientFactory;
        _settings = settings.Value;
    }

    public async Task<string> ChatAsync(string systemPrompt, string userMessage, decimal temperature = 0.7m, int maxTokens = 2048)
    {
        var client = _httpClientFactory.CreateClient();
        var request = new
        {
            model = _settings.Model,
            messages = new[]
            {
                new { role = "system", content = systemPrompt },
                new { role = "user", content = userMessage }
            },
            temperature,
            max_tokens = maxTokens
        };

        var json = JsonSerializer.Serialize(request);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        content.Headers.Add("Authorization", $"Bearer {_settings.ApiKey}");

        var response = await client.PostAsync($"{_settings.BaseUrl}/chat/completions", content);
        response.EnsureSuccessStatusCode();

        var responseJson = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(responseJson);
        var root = doc.RootElement;
        var choices = root.GetProperty("choices");
        if (choices.GetArrayLength() > 0)
        {
            var message = choices[0].GetProperty("message");
            return message.GetProperty("content").GetString() ?? "";
        }
        return "";
    }

    public async Task<string> AnalyzeTacticalAsync(string scenario, string players)
    {
        return await ChatAsync(
            "You are a professional football tactical analyst. Analyze the given scenario and provide tactical advice in Persian (Farsi). Be concise and practical.",
            $"تحليل تاکتيکي سناريو:\n{scenario}\n\nبازیکنان:\n{players}",
            0.7m,
            1024);
    }

    public async Task<string> GenerateTrainingPlanAsync(string playerLevel, string focusArea)
    {
        return await ChatAsync(
            "You are a professional football coach. Generate a training plan in Persian (Farsi). Be specific and actionable.",
            $"سطح بازیکن: {playerLevel}\nتمرکز تمرین: {focusArea}\n\nیک برنامه تمرینی حرفه‌ای بنویس.",
            0.7m,
            1024);
    }

    public async Task<string> EvaluatePerformanceAsync(string stats)
    {
        return await ChatAsync(
            "You are a professional football performance analyst. Evaluate the player's performance in Persian (Farsi). Be encouraging but honest.",
            $"آمار عملکرد بازیکن:\n{stats}\n\nعملکرد را ارزیابی کن.",
            0.7m,
            1024);
    }

    public async Task<AISuggestionResponse> GetTacticalSuggestionAsync(AITacticalSuggestionRequest request)
    {
        var playersJson = JsonSerializer.Serialize(request.AllPlayers, new JsonSerializerOptions { WriteIndented = false });
        var ballHolderInfo = request.BallHolder != null ? $"بازیکن صاحب توپ: شماره {request.BallHolder.Number} ({request.BallHolder.Position}) در موقعیت ({request.BallHolder.X:F0}, {request.BallHolder.Y:F0})" : "توپ در اختیار هیچ بازیکنی نیست";

        var systemPrompt = @"تو یک مربی فوتبال حرفه‌ای هستی. بر اساس موقعیت فعلی بازیکنان در زمین، بهترین پیشنهاد تاکتیکی را ارائه بده.
پاسخ را به صورت JSON معتبر برگردان با این ساختار:
{
  ""explanation"": ""توضیح کلی تاکتیک پیشنهادی به فارسی"",
  ""selectedPlayerSuggestion"": {
    ""playerId"": ""id بازیکن انتخاب شده"",
    ""moveX"": عدد (مقدار تغییر موقعیت X، مثبت به سمت راست، منفی به سمت چپ),
    ""moveY"": عدد (مقدار تغییر موقعیت Y، مثبت به سمت پایین، منفی به سمت بالا),
    ""action"": ""نوع عمل (move/pass/dribble/shoot)"",
    ""reason"": ""دلیل پیشنهاد به فارسی""
  },
  ""teammateSuggestions"": [
    {
      ""playerId"": ""id بازیکن"",
      ""moveX"": عدد,
      ""moveY"": عدد,
      ""action"": ""نوع عمل"",
      ""reason"": ""دلیل به فارسی""
    }
  ],
  ""passTarget"": {
    ""playerId"": ""id بازیکن هدف پاس"",
    ""moveX"": 0,
    ""moveY"": 0,
    ""action"": ""receive"",
    ""reason"": ""دلیل انتخاب هدف پاس به فارسی""
  }
}

نکات مهم:
- موقعیت زمین: X از 0 (چپ) تا 100 (راست)، Y از 0 (بالا) تا 100 (پایین)
- دروازه حریف در سمت راست (X=100) است
- moveX و moveY مقدار تغییر موقعیت هستند (نه موقعیت نهایی)
- فقط بازیکنان تیم خودی (teamId یکسان) را راهنمایی کن
- حداکثر 3 بازیکن تیمی پیشنهاد بده
- اگر توپ در اختیار بازیکن انتخاب شده است، گزینه پاس را در نظر بگیر
- پاسخ حتماً باید JSON معتبر باشد";

        var userPrompt = $@"موقعیت فعلی بازی:

بازیکن انتخاب شده:
- شماره: {request.SelectedPlayerNumber}
- پست: {request.SelectedPlayerPosition}
- تیم: {request.SelectedPlayerTeam}
- موقعیت: ({request.SelectedPlayerX:F0}, {request.SelectedPlayerY:F0})
- آیا توپ دارد: {(request.HasBall ? "بله" : "خیر")}

{ballHolderInfo}

تمام بازیکنان:
{playersJson}

اگر سناریوی خاصی وجود دارد: {request.ScenarioContext ?? "ندارد"}

لطفاً بهترین پیشنهاد تاکتیکی را ارائه بده.";

        var responseJson = await ChatAsync(systemPrompt, userPrompt, 0.3m, 2048);

        try
        {
            var cleaned = responseJson.Trim();
            if (cleaned.StartsWith("```json"))
                cleaned = cleaned[7..];
            if (cleaned.StartsWith("```"))
                cleaned = cleaned[3..];
            if (cleaned.EndsWith("```"))
                cleaned = cleaned[..^3];
            cleaned = cleaned.Trim();

            var result = JsonSerializer.Deserialize<AISuggestionResponse>(cleaned, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            if (result != null) return result;
        }
        catch { }

        return new AISuggestionResponse
        {
            Explanation = responseJson,
            SelectedPlayerSuggestion = new AIPlayerSuggestion
            {
                PlayerId = request.SelectedPlayerId,
                MoveX = request.HasBall ? 5 : 3,
                MoveY = (new Random().NextDouble() - 0.5) * 10,
                Action = request.HasBall ? "dribble" : "move",
                Reason = "پیشنهاد حرکت به سمت دروازه حریف"
            }
        };
    }
}
