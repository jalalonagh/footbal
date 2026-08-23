using FootballTacticalTraining.Application.Interfaces;
using FootballTacticalTraining.Domain.Entities;
using FootballTacticalTraining.Domain.Enums;
using FootballTacticalTraining.Infrastructure.Services;
using Moq;

namespace FootballTacticalTraining.Tests;

public class ScenarioPlayerServiceTests
{
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly Mock<IRepository<ScenarioPlayer>> _repoMock = new();
    private readonly ScenarioPlayerService _service;

    public ScenarioPlayerServiceTests()
    {
        _unitOfWorkMock.Setup(u => u.Repository<ScenarioPlayer>()).Returns(_repoMock.Object);
        _service = new ScenarioPlayerService(_unitOfWorkMock.Object);
    }

    [Fact]
    public async Task GetByScenarioAsync_ReturnsPlayers()
    {
        var scenarioId = Guid.NewGuid();
        var players = new List<ScenarioPlayer>
        {
            new() { Id = Guid.NewGuid(), ScenarioId = scenarioId, Number = 1, Position = FootballPosition.GK, TeamId = 1 },
            new() { Id = Guid.NewGuid(), ScenarioId = scenarioId, Number = 2, Position = FootballPosition.CB, TeamId = 1 }
        };
        _repoMock.Setup(r => r.FindAsync(It.IsAny<System.Linq.Expressions.Expression<Func<ScenarioPlayer, bool>>>()))
            .ReturnsAsync(players);

        var result = await _service.GetByScenarioAsync(scenarioId);

        Assert.Equal(2, result.Count);
    }

    [Fact]
    public async Task CreateAsync_AddsAndReturnsPlayer()
    {
        var player = new ScenarioPlayer { Number = 10, Position = FootballPosition.CAM, TeamId = 1 };

        var result = await _service.CreateAsync(player);

        _repoMock.Verify(r => r.AddAsync(player), Times.Once);
        Assert.Equal(10, result.Number);
    }

    [Fact]
    public async Task DeleteAsync_ExistingPlayer_Deletes()
    {
        var id = Guid.NewGuid();
        var player = new ScenarioPlayer { Id = id };
        _repoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(player);

        await _service.DeleteAsync(id);

        _repoMock.Verify(r => r.DeleteAsync(player), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_NonExisting_DoesNothing()
    {
        _repoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((ScenarioPlayer?)null);

        await _service.DeleteAsync(Guid.NewGuid());

        _repoMock.Verify(r => r.DeleteAsync(It.IsAny<ScenarioPlayer>()), Times.Never);
    }
}

public class ScenarioSolutionServiceTests
{
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly Mock<IRepository<ScenarioSolution>> _repoMock = new();
    private readonly ScenarioSolutionService _service;

    public ScenarioSolutionServiceTests()
    {
        _unitOfWorkMock.Setup(u => u.Repository<ScenarioSolution>()).Returns(_repoMock.Object);
        _service = new ScenarioSolutionService(_unitOfWorkMock.Object);
    }

    [Fact]
    public async Task CreateAsync_AddsAndReturns()
    {
        var solution = new ScenarioSolution { Name = "Primary", Score = 85 };

        var result = await _service.CreateAsync(solution);

        _repoMock.Verify(r => r.AddAsync(solution), Times.Once);
        Assert.Equal("Primary", result.Name);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsSolution()
    {
        var id = Guid.NewGuid();
        var solution = new ScenarioSolution { Id = id, Name = "Test" };
        _repoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(solution);

        var result = await _service.GetByIdAsync(id);

        Assert.Equal("Test", result!.Name);
    }

    [Fact]
    public async Task DeleteAsync_Existing_Deletes()
    {
        var id = Guid.NewGuid();
        var solution = new ScenarioSolution { Id = id };
        _repoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(solution);

        await _service.DeleteAsync(id);

        _repoMock.Verify(r => r.DeleteAsync(solution), Times.Once);
    }
}

public class ScenarioRuleServiceTests
{
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly Mock<IRepository<ScenarioRule>> _repoMock = new();
    private readonly ScenarioRuleService _service;

    public ScenarioRuleServiceTests()
    {
        _unitOfWorkMock.Setup(u => u.Repository<ScenarioRule>()).Returns(_repoMock.Object);
        _service = new ScenarioRuleService(_unitOfWorkMock.Object);
    }

    [Fact]
    public async Task CreateAsync_AddsAndReturns()
    {
        var rule = new ScenarioRule { ConditionJson = "{}", ActionJson = "{}", Priority = 1 };

        var result = await _service.CreateAsync(rule);

        _repoMock.Verify(r => r.AddAsync(rule), Times.Once);
        Assert.Equal(1, result.Priority);
    }

    [Fact]
    public async Task GetByScenarioAsync_ReturnsRules()
    {
        var scenarioId = Guid.NewGuid();
        var rules = new List<ScenarioRule>
        {
            new() { Id = Guid.NewGuid(), ScenarioId = scenarioId, Priority = 1 }
        };
        _repoMock.Setup(r => r.FindAsync(It.IsAny<System.Linq.Expressions.Expression<Func<ScenarioRule, bool>>>()))
            .ReturnsAsync(rules);

        var result = await _service.GetByScenarioAsync(scenarioId);

        Assert.Single(result);
    }

    [Fact]
    public async Task UpdateAsync_UpdatesAndReturns()
    {
        var rule = new ScenarioRule { Id = Guid.NewGuid(), Priority = 5 };

        var result = await _service.UpdateAsync(rule);

        _repoMock.Verify(r => r.UpdateAsync(rule), Times.Once);
        Assert.Equal(5, result.Priority);
    }
}
