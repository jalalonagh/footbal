namespace FootballTacticalTraining.Domain.Enums;

[Flags]
public enum OffBallMovementType
{
    RunInBehind,
    CheckTowardBall,
    CreateSpace,
    MoveAwayFromBall,
    BlindSideRun,
    DiagonalRun,
    NearPostRun,
    FarPostRun,
    BackPostRun,
    DropBetweenLines,
    AttackHalfSpace,
    StayWide,
    ChangeDirection,
    DecoyRun,
    ThirdManRun,
    Overlap,
    Underlap,
    Press,
    CounterPress,
    DefensiveRecovery
}
