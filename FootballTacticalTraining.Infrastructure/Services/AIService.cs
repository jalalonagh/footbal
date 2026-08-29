using System.Diagnostics;
using System.Text;
using System.Text.Json;
using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Domain.Entities;
using Microsoft.Extensions.Options;

namespace FootballTacticalTraining.Infrastructure.Services;

public class AIService : IAIService
{
    private readonly HttpClient _httpClient;
    private readonly AISettings _settings;
    private readonly AiLogService? _logService;

    public AIService(HttpClient httpClient, IOptions<AISettings> settings, AiLogService? logService = null)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
        _logService = logService;
    }

    private async Task<string> SendRequestAsync(string endpoint, object request)
    {
        var json = JsonSerializer.Serialize(request);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        
        var sw = Stopwatch.StartNew();
        int statusCode = 0;
        string responseBody = "";
        string? error = null;

        try
        {
            using var httpRequest = new HttpRequestMessage(HttpMethod.Post, $"{_settings.BaseUrl}/chat/completions");
            httpRequest.Content = content;
            httpRequest.Headers.Add("Authorization", $"Bearer {_settings.ApiKey}");

            var response = await _httpClient.SendAsync(httpRequest);
            statusCode = (int)response.StatusCode;
            responseBody = await response.Content.ReadAsStringAsync();
            response.EnsureSuccessStatusCode();

            using var doc = JsonDocument.Parse(responseBody);
            var root = doc.RootElement;
            var choices = root.GetProperty("choices");
            if (choices.GetArrayLength() > 0)
            {
                var message = choices[0].GetProperty("message");
                return message.GetProperty("content").GetString() ?? "";
            }
            return "";
        }
        catch (Exception ex)
        {
            error = ex.Message;
            throw;
        }
        finally
        {
            sw.Stop();
            if (_logService != null)
            {
                try
                {
                    await _logService.LogAsync(new AiLog
                    {
                        Endpoint = endpoint,
                        RequestBody = json,
                        ResponseBody = responseBody,
                        StatusCode = statusCode,
                        DurationMs = sw.ElapsedMilliseconds,
                        ErrorMessage = error,
                        Model = _settings.Model
                    });
                }
                catch { }
            }
        }
    }

    public async Task<string> ChatAsync(string systemPrompt, string userMessage, decimal temperature = 0.7m, int maxTokens = 2048)
    {
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

        return await SendRequestAsync("chat", request);
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

    public async Task<PassSimulationResponse> SimulatePassAsync(PassSimulationRequest request)
    {
        var teammates = request.AllPlayers.Where(p => p.TeamId == request.TeamId && p.Id != request.BallHolderId).ToList();
        var teammatesJson = JsonSerializer.Serialize(teammates, new JsonSerializerOptions { WriteIndented = false });

        var systemPrompt = @"تو یک مربی فوتبال حرفه‌ای هستی. بهترین بازیکن برای پاس را انتخاب کن.
پاسخ را به صورت JSON معتبر برگردان با این ساختار:
{
  ""targetPlayerId"": ""id بازیکن هدف"",
  ""targetPlayerName"": ""نام بازیکن هدف"",
  ""targetPlayerNumber"": شماره بازیکن هدف,
  ""targetX"": عدد (موقعیت X بازیکن هدف),
  ""targetY"": عدد (موقعیت Y بازیکن هدف),
  ""passType"": ""نوع پاس (short/long/through/chip)"",
  ""reason"": ""دلیل انتخاب این بازیکن به فارسی"",
  ""trajectory"": ""نوع مسیر توپ (straight/curved/through)""
}

نکات مهم:
- موقعیت زمین: X از 0 (چپ) تا 100 (راست)، Y از 0 (بالا) تا 100 (پایین)
- دروازه حریف در سمت راست (X=100) است
- بهترین گزینه برای پاس را انتخاب کن (موقعیت مناسب، فاصله مناسب، عدم پوشش توسط حریف)
- اگر بازیکنی در موقعیت گل‌زنی است، او را انتخاب کن
- پاسخ حتماً باید JSON معتبر باشد";

        var ballHolderInfo = $"صاحب توپ: شماره {request.BallHolderNumber} ({request.BallHolderPosition}) در موقعیت ({request.BallHolderX:F0}, {request.BallHolderY:F0})";

        var userPrompt = $@"موقعیت فعلی بازی:

{ballHolderInfo}

بازیکنان تیمی:
{teammatesJson}

لطفاً بهترین بازیکن برای پاس را انتخاب کن.";

        var responseJson = await ChatAsync(systemPrompt, userPrompt, 0.3m, 1024);

        try
        {
            var cleaned = responseJson.Trim();
            if (cleaned.StartsWith("```json")) cleaned = cleaned[7..];
            if (cleaned.StartsWith("```")) cleaned = cleaned[3..];
            if (cleaned.EndsWith("```")) cleaned = cleaned[..^3];
            cleaned = cleaned.Trim();

            var result = JsonSerializer.Deserialize<PassSimulationResponse>(cleaned, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            if (result != null) return result;
        }
        catch { }

        var fallback = teammates.FirstOrDefault();
        return new PassSimulationResponse
        {
            TargetPlayerId = fallback?.Id ?? "",
            TargetPlayerName = fallback?.Position ?? "Teammate",
            TargetPlayerNumber = fallback?.Number ?? 0,
            TargetX = fallback?.X ?? 50,
            TargetY = fallback?.Y ?? 50,
            PassType = "short",
            Reason = "پاس کوتاه به نزدیک‌ترین هم‌تیمی",
            Trajectory = "straight"
        };
    }

    public async Task<AIArticleResponse> GenerateArticleAsync(AIArticleRequest request)
    {
        var langInstruction = request.Language switch
        {
            "Persian" => "Write the ENTIRE response in Persian (Farsi). All content, titles, meta descriptions, and keywords MUST be in Persian.",
            _ => "Write the ENTIRE response in English. All content, titles, meta descriptions, and keywords MUST be in English."
        };

        var systemPrompt = $@"You are an expert sports journalist and SEO content writer specializing in football/soccer.
{langInstruction}

You MUST return ONLY a valid JSON object with NO markdown, NO code fences, NO extra text. The JSON must have this EXACT structure:
{{
  ""title"": ""SEO-optimized article title (50-60 characters, includes focus keyword)"",
  ""content"": ""Full article in HTML format with proper h2/h3 headings, paragraphs, bullet points, and bold text"",
  ""summary"": ""Compelling meta description style summary (150-160 characters)"",
  ""slug"": ""url-friendly-slug-with-hyphens"",
  ""metaTitle"": ""SEO title for search engines (50-60 characters)"",
  ""metaDescription"": ""Meta description for search engines (150-160 characters, compelling, includes keyword)"",
  ""focusKeyword"": ""primary SEO keyword"",
  ""keywords"": ""comma-separated related keywords for meta tags (10-15 keywords)"",
  ""excerpt"": ""Short engaging excerpt for social media sharing (200 characters)"",
  ""readingTimeMinutes"": estimated_reading_time_as_integer,
  ""schemaJson"": ""valid JSON-LD Article schema markup as a string""
}}

SEO Requirements:
- Title must be compelling, include the focus keyword near the beginning
- Content must use proper H2 and H3 headings with keywords naturally placed
- Use short paragraphs (2-3 sentences) for readability
- Include bullet points or numbered lists where appropriate
- Bold important keywords/phrases naturally
- Internal linking suggestions in content
- Content must be 100% original, informative, and engaging
- Keyword density should be natural (1-2%)
- Include a FAQ section with schema markup
- Schema must be valid JSON-LD for Article type with author, datePublished, dateModified
- Content must be structured with proper HTML tags (h2, h3, p, ul, li, strong, blockquote)
- Reading time: approximately 1 minute per 200 words

Football Content Requirements:
- Use proper football terminology
- Reference current tactics, formations, and strategies
- Include practical tips and actionable advice
- Reference real-world examples where appropriate
- Be authoritative and factual";

        var userPrompt = $@"Generate a comprehensive, SEO-optimized football article about: {request.Title}

{(request.Summary != null ? $"Additional context: {request.Summary}" : "")}
{(request.FocusKeyword != null ? $"Focus keyword: {request.FocusKeyword}" : "")}

Target word count: approximately {request.WordCount} words

Generate the complete article with all SEO fields. Return ONLY the JSON object, nothing else.";

        var responseJson = await ChatAsync(systemPrompt, userPrompt, 0.7m, 4096);

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

            var result = JsonSerializer.Deserialize<AIArticleResponse>(cleaned, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            if (result != null && !string.IsNullOrEmpty(result.Title))
                return result;
        }
        catch { }

        return new AIArticleResponse
        {
            Title = request.Title,
            Content = responseJson,
            Summary = request.Summary ?? "",
            Slug = request.Title.ToLower().Replace(" ", "-").Replace("'", ""),
            MetaTitle = request.Title,
            MetaDescription = request.Summary ?? "",
            FocusKeyword = request.FocusKeyword ?? request.Title,
            Keywords = request.FocusKeyword ?? "",
            Excerpt = request.Summary ?? "",
            ReadingTimeMinutes = request.WordCount / 200
        };
    }

    public async Task<ImageAnalysisResponse> AnalyzeFootballImageAsync(ImageAnalysisRequest request)
    {
        var langInstruction = request.Language == "Persian" ? " Respond in Persian (Farsi)." : " Respond in English.";

        var systemPrompt = $@"You are an expert football/soccer tactical analyst. Analyze the provided football match or training image and extract a tactical scenario from it.{langInstruction}

You MUST return ONLY a valid JSON object with NO markdown, NO code fences, NO extra text. The JSON must have this EXACT structure:
{{
  ""scenarioName"": ""Brief descriptive name for this scenario (e.g., 'Counter-Attack through Left Wing')"",
  ""description"": ""Detailed description of the tactical situation shown in the image"",
  ""category"": ""One of: Striker, Winger, Midfielder, Defender, Team"",
  ""difficulty"": ""One of: Beginner, Intermediate, Advanced, Expert"",
  ""gamePhase"": ""One of: BuildUp, Possession, AttackingTransition, Attacking, FinalThird, DefensiveTransition, OutOfPossession, SetPiece"",
  ""gameMinute"": estimated_minute_of_the_match_as_integer,
  ""homeScore"": home_team_score_as_integer,
  ""awayScore"": away_team_score_as_integer,
  ""formation"": ""detected formation (e.g., '4-3-3', '4-4-2')"",
  ""trainingMode"": ""One of: Learn, Practice, Challenge, Question"",
  ""players"": [
    {{
      ""number"": player_number_as_integer,
      ""position"": ""football position code (GK, CB, LB, RB, CDM, CM, CAM, LM, RM, LW, RWing, CF, ST)"",
      ""x"": approximate_x_position_on_pitch_0_to_100,
      ""y"": approximate_y_position_on_pitch_0_to_100,
      ""teamId"": 1_for_home_team_or_2_for_away_team,
      ""hasBall"": true_or_false,
      ""description"": ""brief description of what this player is doing or about to do""
    }}
  ],
  ""explanation"": ""Detailed tactical analysis of the situation, key movements, and coaching points""
}}

Analysis Guidelines:
- Identify ALL visible players on the pitch (use standard football positions)
- Estimate realistic X,Y coordinates on the pitch (0-100 scale where 0,0 is top-left)
- Determine which team has possession
- Identify the current game phase (attack, defense, transition, etc.)
- Detect the formation being used
- Describe key tactical movements and player positions
- Include coaching insights about what could happen next
- If you cannot clearly see a detail, make your best educated guess based on context
- The pitch dimensions should follow standard football pitch proportions";

        var userPrompt = $@"Analyze this football image and extract the tactical scenario. Provide all player positions, the current game situation, and tactical analysis.

The image shows a football/soccer situation. Please identify:
1. All visible players and their positions
2. Which team has the ball
3. The current game phase
4. The formation being used
5. What tactical action is likely to happen next

Return ONLY the JSON object with the complete scenario data, nothing else.";

        var requestBody = new
        {
            model = _settings.Model,
            messages = new object[]
            {
                new { role = "system", content = systemPrompt },
                new
                {
                    role = "user",
                    content = new object[]
                    {
                        new { type = "text", text = userPrompt },
                        new { type = "image_url", image_url = new { url = $"data:image/jpeg;base64,{request.ImageBase64}" } }
                    }
                }
            },
            temperature = 0.4m,
            max_tokens = 4096
        };

        var sw = Stopwatch.StartNew();
        int statusCode = 0;
        string responseBody = "";
        string? error = null;

        try
        {
            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            using var httpRequest = new HttpRequestMessage(HttpMethod.Post, $"{_settings.BaseUrl}/chat/completions");
            httpRequest.Content = content;
            httpRequest.Headers.Add("Authorization", $"Bearer {_settings.ApiKey}");

            var response = await _httpClient.SendAsync(httpRequest);
            statusCode = (int)response.StatusCode;
            responseBody = await response.Content.ReadAsStringAsync();
            response.EnsureSuccessStatusCode();

            using var doc = JsonDocument.Parse(responseBody);
            var root = doc.RootElement;
            var choices = root.GetProperty("choices");
            if (choices.GetArrayLength() > 0)
            {
                var message = choices[0].GetProperty("message");
                var contentStr = message.GetProperty("content").GetString() ?? "";

                var cleaned = contentStr.Trim();
                if (cleaned.StartsWith("```json")) cleaned = cleaned[7..];
                if (cleaned.StartsWith("```")) cleaned = cleaned[3..];
                if (cleaned.EndsWith("```")) cleaned = cleaned[..^3];
                cleaned = cleaned.Trim();

                var result = JsonSerializer.Deserialize<ImageAnalysisResponse>(cleaned, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                if (result != null && !string.IsNullOrEmpty(result.ScenarioName))
                    return result;
            }
        }
        catch (Exception ex)
        {
            error = ex.Message;
            throw;
        }
        finally
        {
            sw.Stop();
            if (_logService != null)
            {
                try
                {
                    await _logService.LogAsync(new AiLog
                    {
                        Endpoint = "image-analysis",
                        RequestBody = JsonSerializer.Serialize(requestBody),
                        ResponseBody = responseBody,
                        StatusCode = statusCode,
                        DurationMs = sw.ElapsedMilliseconds,
                        ErrorMessage = error,
                        Model = _settings.Model
                    });
                }
                catch { }
            }
        }

        return new ImageAnalysisResponse
        {
            ScenarioName = "AI Extracted Scenario",
            Description = "Scenario extracted from uploaded image",
            Category = "Team",
            Difficulty = "Intermediate",
            GamePhase = "BuildUp",
            Players = new List<ImagePlayerInfo>()
        };
    }
}
