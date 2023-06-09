import { Constants } from '../util/Constants';
import { FileInput } from './FileInput';
import { FileOutput } from './FileOutput';
import { MockDraft } from './MockDraft';
import { MockDraftPage } from './MockDraftPage';

type JSONMockDraft = {
  name: string;
  endpoint: string;
  date: string;
  data: string[];
};

export class MockDraftAggregator {
  private mockDrafts: MockDraft[] = [];

  constructor() {}

  public getMockDrafts(): MockDraft[] {
    return this.mockDrafts;
  }

  public async aggregateFromWeb(
    year: number,
    thresholdDate: Date,
    pickQuantityNeeded: number,
    initialPage?: number
  ): Promise<void> {
    function sleep(ms: number) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    let pageCounter = initialPage || 1;
    let shouldContinue = true;

    while (shouldContinue) {
      console.log(`Checking page ${pageCounter}...`);
      let curPage = new MockDraftPage(
        year,
        Constants.buildUrl(`/page/${pageCounter}`, year)
      );
      await curPage.load();

      let lenBeforeRemovals = curPage.getMockDrafts().length;
      curPage.removeMockDraftsBeforeDate(thresholdDate);
      let lenAfterRemovals = curPage.getMockDrafts().length;
      console.log(
        `${lenAfterRemovals} mock drafts from after threshold date found on this page`
      );

      await curPage.loadMockDrafts();

      let lenBeforeRemovals2 = curPage.getMockDrafts().length;
      curPage.removeMockDraftsBelowPickQuantity(pickQuantityNeeded);
      let lenAfterRemovals2 = curPage.getMockDrafts().length;
      console.log(
        `${
          lenBeforeRemovals2 - lenAfterRemovals2
        } pick-deficient mock drafts ignored`
      );

      this.mockDrafts = this.mockDrafts.concat(curPage.getMockDrafts());
      pageCounter++;
      if (lenBeforeRemovals != lenAfterRemovals) {
        shouldContinue = false;
      }

      if (shouldContinue) {
        const delay = 30;
        console.log(`Waiting ${delay} seconds to avoid rate limit`);
        await sleep(delay * 1000);
      }
    }
  }

  public aggregateFromJson(
    year: number,
    fileName: string,
    pickQuantityNeeded: number
  ): void {
    let fullPath = `out/${fileName}.json`;
    let reader = new FileInput(fullPath);
    let content = reader.read();
    JSON.parse(content).forEach((mockDraft: JSONMockDraft) => {
      let mockDraftToAdd = new MockDraft(
        mockDraft.name,
        year,
        mockDraft.endpoint,
        new Date(mockDraft.date),
        mockDraft.data
      );
      if (mockDraftToAdd.getData().length >= pickQuantityNeeded) {
        this.mockDrafts.push(mockDraftToAdd);
      } else {
        console.log(
          `Pick-deficient mock draft found, not including in dataset`
        );
      }
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
    console.log(
      `Wrote ${this.mockDrafts.length} mock drafts to JSON file ${fullPath}`
    );
  }
}
