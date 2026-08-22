namespace FootballTacticalTraining.Domain.Enums;

[Flags]
public enum TacticalActionType
{
    MOVE_FORWARD,
    MOVE_BACK,
    MOVE_LEFT,
    MOVE_RIGHT,
    RUN_IN_BEHIND,
    CHECK_TO_BALL,
    CREATE_SPACE,
    HOLD_POSITION,
    ATTACK_NEAR_POST,
    ATTACK_FAR_POST,
    DROP_DEEP,
    PRESS,
    COUNTER_PRESS,
    STAY_WIDE,
    CUT_INSIDE,
    DRIBBLE,
    PASS,
    THROUGH_PASS,
    SHOOT,
    CROSS,
    CUT_BACK,
    HOLD_POSSESSION
}
