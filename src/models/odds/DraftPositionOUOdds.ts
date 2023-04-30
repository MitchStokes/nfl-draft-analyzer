import { Constants } from '../../util/Constants';
import { FileInput } from '../FileInput';

type Offer = {
  label: string;
  thresh?: number;
  overOdds?: number;
  underOdds?: number;
  outcomes: Outcome[];
};

type Outcome = {
  label: string;
  oddsAmerican: number | string;
};

export class DraftPositionOUOdds {
  private odds: Offer[] = [];

  constructor(year: number) {
    const fileReader = new FileInput(`res/odds/${year}/draftPositionOU.json`);
    const content = fileReader.read();
    let parsed = JSON.parse(content);
    let offers =
      parsed.eventGroup.offerCategories[0].offerSubcategoryDescriptors[1]
        .offerSubcategory.offers[0];
    offers.forEach((offer: Offer) => {
      const label = offer.label.split(' - ')[1];
      let thresh = 0;
      let outcomes: Outcome[] = [];
      offer.outcomes.forEach((outcome: Outcome) => {
        thresh = parseFloat(outcome.label.split(' ')[1]);
        outcomes.push({
          label: outcome.label.split(' ')[0],
          oddsAmerican: parseInt(outcome.oddsAmerican as string),
        });
      });
      if (outcomes[0].label.includes('Over')) {
        this.odds.push({
          label,
          thresh,
          overOdds: outcomes[0].oddsAmerican as number,
          underOdds: outcomes[1].oddsAmerican as number,
          outcomes,
        });
      }
    });
  }

  public getOdds(): Offer[] {
    return this.odds;
  }
}
