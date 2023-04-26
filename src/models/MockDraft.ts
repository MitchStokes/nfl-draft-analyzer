import axios from 'axios';
import { parse } from 'node-html-parser';

export class MockDraft {
  private data: string[] = [];

  constructor(public endpoint: string) {}

  public getData(): string[] {
    return this.data;
  }

  // "Pretty prints" (pp) the data in a nicer format
  public ppData(): void {
    this.data.forEach((element, idx) => {
      console.log(`${idx}: ${element}`);
    });
  }

  public async load(): Promise<void> {
    let response = await axios.get(this.endpoint);
    this.data = this.parsePage(response.data);
  }

  private parsePage(content: string): string[] {
    const list = parse(content).querySelector('.mock-list');
    if (list) {
      const playerNames: string[] = [];
      list.querySelectorAll('.mock-list-item').forEach((element) => {
        const playerName =
          element.querySelector('.player-name')?.childNodes[0].innerText;
        if (playerName) playerNames.push(playerName);
      });
      return playerNames;
    }
    return [];
  }
}
