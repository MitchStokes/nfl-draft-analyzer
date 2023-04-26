import puppeteer, { Page } from 'puppeteer';

export class PuppeteerController {
  private locked = true;
  private page: Page | undefined;

  constructor() {}

  public async init(): Promise<void> {
    const browser = await puppeteer.launch();
    this.page = await browser.newPage();
    this.locked = false;
  }

  public async getPageContent(url: string): Promise<string> {
    if (this.page && !this.locked) {
      this.locked = true;
      await this.page.goto(url);
      await this.page.waitForSelector('.mock-list-item');
      return await this.page.content();
    }
    return '';
  }
}
