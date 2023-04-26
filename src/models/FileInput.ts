import fs from 'fs';

export class FileInput {
  constructor(public path: string) {}

  public read(): string {
    return fs.readFileSync(this.path, 'utf-8');
  }
}
