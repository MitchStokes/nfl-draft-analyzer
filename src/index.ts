import { MockDraft } from './models/MockDraft';
import { PuppeteerController } from './util/PuppeteerController';

async function main(): Promise<void> {
  let puppeteer = new PuppeteerController();
  await puppeteer.init();
  let content = await puppeteer.getPageContent(
    'https://www.nflmockdraftdatabase.com/mock-drafts/2023/tankathon-2023?date=2023-04-25'
  );
  console.log(content);
}

main();
