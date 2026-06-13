export interface TextExtractor {
  extract(file: Express.Multer.File): Promise<string>;
}
