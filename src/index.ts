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
  console.log(runAnalysis('4-21-21_4-29-21', 2021, 32));
  // downloadMockDrafts(2021, '04/20/21', 32, '4-21-21_4-29-21', 1);
}

// Run a full analysis on the given params
function runAnalysis(
  mockDraftsFile: string,
  year: number,
  numPicks: number
): string {
  const aggregator = new MockDraftAggregator();
  aggregator.aggregateFromJson(year, mockDraftsFile, numPicks);

  let bets: BetAnalysis[] = [];

  const pickNumberAnalysis = new PickNumberAnalysis(aggregator, year);
  bets = bets.concat(pickNumberAnalysis.run());

  const draftPositionOUAnalysis = new DraftPositionOUAnalysis(aggregator, year);
  bets = bets.concat(draftPositionOUAnalysis.run());

  bets.sort((a, b) => b.ev - a.ev);
  let filteredBets = bets.filter((cur) => cur.ev >= 0.25);
  return getBetAmounts(filteredBets, 100);
}

// Change date and filename to match whatever parameters you're using
async function downloadMockDrafts(
  year: number,
  dateCutoff: string,
  pickQuantity: number,
  filename: string,
  initialPage?: number
): Promise<void> {
  const aggregator = new MockDraftAggregator();
  await aggregator.aggregateFromWeb(
    year,
    new Date(dateCutoff),
    pickQuantity,
    initialPage
  );
  aggregator.writeToJson(filename);
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
      bet.marketImpliedOdds,
      bet.fairOdds,
      bet.fairImpliedOdds,
      bet.ev,
      payoutProportions[idx],
    ];
    betAmountsAndPayouts.push(out);
  });

  let outString = '';
  betAmountsAndPayouts.forEach((line) => {
    outString += line.join(',') + '\n';
  });
  return outString;
}

main();
