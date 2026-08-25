using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace FootballTacticalTraining.Infrastructure.Data;

public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
        //optionsBuilder.UseSqlServer("Password=JalalOnagh@Hesam#8740;Persist Security Info=True;User ID=jalalonagh0819;Initial Catalog=footdb;Data Source=93.118.113.229;TrustServerCertificate=True");
        optionsBuilder.UseSqlServer("Server=localhost;Database=FootballTacticalTraining;Trusted_Connection=True;TrustServerCertificate=True");
        return new AppDbContext(optionsBuilder.Options);
    }
}
