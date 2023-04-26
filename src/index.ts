import { Constants } from './util/Constants';
import { MockDraft } from './models/MockDraft';
import { MockDraftPage } from './models/web/MockDraftPage';
import { MockDraftPageAggregator } from './models/web/MockDraftAggregator';

async function main(): Promise<void> {
  let testAggregator = new MockDraftPageAggregator();
  testAggregator.aggregateFromJson('4-18-23_4-26-23');
}

main();
