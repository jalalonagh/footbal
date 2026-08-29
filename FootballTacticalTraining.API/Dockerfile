FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["FootballTacticalTraining.API/FootballTacticalTraining.API.csproj", "FootballTacticalTraining.API/"]
COPY ["FootballTacticalTraining.Application/FootballTacticalTraining.Application.csproj", "FootballTacticalTraining.Application/"]
COPY ["FootballTacticalTraining.Domain/FootballTacticalTraining.Domain.csproj", "FootballTacticalTraining.Domain/"]
COPY ["FootballTacticalTraining.Infrastructure/FootballTacticalTraining.Infrastructure.csproj", "FootballTacticalTraining.Infrastructure/"]
RUN dotnet restore "FootballTacticalTraining.API/FootballTacticalTraining.API.csproj"
COPY . .
WORKDIR "/src/FootballTacticalTraining.API"
RUN dotnet build -c Release -o /app/build
FROM build AS publish
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "FootballTacticalTraining.API.dll"]
