export class OddsConversion {
  public static americanToImplied(american: number) {
    if (american > 0) {
      return 100 / (american + 100);
    }
    return -american / (100 - american);
  }

  public static impliedToAmerican(implied: number) {
    if (implied == 0) {
      return 100000000;
    }
    let american = (1 / implied - 1) * 100;
    if (american < 100) {
      return (-100 * 100) / american;
    }
    return american;
  }
}
