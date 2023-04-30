export class Constants {
  public static BASE_URL = 'https://www.nflmockdraftdatabase.com/mock-drafts/';
  public static buildUrl(body: string, year?: number) {
    if (year) {
      return this.BASE_URL + year + body;
    }
    return this.BASE_URL + body;
  }
}
