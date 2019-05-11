export interface LandBattleState {
    readonly attacker: IParticipantState;
    readonly defender: IParticipantState;
    readonly terrain: string;
    readonly day: number;
}

interface IParticipantState {
    readonly frontline: IUnitState[];
    readonly backline: IUnitState[];
    readonly strategos: number;
    readonly general: number;
    readonly discipline: number;

}

interface IUnitState {
    readonly type: string;
    readonly morale: number;
    readonly max_morale: number;
    readonly manpower: number;
    readonly discipline: number;
    readonly is_loyal: boolean;
}