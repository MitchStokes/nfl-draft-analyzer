import { Constants } from './util/Constants';
import { MockDraft } from './models/MockDraft';
import { MockDraftPage } from './models/MockDraftPage';
import { MockDraftAggregator } from './models/MockDraftAggregator';
import { PickNumberOdds } from './models/odds/PickNumberOdds';
import { PickNumberAnalysis } from './models/analysis/PickNumberAnalysis';
import { DraftPositionOUOdds } from './models/odds/DraftPositionOUOdds';
import { DraftPositionOUAnalysis } from './models/analysis/DraftPositionOUAnalysis';
import { BetAnalysis } from './models/analysis/BetAnalysis';

async function main(): Promise<void> {
  const aggregator = new MockDraftAggregator();
  aggregator.aggregateFromJson('4-12-23_4-26-23', 31);

  let bets: BetAnalysis[] = [];

  const pickNumberAnalysis = new PickNumberAnalysis(aggregator);
  bets = bets.concat(pickNumberAnalysis.run());

  const draftPositionOUAnalysis = new DraftPositionOUAnalysis(aggregator);
  bets = bets.concat(draftPositionOUAnalysis.run());

  bets.sort((a, b) => b.ev - a.ev);
  let filteredBets = bets.filter((cur) => cur.ev >= 0.25);
  getBetAmounts(filteredBets, 100);
}

// Change date and filename to match whatever parameters you're using
async function downloadMockDrafts(): Promise<void> {
  const aggregator = new MockDraftAggregator();
  await aggregator.aggregateFromWeb(new Date('04/11/23'), 31);
  aggregator.writeToJson('4-12-23_4-26-23');
}

/*
  Dirty disgusting helper function that I hate but I'm tired
  The gist is that it calculates the bet amounts such that the ratio
  between a bet's total payout (including initial bet amount) and the
  total payout of ALL the bets combined equals the ratio between the bet's
  EV and the total EV of all the bets (summed together equally).
*/
function getBetAmounts(filteredBets: BetAnalysis[], totalBetAmount: number) {
  let totalEv = filteredBets.reduce((prev: number, cur) => prev + cur.ev, 0);
  let payoutProportions: number[] = [];
  filteredBets.forEach((bet) => {
    payoutProportions.push(bet.ev / totalEv);
  });
  let relativeBetAmounts: number[] = [];
  filteredBets.forEach((bet, idx) => {
    relativeBetAmounts.push(payoutProportions[idx] * bet.marketImpliedOdds);
  });
  let totalRelativeBetAmounts = relativeBetAmounts.reduce(
    (prev: number, cur: number) => prev + cur,
    0
  );
  let betProportions: number[] = [];
  relativeBetAmounts.forEach((elem: number) => {
    betProportions.push(elem / totalRelativeBetAmounts);
  });
  let betAmounts: number[] = [];
  betProportions.forEach((betProportion: number) => {
    betAmounts.push(betProportion * totalBetAmount);
  });

  let betAmountsAndPayouts: any[] = [];
  filteredBets.forEach((bet, idx) => {
    let out = [
      bet.name,
      betAmounts[idx],
      betAmounts[idx] / bet.marketImpliedOdds,
      bet.marketOdds,
      bet.ev,
      payoutProportions[idx],
    ];
    betAmountsAndPayouts.push(out);
  });

  betAmountsAndPayouts.forEach((line) => {
    console.log(line.join(','));
  });
}

main();
