import { OddsConversion } from '../../util/OddsConversion';
import { MockDraftAggregator } from '../MockDraftAggregator';
import { PickNumberOdds } from '../odds/PickNumberOdds';

type PickSlot = {
  [key: string]: number;
  total: number;
};

type BetAnalysis = {
  name: string;
  marketOdds: number;
  marketImpliedOdds: number;
  fairOdds: number;
  fairImpliedOdds: number;
  ev: number;
};

export class PickNumberAnalysis {
  public odds: PickNumberOdds;
  private pickSlots: PickSlot[] = [];

  constructor(public aggregator: MockDraftAggregator) {
    this.odds = new PickNumberOdds();
  }

  public run(): void {
    this.generatePickSlots();

    let betAnalysis: BetAnalysis[] = [];
    this.odds.getOdds().forEach((offer, idx) => {
      offer.outcomes.forEach((outcome) => {
        const playerName = outcome.label;
        const marketOdds = outcome.oddsAmerican as number;
        const marketImpliedOdds = OddsConversion.americanToImplied(marketOdds);
        const fairImpliedOdds = this.getRatioOfPlayerInPickSlot(
          playerName,
          this.pickSlots[idx]
        );
        const fairOdds = OddsConversion.impliedToAmerican(fairImpliedOdds);
        const ev =
          fairImpliedOdds -
          1 +
          fairImpliedOdds * ((1 - marketImpliedOdds) / marketImpliedOdds);

        const bet: BetAnalysis = {
          name: `${playerName} to be selected ${idx + 1} overall`,
          marketOdds,
          marketImpliedOdds,
          fairOdds,
          fairImpliedOdds,
          ev,
        };
        betAnalysis.push(bet);
      });
    });

    betAnalysis.sort((a, b) => b.ev - a.ev);
    console.log(betAnalysis);
  }

  private generatePickSlots(): void {
    for (let i = 1; i <= 10; i++) {
      this.pickSlots.push({ total: 0 });
    }
    this.aggregator.getMockDrafts().forEach((mockDraft) => {
      const data = mockDraft.getData();
      for (let i = 0; i < Math.min(10, data.length); i++) {
        const curSlot = this.pickSlots[i];
        curSlot.total += 1;
        curSlot[data[i]] = (curSlot[data[i]] || 0) + 1;
      }
    });
  }

  private getRatioOfPlayerInPickSlot(
    player: string,
    pickSlot: PickSlot
  ): number {
    return (pickSlot[player] || 0) / pickSlot.total;
  }
}
