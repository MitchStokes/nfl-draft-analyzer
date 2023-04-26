import { Constants } from './util/Constants';
import { MockDraft } from './models/web/MockDraft';
import { MockDraftPage } from './models/web/MockDraftPage';

async function main(): Promise<void> {
  /* let test = new MockDraft(
    Constants.buildUrl(
      '/mock-drafts/2023/heavy-2023-matt-lombardo?date=2023-04-26'
    )
  );
  await test.load();
  console.log(test.getData());
  test.ppData(); */
  let test = new MockDraftPage(Constants.buildUrl('/page/1'));
  await test.load();
  await test.loadChildren();
  test.getData().forEach((mockDraft) => {
    mockDraft.pp();
  });
}

main();
