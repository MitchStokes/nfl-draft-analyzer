import axios from 'axios';
import { parse, HTMLElement } from 'node-html-parser';

export interface MockDraftPageItem {
  endpoint: string;
  date: Date;
}

export class MockDraftPage {
  private data: MockDraftPageItem[] = [];

  constructor(public endpoint: string) {}

  public getData(): MockDraftPageItem[] {
    return this.data;
  }

  public async load(): Promise<void> {
    let response = await axios.get(this.endpoint);
    this.data = this.parsePage(response.data);
  }

  private parsePage(content: string): MockDraftPageItem[] {
    function parseListItem(head: HTMLElement): MockDraftPageItem | null {
      let link = head.querySelector('.link-container')?.getAttribute('href');
      let siteTimestamp = head.querySelector('.site-timestamp')?.innerText;
      if (siteTimestamp && link) {
        let splitTimestamp = siteTimestamp.split('/');
        splitTimestamp[2] = `20${splitTimestamp[2]}`;
        let modifiedTimestamp = splitTimestamp.join('/');
        return {
          endpoint: link,
          date: new Date(modifiedTimestamp),
        };
      }
      return null;
    }

    const list = parse(content).querySelector('.mocks-list');
    if (list) {
      let out: MockDraftPageItem[] = [];
      list.querySelectorAll('li').forEach((listItem: HTMLElement) => {
        let parseResult = parseListItem(listItem);
        if (parseResult) out.push(parseResult);
      });
      return out;
    }
    return [];
  }
}
