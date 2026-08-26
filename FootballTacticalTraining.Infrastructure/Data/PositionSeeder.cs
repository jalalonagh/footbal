using FootballTacticalTraining.Domain.Entities;
using FootballTacticalTraining.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FootballTacticalTraining.Infrastructure.Data;

public static class PositionSeeder
{
    public static async Task SeedPositionsAsync(AppDbContext context)
    {
        if (await context.Positions.AnyAsync())
        {
            Console.WriteLine("Positions already exist. Skipping seed.");
            return;
        }

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
        await context.SaveChangesAsync();
        Console.WriteLine($"Seeded {positions.Count} positions.");
    }
}
