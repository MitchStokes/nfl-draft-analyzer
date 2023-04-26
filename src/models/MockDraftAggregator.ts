import { Constants } from '../../util/Constants';
import { FileInput } from '../io/FileInput';
import { FileOutput } from '../io/FileOutput';
import { MockDraft } from './MockDraft';
import { MockDraftPage } from './MockDraftPage';

type JSONMockDraft = {
  name: string;
  endpoint: string;
  date: string;
  data: string[];
};

export class MockDraftPageAggregator {
  private mockDrafts: MockDraft[] = [];

  constructor() {}

  public getMockDrafts(): MockDraft[] {
    return this.mockDrafts;
  }

  public async aggregateFromWeb(thresholdDate: Date): Promise<void> {
    let pageCounter = 1;
    let shouldContinue = true;

    while (shouldContinue) {
      console.log(`Checking page ${pageCounter}...`);
      let curPage = new MockDraftPage(
        Constants.buildUrl(`/page/${pageCounter}`)
      );
      await curPage.load();

      let lenBeforeRemovals = curPage.getMockDrafts().length;
      curPage.removeMockDraftsBeforeDate(thresholdDate);
      let lenAfterRemovals = curPage.getMockDrafts().length;
      console.log(`${lenAfterRemovals} mock drafts found after threshold date`);

      await curPage.loadMockDrafts();
      this.mockDrafts = this.mockDrafts.concat(curPage.getMockDrafts());
      pageCounter++;
      if (lenBeforeRemovals != lenAfterRemovals) {
        shouldContinue = false;
      }
    }
  }

  public aggregateFromJson(fileName: string): void {
    let fullPath = `out/${fileName}.json`;
    let reader = new FileInput(fullPath);
    let content = reader.read();
    JSON.parse(content).forEach((mockDraft: JSONMockDraft) => {
      this.mockDrafts.push(
        new MockDraft(
          mockDraft.name,
          mockDraft.endpoint,
          new Date(mockDraft.date),
          mockDraft.data
        )
      );
    });
  }

  public pp(): void {
    this.mockDrafts.forEach((mockDraft) => {
      mockDraft.pp();
    });
  }

  public writeToJson(fileName: string) {
    let fullPath = `out/${fileName}.json`;
    let writer = new FileOutput(fullPath);
    writer.write(JSON.stringify(this.mockDrafts));
  }
}
