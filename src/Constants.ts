export class Constants {
  public static BASE_URL = 'https://www.nflmockdraftdatabase.com';
  public static buildUrl(body: string) {
    return this.BASE_URL + body;
  }
}
