import {
  DiceRoll,
  MagicDiceDto,
  MagicDiceRule,
  MagicDiceEffect,
  MAGIC_DICE_RULES,
  RULE_BY_TOTAL,
  EFFECT_BY_RULE,
} from 'shared';

export class MagicDice {
  private firstRoll: DiceRoll = { val: null, id: -1 };
  private secondRoll: DiceRoll = { val: null, id: -1 };
  private currentRoll: DiceRoll = { val: null, id: -1 };
  private rollCount: number = 0;
  private lastRoller: string | null = null;
  private rule: MagicDiceRule | null = null;
  private ruleLabel: string | null = null;
  private effect: MagicDiceEffect | null = null;
  private log: string | null = null;
  private expired: boolean = false;
  private rollId: number = 0;

  public canRoll(): boolean {
    return this.rollCount < 2 && !this.expired;
  }

  public isResolved(): boolean {
    return this.effect !== null;
  }

  public roll(username: string): DiceRoll | null {
    if (!this.canRoll()) return null;
    this.currentRoll = {
      id: this.rollId++,
      val: Math.floor(Math.random() * 6) + 1,
    };
    this.lastRoller = username;
    if (this.rollCount === 0) this.firstRoll = this.currentRoll;
    else this.secondRoll = this.currentRoll;
    this.rollCount++;
    if (this.rollCount === 2) this.resolve();
    return this.currentRoll;
  }

  private ruleByTotal(total: number): MagicDiceRule | null {
    for (const key of Object.keys(RULE_BY_TOTAL)) {
      if (Number(key) === total) {
        return RULE_BY_TOTAL[key] as MagicDiceRule;
      }
    }
    return null;
  }

  private effectByRule(rule: MagicDiceRule | null): MagicDiceEffect | null {
    for (const key of Object.keys(EFFECT_BY_RULE)) {
      if ((key as MagicDiceRule) === rule) {
        return EFFECT_BY_RULE[key] as MagicDiceEffect;
      }
    }
    return null;
  }

  private resolve(): void {
    const a: number = this.firstRoll.val ?? 0;
    const b: number = this.secondRoll.val ?? 0;
    const total = a + b;
    this.rule = this.ruleByTotal(total);
    this.effect = this.effectByRule(this.rule);
    if (!this.rule || !this.effect) {
      this.log =
        'The magic dice perceived an anomally, no rule was revealed...';
      return;
    }
    this.ruleLabel = `${MAGIC_DICE_RULES[this.rule]}`;
    if (this.effect.target === 'personal') {
      this.ruleLabel += ` for ${this.lastRoller}`;
    } else {
      this.ruleLabel += ' for everybody';
    }
    this.log = `${this.lastRoller} touched the dice last... May be blessed or cursed!`;
  }

  public expire(): void {
    if (this.isResolved()) return;
    this.expired = true;
    this.log =
      this.rollCount === 1
        ? 'The magic dice faded away unfinished, no rule was applied.'
        : 'Nobody dared touch the magic dice.';
  }

  public getRule(): MagicDiceRule | null {
    return this.rule;
  }

  public getLastRoller(): string | null {
    return this.lastRoller;
  }

  public getCurrentRoll(): DiceRoll {
    return this.currentRoll;
  }

  public getMagicEffect(): MagicDiceEffect | null {
    return this.effect;
  }

  public toDto(): MagicDiceDto {
    const isMalus = this.effect === null ? null : this.effect.sign === 'minus';
    const isPersonnal =
      this.effect === null ? null : this.effect.target === 'personal';
    return {
      firstRoll: this.firstRoll,
      secondRoll: this.secondRoll,
      currentRoll: this.currentRoll,
      rollCount: this.rollCount,
      lastRoller: this.lastRoller,
      rule: this.rule,
      ruleLabel: this.ruleLabel,
      isMalus,
      isPersonnal,
      log: this.log,
      canRoll: this.canRoll(),
      effect: this.effect,
    };
  }
}
