using System.Net;

namespace FootballTacticalTraining.Tests;

public class HealthCheckTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public HealthCheckTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetSwagger_ReturnsOk()
    {
        var response = await _client.GetAsync("/swagger/v1/swagger.json");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}

public class ScenarioApiTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public ScenarioApiTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetScenarios_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/scenarios");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}

public class CmsApiTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public CmsApiTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetArticles_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/articles");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetFaqs_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/faqs");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
