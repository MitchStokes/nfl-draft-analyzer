import { Constants } from './Constants';
import { MockDraft } from './models/MockDraft';
import { MockDraftPage } from './models/MockDraftPage';

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
  console.log(test.getData());
  console.log(test.getData().length);
}

main();
