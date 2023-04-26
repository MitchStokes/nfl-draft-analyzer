import { Constants } from './util/Constants';
import { MockDraft } from './models/MockDraft';
import { MockDraftPage } from './models/MockDraftPage';
import { MockDraftAggregator } from './models/MockDraftAggregator';
import { PickNumberOdds } from './models/odds/PickNumberOdds';
import { PickNumberAnalysis } from './models/analysis/PickNumberAnalysis';

async function main(): Promise<void> {
  const aggregator = new MockDraftAggregator();
  aggregator.aggregateFromJson('4-18-23_4-26-23');

  const pickNumberAnalysis = new PickNumberAnalysis(aggregator);
  pickNumberAnalysis.run();
}

main();
