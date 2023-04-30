import { Constants } from '../../util/Constants';
import { FileInput } from '../FileInput';

type Offer = {
  outcomes: Outcome[];
};

type Outcome = {
  label: string;
  oddsAmerican: number | string;
};

export class PickNumberOdds {
  private odds: Offer[] = [];

  constructor(year: number) {
    const fileReader = new FileInput(`res/odds/${year}/pickNumber.json`);
    const content = fileReader.read();
    let parsed = JSON.parse(content);
    let offers =
      parsed.eventGroup.offerCategories[0].offerSubcategoryDescriptors[0]
        .offerSubcategory.offers[0];
    offers.forEach((offer: Offer) => {
      let outcomes: Outcome[] = [];
      offer.outcomes.forEach((outcome: Outcome) => {
        outcomes.push({
          label: outcome.label,
          oddsAmerican: parseInt(outcome.oddsAmerican as string),
        });
      });
      this.odds.push({ outcomes });
    });
  }

  public getOdds(): Offer[] {
    return this.odds;
  }
}
