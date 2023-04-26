import fs from 'fs';

export class FileOutput {
  constructor(public path: string) {}

  public write(content: string): void {
    fs.writeFileSync(this.path, content);
  }
}
