using FootballTacticalTraining.Domain.Entities;
using FootballTacticalTraining.Domain.Entities.Auth;
using FootballTacticalTraining.Domain.Entities.Subscriptions;
using FootballTacticalTraining.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace FootballTacticalTraining.Infrastructure.Data;

public static class SeedData
{
    public static async Task SeedAsync(AppDbContext context)
    {
        if (await context.Users.AnyAsync()) return;

        await SeedAdminAsync(context);
        await SeedPositionsAsync(context);
        await SeedFeaturesAndPlansAsync(context);
        await SeedScenariosAsync(context);
        await context.SaveChangesAsync();
    }

    private static async Task SeedAdminAsync(AppDbContext context)
    {
        context.Users.Add(new User
        {
            Email = "admin@footballtactics.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            FirstName = "Admin",
            LastName = "User",
            Role = UserRole.SuperAdmin,
            IsActive = true,
            EmailConfirmed = true
        });
    }

    private static Task SeedPositionsAsync(AppDbContext context)
    {
        var positions = new List<Position>();

        // Goalkeepers
        positions.Add(new Position
        {
            Code = "GK",
            Name = "Goalkeeper",
            NameFa = "دروازه‌بان",
            Description = "The last line of defense. Responsible for stopping shots, organizing the defense, and distributing the ball to start attacks.",
            DescriptionFa = "آخرین خط دفاع. مسئول جلوگیری از گل‌ها، سازماندهی دفاع و پخش توپ برای شروع حملات.",
            Requirements = "Excellent reflexes, shot-stopping ability, command of the penalty area, good distribution, communication skills, positioning, aerial ability.",
            RequirementsFa = "بازتاب عالی، توانایی مهار شوت، فرماندهی محوطه جریمه، پخش خوب توپ، مهارت‌های ارتباطی، جایگاه‌گیری، توانایی هوایی.",
            Category = "Goalkeeper",
            DisplayOrder = 1,
            IsActive = true
        });

        // Defenders
        positions.Add(new Position
        {
            Code = "CB",
            Name = "Center Back",
            NameFa = "مدافع مرکزی",
            Description = "Central defender responsible for protecting the goal, winning aerial duels, and marking opposition strikers.",
            DescriptionFa = "مدافع مرکزی مسئول محافظت از دروازه، برنده شدن در دوئل‌های هوایی و پوشش مهاجمان حریف.",
            Requirements = "Strong in aerial duels, good tackling, positional awareness, leadership, ability to read the game, composure on the ball.",
            RequirementsFa = "قوی در دوئل‌های هوایی، تکل خوب، آگاهی موقعیتی، رهبری، توانایی خواندن بازی، آرامش با توپ.",
            Category = "Defense",
            DisplayOrder = 2,
            IsActive = true
        });

        positions.Add(new Position
        {
            Code = "LB",
            Name = "Left Back",
            NameFa = "مدافع چپ",
            Description = "Defender on the left side. Responsible for defending the left flank and providing width in attack.",
            DescriptionFa = "مدافع سمت چپ. مسئول دفاع از جناح چپ و ارائه عرض در حمله.",
            Requirements = "Good pace, stamina, crossing ability, defensive awareness, 1v1 defending, overlapping runs.",
            RequirementsFa = "سرعت خوب، استقامت، توانایی ارسال، آگاهی دفاعی، دفاع ۱ به ۱، حرکات همپوشانی.",
            Category = "Defense",
            DisplayOrder = 3,
            IsActive = true
        });

        positions.Add(new Position
        {
            Code = "RB",
            Name = "Right Back",
            NameFa = "مدافع راست",
            Description = "Defender on the right side. Responsible for defending the right flank and providing width in attack.",
            DescriptionFa = "مدافع سمت راست. مسئول دفاع از جناح راست و ارائه عرض در حمله.",
            Requirements = "Good pace, stamina, crossing ability, defensive awareness, 1v1 defending, overlapping runs.",
            RequirementsFa = "سرعت خوب، استقامت، توانایی ارسال، آگاهی دفاعی، دفاع ۱ به ۱، حرکات همپوشانی.",
            Category = "Defense",
            DisplayOrder = 4,
            IsActive = true
        });

        positions.Add(new Position
        {
            Code = "LWB",
            Name = "Left Wing Back",
            NameFa = "مدافع-هافبک چپ",
            Description = "Attacking fullback in a 3-5-2 or 5-3-2 formation. Provides width and crosses from the left.",
            DescriptionFa = "مدافع تهاجمی در فرم‌بندی ۳-۵-۲ یا ۵-۳-۲. عرض و ارسال از چپ ارائه می‌دهد.",
            Requirements = "Excellent stamina, pace, crossing, defensive duties, ability to cover the entire left flank.",
            RequirementsFa = "استقامت عالی، سرعت، ارسال، وظایف دفاعی، توانایی پوشش کل جناح چپ.",
            Category = "Defense",
            DisplayOrder = 5,
            IsActive = true
        });

        positions.Add(new Position
        {
            Code = "RWB",
            Name = "Right Wing Back",
            NameFa = "مدافع-هافبک راست",
            Description = "Attacking fullback in a 3-5-2 or 5-3-2 formation. Provides width and crosses from the right.",
            DescriptionFa = "مدافع تهاجمی در فرم‌بندی ۳-۵-۲ یا ۵-۳-۲. عرض و ارسال از راست ارائه می‌دهد.",
            Requirements = "Excellent stamina, pace, crossing, defensive duties, ability to cover the entire right flank.",
            RequirementsFa = "استقامت عالی، سرعت، ارسال، وظایف دفاعی، توانایی پوشش کل جناح راست.",
            Category = "Defense",
            DisplayOrder = 6,
            IsActive = true
        });

        // Midfielders
        positions.Add(new Position
        {
            Code = "CDM",
            Name = "Central Defensive Midfielder",
            NameFa = "هافبک دفاعی مرکزی",
            Description = "Sits in front of the defense to break up opposition attacks and provide a shield for the back four.",
            DescriptionFa = "جلوی دفاع می‌نشیند تا حملات حریف را خنثی کند و سپری برای خط دفاع چهار نفره باشد.",
            Requirements = "Strong tackling, interceptions, positioning, passing under pressure, reading the game, discipline.",
            RequirementsFa = "تکل قوی، قطع پاس، جایگاه‌گیری، پاس زیر فشار، خواندن بازی، انضباط.",
            Category = "Midfield",
            DisplayOrder = 7,
            IsActive = true
        });

        positions.Add(new Position
        {
            Code = "CM",
            Name = "Central Midfielder",
            NameFa = "هافبک مرکزی",
            Description = "Box-to-box midfielder who contributes to both attack and defense. Controls the tempo of the game.",
            DescriptionFa = "هافبک جام‌به‌جام که در حمله و دفاع مشارکت می‌کند. سرعت بازی را کنترل می‌کند.",
            Requirements = "Good passing range, stamina, tackling, shooting, vision, ability to play under pressure.",
            RequirementsFa = "محدوده پاس خوب، استقامت، تکل، شوت، دید، توانایی بازی زیر فشار.",
            Category = "Midfield",
            DisplayOrder = 8,
            IsActive = true
        });

        positions.Add(new Position
        {
            Code = "CAM",
            Name = "Central Attacking Midfielder",
            NameFa = "هافبک تهاجمی مرکزی",
            Description = "Creative playmaker who operates behind the strikers. Responsible for creating chances and scoring opportunities.",
            DescriptionFa = "بازیساز خلاق که پشت مهاجمان عمل می‌کند. مسئول ایجاد موقعیت‌های گل‌زنی.",
            Requirements = "Excellent vision, creativity, passing, dribbling, shooting, movement between the lines.",
            RequirementsFa = "دید عالی، خلاقیت، پاس، دریبل، شوت، حرکت بین خطوط.",
            Category = "Midfield",
            DisplayOrder = 9,
            IsActive = true
        });

        positions.Add(new Position
        {
            Code = "LM",
            Name = "Left Midfielder",
            NameFa = "هافبک چپ",
            Description = "Midfielder who operates on the left side. Provides width and crosses from deep positions.",
            DescriptionFa = "هافبکی که در سمت چپ عمل می‌کند. عرض و ارسال از عمق ارائه می‌دهد.",
            Requirements = "Good pace, crossing, dribbling, defensive work rate, stamina.",
            RequirementsFa = "سرعت خوب، ارسال، دریبل، تلاش دفاعی، استقامت.",
            Category = "Midfield",
            DisplayOrder = 10,
            IsActive = true
        });

        positions.Add(new Position
        {
            Code = "RM",
            Name = "Right Midfielder",
            NameFa = "هافبک راست",
            Description = "Midfielder who operates on the right side. Provides width and crosses from deep positions.",
            DescriptionFa = "هافبکی که در سمت راست عمل می‌کند. عرض و ارسال از عمق ارائه می‌دهد.",
            Requirements = "Good pace, crossing, dribbling, defensive work rate, stamina.",
            RequirementsFa = "سرعت خوب، ارسال، دریبل، تلاش دفاعی، استقامت.",
            Category = "Midfield",
            DisplayOrder = 11,
            IsActive = true
        });

        // Forwards
        positions.Add(new Position
        {
            Code = "LW",
            Name = "Left Winger",
            NameFa = "وینگر چپ",
            Description = "Attacker who operates on the left flank. Cuts inside to shoot or stays wide to cross.",
            DescriptionFa = "مهاجمی که در جناح چپ عمل می‌کند. برای شوت به داخل می‌آید یا برای ارسال عرض می‌گیرد.",
            Requirements = "Excellent pace, dribbling, crossing, finishing, ability to beat defenders 1v1.",
            RequirementsFa = "سرعت عالی، دریبل، ارسال، گل‌زنی، توانایی شکست دادن مدافعان ۱ به ۱.",
            Category = "Attack",
            DisplayOrder = 12,
            IsActive = true
        });

        positions.Add(new Position
        {
            Code = "RW",
            Name = "Right Winger",
            NameFa = "وینگر راست",
            Description = "Attacker who operates on the right flank. Cuts inside to shoot or stays wide to cross.",
            DescriptionFa = "مهاجمی که در جناح راست عمل می‌کند. برای شوت به داخل می‌آید یا برای ارسال عرض می‌گیرد.",
            Requirements = "Excellent pace, dribbling, crossing, finishing, ability to beat defenders 1v1.",
            RequirementsFa = "سرعت عالی، دریبل، ارسال، گل‌زنی، توانایی شکست دادن مدافعان ۱ به ۱.",
            Category = "Attack",
            DisplayOrder = 13,
            IsActive = true
        });

        positions.Add(new Position
        {
            Code = "CF",
            Name = "Center Forward",
            NameFa = "مهاجم مرکزی",
            Description = "Central attacker who leads the line. Can play as a target man or a mobile striker.",
            DescriptionFa = "مهاجم مرکزی که خط حمله را هدایت می‌کند. می‌تواند به عنوان مهاجم هدف یا مهاجم سیار بازی کند.",
            Requirements = "Good hold-up play, aerial ability, finishing, movement, link-up play, strength.",
            RequirementsFa = "بازی خوب در نگه‌داشتن توپ، توانایی هوایی، گل‌زنی، حرکت، بازی ارتباطی، قدرت.",
            Category = "Attack",
            DisplayOrder = 14,
            IsActive = true
        });

        positions.Add(new Position
        {
            Code = "ST",
            Name = "Striker",
            NameFa = "مهاجم",
            Description = "Main goal scorer. Plays on the shoulder of the last defender, looking to get in behind and score.",
            DescriptionFa = "گلزن اصلی. روی شانه آخرین مدافع بازی می‌کند و به دنبال فرار از خط دفاع و گل‌زنی است.",
            Requirements = "Excellent finishing, movement, pace, composure, heading, ability to play off the shoulder.",
            RequirementsFa = "گل‌زنی عالی، حرکت، سرعت، آرامش، سرزنی، توانایی بازی روی شانه مدافع.",
            Category = "Attack",
            DisplayOrder = 15,
            IsActive = true
        });

        context.Positions.AddRange(positions);
        return Task.CompletedTask;
    }

    private static async Task SeedFeaturesAndPlansAsync(AppDbContext context)
    {
        var features = new List<Feature>();
        var defs = new[] {
            ("BasicScenarios","Basic Scenarios","Access to basic scenarios",false,50,"scenarios",1),
            ("AdvancedScenarios","Advanced Scenarios","Access to advanced scenarios",true,200,"scenarios",2),
            ("Simulation","Simulation","Run tactical simulations",false,10,"daily",3),
            ("AdvancedSimulation","Advanced Simulation","Advanced simulation features",true,50,"daily",4),
            ("AI_Coach","AI Coach","AI-powered coaching feedback",true,20,"daily",5),
            ("ScenarioEditor","Scenario Editor","Create custom scenarios",true,0,"unlimited",6),
            ("TeamManagement","Team Management","Manage teams and players",true,0,"unlimited",7),
            ("AdvancedAnalytics","Advanced Analytics","Detailed performance analytics",true,0,"unlimited",8),
            ("TrainingPlans","Training Plans","Custom training plans",true,10,"plans",9)
        };
        foreach (var (key, name, desc, premium, limit, unit, order) in defs)
            features.Add(new Feature { Key = key, Name = name, Description = desc, IsPremium = premium, DefaultValue = limit, Unit = unit, DisplayOrder = order, IsActive = true });
        context.Features.AddRange(features);
        await context.SaveChangesAsync();

        var plans = new List<SubscriptionPlan>();
        var planDefs = new[] {
            ("Free","Free Plan",0,0m,0m,"IRR",1),
            ("Player Premium Monthly","Player Premium - Monthly",30,299000m,249000m,"IRR",2),
            ("Player Premium Quarterly","Player Premium - Quarterly",90,799000m,649000m,"IRR",3),
            ("Player Premium SemiAnnual","Player Premium - 6 Months",180,1499000m,1199000m,"IRR",4),
            ("Player Premium Annual","Player Premium - Annual",365,2499000m,1999000m,"IRR",5),
            ("Coach Premium Monthly","Coach Premium - Monthly",30,599000m,499000m,"IRR",6),
            ("Coach Premium Quarterly","Coach Premium - Quarterly",90,1599000m,1299000m,"IRR",7),
            ("Coach Premium SemiAnnual","Coach Premium - 6 Months",180,2999000m,2399000m,"IRR",8),
            ("Coach Premium Annual","Coach Premium - Annual",365,4999000m,3999000m,"IRR",9)
        };
        foreach (var (name, desc, dur, price, disc, curr, order) in planDefs)
            plans.Add(new SubscriptionPlan { Name = name, Description = desc, DurationDays = dur, Price = price, DiscountPrice = disc, Currency = curr, DisplayOrder = order, IsActive = true });
        context.SubscriptionPlans.AddRange(plans);
        await context.SaveChangesAsync();

        var allFeatures = await context.Features.ToListAsync();
        var allPlans = await context.SubscriptionPlans.ToListAsync();

        var freePlan = allPlans.FirstOrDefault(p => p.Name == "Free");
        var playerPlans = allPlans.Where(p => p.Name.Contains("Player")).ToList();
        var coachPlans = allPlans.Where(p => p.Name.Contains("Coach")).ToList();
        var basicFeat = allFeatures.FirstOrDefault(f => f.Key == "BasicScenarios");
        var advFeat = allFeatures.FirstOrDefault(f => f.Key == "AdvancedScenarios");
        var simFeat = allFeatures.FirstOrDefault(f => f.Key == "Simulation");
        var advSimFeat = allFeatures.FirstOrDefault(f => f.Key == "AdvancedSimulation");
        var aiFeat = allFeatures.FirstOrDefault(f => f.Key == "AI_Coach");
        var editorFeat = allFeatures.FirstOrDefault(f => f.Key == "ScenarioEditor");
        var teamFeat = allFeatures.FirstOrDefault(f => f.Key == "TeamManagement");
        var analyticsFeat = allFeatures.FirstOrDefault(f => f.Key == "AdvancedAnalytics");
        var plansFeat = allFeatures.FirstOrDefault(f => f.Key == "TrainingPlans");

        if (freePlan != null && basicFeat != null)
            context.PlanFeatures.Add(new PlanFeature { PlanId = freePlan.Id, FeatureId = basicFeat.Id, IsEnabled = true, Limit = 10 });

        foreach (var p in playerPlans)
        {
            if (basicFeat != null) context.PlanFeatures.Add(new PlanFeature { PlanId = p.Id, FeatureId = basicFeat.Id, IsEnabled = true, Limit = 50 });
            if (advFeat != null) context.PlanFeatures.Add(new PlanFeature { PlanId = p.Id, FeatureId = advFeat.Id, IsEnabled = true, Limit = 200 });
            if (simFeat != null) context.PlanFeatures.Add(new PlanFeature { PlanId = p.Id, FeatureId = simFeat.Id, IsEnabled = true, Limit = 30 });
            if (advSimFeat != null) context.PlanFeatures.Add(new PlanFeature { PlanId = p.Id, FeatureId = advSimFeat.Id, IsEnabled = true, Limit = 50 });
            if (aiFeat != null) context.PlanFeatures.Add(new PlanFeature { PlanId = p.Id, FeatureId = aiFeat.Id, IsEnabled = true, Limit = 20 });
            if (plansFeat != null) context.PlanFeatures.Add(new PlanFeature { PlanId = p.Id, FeatureId = plansFeat.Id, IsEnabled = true, Limit = 10 });
        }
        foreach (var p in coachPlans)
        {
            if (basicFeat != null) context.PlanFeatures.Add(new PlanFeature { PlanId = p.Id, FeatureId = basicFeat.Id, IsEnabled = true, Limit = 200 });
            if (advFeat != null) context.PlanFeatures.Add(new PlanFeature { PlanId = p.Id, FeatureId = advFeat.Id, IsEnabled = true, Limit = 500 });
            if (simFeat != null) context.PlanFeatures.Add(new PlanFeature { PlanId = p.Id, FeatureId = simFeat.Id, IsEnabled = true, Limit = 100 });
            if (advSimFeat != null) context.PlanFeatures.Add(new PlanFeature { PlanId = p.Id, FeatureId = advSimFeat.Id, IsEnabled = true, Limit = 100 });
            if (aiFeat != null) context.PlanFeatures.Add(new PlanFeature { PlanId = p.Id, FeatureId = aiFeat.Id, IsEnabled = true, Limit = 50 });
            if (editorFeat != null) context.PlanFeatures.Add(new PlanFeature { PlanId = p.Id, FeatureId = editorFeat.Id, IsEnabled = true });
            if (teamFeat != null) context.PlanFeatures.Add(new PlanFeature { PlanId = p.Id, FeatureId = teamFeat.Id, IsEnabled = true });
            if (analyticsFeat != null) context.PlanFeatures.Add(new PlanFeature { PlanId = p.Id, FeatureId = analyticsFeat.Id, IsEnabled = true });
            if (plansFeat != null) context.PlanFeatures.Add(new PlanFeature { PlanId = p.Id, FeatureId = plansFeat.Id, IsEnabled = true, Limit = 50 });
        }
    }

    private static Task SeedScenariosAsync(AppDbContext context)
    {
        var scenarios = new List<Scenario>();

        // Striker scenarios
        var strikerDefs = new[] {
            ("Run Behind Defense", "Time your run to get behind the defensive line", DifficultyLevel.Beginner, GamePhase.Attacking, 25, "4-3-3"),
            ("Creating Space as Striker", "Move to create space for teammates", DifficultyLevel.Intermediate, GamePhase.Possession, 35, "4-3-3"),
            ("Dropping Deep to Receive", "Drop between lines to link play", DifficultyLevel.Intermediate, GamePhase.BuildUp, 15, "4-4-2"),
            ("Near Post Run", "Attack the near post area", DifficultyLevel.Beginner, GamePhase.FinalThird, 60, "4-3-3"),
            ("Far Post Run", "Attack the far post area", DifficultyLevel.Beginner, GamePhase.FinalThird, 65, "4-3-3"),
            ("Blind Side Movement", "Move on the blind side of the defender", DifficultyLevel.Advanced, GamePhase.Attacking, 70, "4-3-3"),
            ("Striker Pressing", "Lead the press from the front", DifficultyLevel.Intermediate, GamePhase.OutOfPossession, 10, "4-3-3"),
            ("Hold Up Play", "Shield the ball and bring teammates into play", DifficultyLevel.Intermediate, GamePhase.Possession, 40, "4-4-2"),
            ("Counter Attack Run", "Exploit space on the counter", DifficultyLevel.Beginner, GamePhase.AttackingTransition, 50, "4-3-3"),
            ("One on One Finishing", "1v1 situation against the goalkeeper", DifficultyLevel.Beginner, GamePhase.FinalThird, 75, "4-3-3"),
        };
        foreach (var (name, desc, diff, phase, minute, form) in strikerDefs)
            scenarios.Add(new Scenario { Name = name, Description = desc, Category = ScenarioCategory.Striker, Difficulty = diff, GamePhase = phase, GameMinute = minute, Formation = form, Status = ScenarioState.Published, IsPublic = true, Version = 1, TrainingMode = TrainingMode.Practice });

        // Winger scenarios
        var wingerDefs = new[] {
            ("Stay Wide and Stretch", "Hold wide position to stretch the defense", DifficultyLevel.Beginner, GamePhase.Possession, 20, "4-3-3"),
            ("Cut Inside", "Drive inside from the wing", DifficultyLevel.Intermediate, GamePhase.Attacking, 55, "4-3-3"),
            ("Overlap Run", "Make an overlapping run around the fullback", DifficultyLevel.Intermediate, GamePhase.Attacking, 30, "4-3-3"),
            ("Underlap Run", "Make an underlapping run inside", DifficultyLevel.Advanced, GamePhase.Attacking, 45, "4-3-3"),
            ("Half Space Attack", "Attack the half space between center and wing", DifficultyLevel.Advanced, GamePhase.FinalThird, 60, "4-3-3"),
            ("Crossing Situation", "Deliver a cross from wide", DifficultyLevel.Beginner, GamePhase.FinalThird, 70, "4-3-3"),
            ("Counter Wing Attack", "Exploit space on the counter from wide", DifficultyLevel.Beginner, GamePhase.AttackingTransition, 40, "4-3-3"),
            ("Track Back Defensively", "Recover and help the fullback", DifficultyLevel.Intermediate, GamePhase.DefensiveTransition, 25, "4-3-3"),
            ("Switch Play", "Switch the play to the opposite side", DifficultyLevel.Intermediate, GamePhase.Possession, 35, "4-3-3"),
            ("Dribble Past Defender", "Beat the defender in 1v1", DifficultyLevel.Intermediate, GamePhase.Attacking, 50, "4-3-3"),
        };
        foreach (var (name, desc, diff, phase, minute, form) in wingerDefs)
            scenarios.Add(new Scenario { Name = name, Description = desc, Category = ScenarioCategory.Winger, Difficulty = diff, GamePhase = phase, GameMinute = minute, Formation = form, Status = ScenarioState.Published, IsPublic = true, Version = 1, TrainingMode = TrainingMode.Practice });

        // Midfielder scenarios
        var midfielderDefs = new[] {
            ("Between the Lines", "Find space between opposition lines", DifficultyLevel.Advanced, GamePhase.Possession, 30, "4-3-3"),
            ("Third Man Run", "Make a third man run into space", DifficultyLevel.Advanced, GamePhase.Attacking, 55, "4-3-3"),
            ("Support the Attack", "Provide forward passing options", DifficultyLevel.Intermediate, GamePhase.Attacking, 40, "4-3-3"),
            ("Cover Defensive Space", "Fill gaps when defenders push up", DifficultyLevel.Intermediate, GamePhase.DefensiveTransition, 20, "4-3-3"),
            ("Build Up Play", "Orchestrate play from deep", DifficultyLevel.Intermediate, GamePhase.BuildUp, 10, "4-3-3"),
            ("Through Ball", "Play a defense-splitting pass", DifficultyLevel.Advanced, GamePhase.FinalThird, 65, "4-3-3"),
            ("Midfield Pressing", "Press intelligently from midfield", DifficultyLevel.Intermediate, GamePhase.OutOfPossession, 15, "4-3-3"),
            ("Late Run Into Box", "Time a late run into the penalty area", DifficultyLevel.Advanced, GamePhase.FinalThird, 75, "4-3-3"),
            ("Switch Play Mid", "Switch play to create overloads", DifficultyLevel.Intermediate, GamePhase.Possession, 25, "4-3-3"),
            ("Ball Retention Under Pressure", "Keep possession under pressure", DifficultyLevel.Intermediate, GamePhase.Possession, 35, "4-3-3"),
        };
        foreach (var (name, desc, diff, phase, minute, form) in midfielderDefs)
            scenarios.Add(new Scenario { Name = name, Description = desc, Category = ScenarioCategory.Midfielder, Difficulty = diff, GamePhase = phase, GameMinute = minute, Formation = form, Status = ScenarioState.Published, IsPublic = true, Version = 1, TrainingMode = TrainingMode.Practice });

        // Defender scenarios
        var defenderDefs = new[] {
            ("Man Marking", "Track and mark your assigned player", DifficultyLevel.Beginner, GamePhase.OutOfPossession, 20, "4-4-2"),
            ("Defensive Cover", "Cover for your defensive partner", DifficultyLevel.Intermediate, GamePhase.OutOfPossession, 30, "4-4-2"),
            ("Hold Defensive Line", "Maintain the defensive line shape", DifficultyLevel.Intermediate, GamePhase.OutOfPossession, 40, "4-4-2"),
            ("Press From Defense", "Step up and press the ball carrier", DifficultyLevel.Advanced, GamePhase.OutOfPossession, 15, "4-4-2"),
            ("Recovery Run", "Recover back to defensive position", DifficultyLevel.Beginner, GamePhase.DefensiveTransition, 50, "4-4-2"),
            ("Timing the Tackle", "Choose the right moment to tackle", DifficultyLevel.Intermediate, GamePhase.OutOfPossession, 35, "4-4-2"),
            ("Aerial Duel", "Win an aerial duel", DifficultyLevel.Beginner, GamePhase.SetPiece, 60, "4-4-2"),
            ("Distribution From Back", "Play out from the back under pressure", DifficultyLevel.Intermediate, GamePhase.BuildUp, 10, "4-4-2"),
            ("Sweeper Keeper Positioning", "Position as sweeper keeper", DifficultyLevel.Advanced, GamePhase.BuildUp, 5, "4-4-2"),
            ("Build From Back", "Initiate attacks from defense", DifficultyLevel.Intermediate, GamePhase.BuildUp, 8, "4-4-2"),
        };
        foreach (var (name, desc, diff, phase, minute, form) in defenderDefs)
            scenarios.Add(new Scenario { Name = name, Description = desc, Category = ScenarioCategory.Defender, Difficulty = diff, GamePhase = phase, GameMinute = minute, Formation = form, Status = ScenarioState.Published, IsPublic = true, Version = 1, TrainingMode = TrainingMode.Practice });

        // Team scenarios
        var teamDefs = new[] {
            ("Build Up From Back", "Team build up play from the goalkeeper", DifficultyLevel.Intermediate, GamePhase.BuildUp, 10, "4-3-3"),
            ("Counter Attack Team", "Organized team counter attack", DifficultyLevel.Intermediate, GamePhase.AttackingTransition, 55, "4-3-3"),
            ("High Press Team", "Coordinate high pressing as a unit", DifficultyLevel.Advanced, GamePhase.OutOfPossession, 12, "4-3-3"),
            ("Low Block Defense", "Organized defensive low block", DifficultyLevel.Intermediate, GamePhase.OutOfPossession, 70, "4-5-1"),
            ("Mid Block Press", "Press in a mid-block formation", DifficultyLevel.Intermediate, GamePhase.OutOfPossession, 30, "4-4-2"),
            ("Defensive Transition", "Transition from attack to defense", DifficultyLevel.Advanced, GamePhase.DefensiveTransition, 45, "4-3-3"),
            ("Attacking Transition", "Transition from defense to attack", DifficultyLevel.Advanced, GamePhase.AttackingTransition, 40, "4-3-3"),
            ("Set Piece Defending", "Organize set piece defense", DifficultyLevel.Beginner, GamePhase.SetPiece, 80, "4-4-2"),
            ("Overload One Side", "Create overload on one side of the pitch", DifficultyLevel.Advanced, GamePhase.Possession, 50, "4-3-3"),
            ("Wing Play Combination", "Build attacks through wing combinations", DifficultyLevel.Intermediate, GamePhase.Attacking, 60, "4-3-3"),
        };
        foreach (var (name, desc, diff, phase, minute, form) in teamDefs)
            scenarios.Add(new Scenario { Name = name, Description = desc, Category = ScenarioCategory.Team, Difficulty = diff, GamePhase = phase, GameMinute = minute, Formation = form, Status = ScenarioState.Published, IsPublic = true, Version = 1, TrainingMode = TrainingMode.Practice });

        context.Scenarios.AddRange(scenarios);
        return Task.CompletedTask;
    }
}
