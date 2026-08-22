namespace FootballTacticalTraining.Domain.Enums;

[Flags]
public enum OnBallMovementType
{
    Dribble,
    CarryBall,
    Sprint,
    SlowDown,
    ChangeDirection,
    CutInside,
    AttackSpace,
    ShieldBall,
    Pass,
    ThroughPass,
    Cross,
    CutBack,
    Shoot,
    HoldPossession,
    SwitchPlay,
    OneTwo
}
