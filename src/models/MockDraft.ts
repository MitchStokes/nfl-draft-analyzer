import axios from 'axios';
import { parse } from 'node-html-parser';
import { Constants } from '../util/Constants';

export class MockDraft {
  private data: string[] = [];

  constructor(
    public name: string,
    public year: number,
    public endpoint: string,
    public date: Date,
    data: string[] | null = null
  ) {
    if (data) this.data = data;
  }

  public getData(): string[] {
    return this.data;
  }

  // "Pretty prints" the MockDraft
  public pp(): void {
    console.log(`${this.name}: ${this.date}`);
    this.data.forEach((element, idx) => {
      console.log(`   ${idx + 1}: ${element}`);
    });
  }

  public async load(): Promise<void> {
    let url = Constants.buildUrl(this.endpoint, this.year);
    try {
      let response = await axios.get(url);
      this.data = this.parsePage(response.data);
    } catch (e) {
      console.log(`Error occurred requesting URL ${url}`);
      this.data = [];
    }
  }

  private parsePage(content: string): string[] {
    const list = parse(content).querySelector('.mock-list');
    if (list) {
      const playerNames: string[] = [];
      list.querySelectorAll('.mock-list-item').forEach((element) => {
        const playerName = element
          .querySelector('.player-name')
          ?.querySelector('a')?.innerText;
        if (playerName) playerNames.push(playerName);
      });
      return playerNames;
    }
    return [];
  }
}
