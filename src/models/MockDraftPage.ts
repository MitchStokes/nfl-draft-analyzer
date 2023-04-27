import axios from 'axios';
import { parse, HTMLElement } from 'node-html-parser';
import { MockDraft } from './MockDraft';

export class MockDraftPage {
  private data: MockDraft[] = [];

  constructor(public endpoint: string) {}

  public getMockDrafts(): MockDraft[] {
    return this.data;
  }

  public async load(): Promise<void> {
    let response = await axios.get(this.endpoint);
    this.data = this.parsePage(response.data);
  }

  public removeMockDraftsBeforeDate(thresholdDate: Date): void {
    if (this.data) {
      let newData: MockDraft[] = [];
      this.data.forEach((mockDraft) => {
        if (mockDraft.date > thresholdDate) newData.push(mockDraft);
      });
      this.data = newData;
    }
  }

  public removeMockDraftsBelowPickQuantity(pickQuantity: number) {
    if (this.data) {
      let newData: MockDraft[] = [];
      this.data.forEach((mockDraft) => {
        if (mockDraft.getData().length >= pickQuantity) newData.push(mockDraft);
      });
      this.data = newData;
    }
  }

  public async loadMockDrafts(): Promise<void> {
    if (!this.data) return;
    let promises: Promise<void>[] = [];
    this.data.forEach((mockDraft) => {
      promises.push(mockDraft.load());
    });
    await Promise.all(promises);
  }

  private parsePage(content: string): MockDraft[] {
    function parseListItem(head: HTMLElement): MockDraft | null {
      let name = head.querySelector('.site-link')?.innerText;
      let link = head.querySelector('.link-container')?.getAttribute('href');
      let siteTimestamp = head.querySelector('.site-timestamp')?.innerText;
      if (name && siteTimestamp && link) {
        let splitTimestamp = siteTimestamp.split('/');
        splitTimestamp[2] = `20${splitTimestamp[2]}`;
        let modifiedTimestamp = splitTimestamp.join('/');
        return new MockDraft(name, link, new Date(modifiedTimestamp));
      }
      return null;
    }

    const list = parse(content).querySelector('.mocks-list');
    if (list) {
      let out: MockDraft[] = [];
      list.querySelectorAll('li').forEach((listItem: HTMLElement) => {
        let parseResult = parseListItem(listItem);
        if (parseResult) out.push(parseResult);
      });
      return out;
    }
    return [];
  }
}
