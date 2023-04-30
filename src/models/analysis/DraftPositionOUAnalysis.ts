import { OddsConversion } from '../../util/OddsConversion';
import { MockDraftAggregator } from '../MockDraftAggregator';
import { DraftPositionOUOdds } from '../odds/DraftPositionOUOdds';
import { BetAnalysis } from './BetAnalysis';

type PlayerSlots = {
  [key: string]: number[];
};

export class DraftPositionOUAnalysis {
  public odds: DraftPositionOUOdds;
  private playerSlots: PlayerSlots = {};

  constructor(public aggregator: MockDraftAggregator, year: number) {
    this.odds = new DraftPositionOUOdds(year);
  }

  public run(): BetAnalysis[] {
    this.generatePlayerSlots();
    let betAnalysis: BetAnalysis[] = [];
    this.odds.getOdds().forEach((offer, idx) => {
      // Common logic
      const playerName = offer.label;

      // Over logic
      let marketOdds = offer.overOdds as number;
      let marketImpliedOdds = OddsConversion.americanToImplied(marketOdds);
      let fairImpliedOdds = this.getRatioOfPlayerOverThresh(
        playerName,
        offer.thresh as number
      );
      let fairOdds = OddsConversion.impliedToAmerican(fairImpliedOdds);
      let ev =
        fairImpliedOdds -
        1 +
        fairImpliedOdds * ((1 - marketImpliedOdds) / marketImpliedOdds);

      let bet: BetAnalysis = {
        name: `${playerName} to be selected OVER ${offer.thresh}`,
        marketOdds,
        marketImpliedOdds,
        fairOdds,
        fairImpliedOdds,
        ev,
      };
      betAnalysis.push(bet);

      // Under logic
      marketOdds = offer.underOdds as number;
      marketImpliedOdds = OddsConversion.americanToImplied(marketOdds);
      fairImpliedOdds =
        1 - this.getRatioOfPlayerOverThresh(playerName, offer.thresh as number);
      fairOdds = OddsConversion.impliedToAmerican(fairImpliedOdds);
      ev =
        fairImpliedOdds -
        1 +
        fairImpliedOdds * ((1 - marketImpliedOdds) / marketImpliedOdds);

      bet = {
        name: `${playerName} to be selected UNDER ${offer.thresh}`,
        marketOdds,
        marketImpliedOdds,
        fairOdds,
        fairImpliedOdds,
        ev,
      };
      betAnalysis.push(bet);
    });

    return betAnalysis;
  }

  private generatePlayerSlots(): void {
    let longest = 0;
    this.aggregator.getMockDrafts().forEach((mockDraft) => {
      mockDraft.getData().forEach((playerName, idx) => {
        if (playerName in this.playerSlots) {
          this.playerSlots[playerName].push(idx + 1);
        } else {
          this.playerSlots[playerName] = [idx + 1];
        }
        longest = Math.max(this.playerSlots[playerName].length, longest);
      });
    });

    Object.keys(this.playerSlots).forEach((playerName) => {
      let curLength = this.playerSlots[playerName].length;
      let slotsNeeded = longest - curLength;
      for (let i = 1; i <= slotsNeeded; i++) {
        this.playerSlots[playerName].push(33);
      }
    });
  }

  private getRatioOfPlayerOverThresh(player: string, thresh: number) {
    let playerOddsObject = this.odds
      .getOdds()
      .find((cur) => cur.label == player);
    if (player in this.playerSlots) {
      let success = 0;
      let total = 0;
      this.playerSlots[player].forEach((value) => {
        total++;
        if (value > thresh) success++;
      });
      return success / total;
    }
    return 0;
  }
}
