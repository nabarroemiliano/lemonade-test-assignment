import type { Page } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  protected async goto(path: string): Promise<void> {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  url(): string {
    return this.page.url();
  }

  async documentTitle(): Promise<string> {
    return this.page.title();
  }

  /** Waits for the page to be ready to drive. Never asserts. */
  abstract verifyLoaded(): Promise<void>;
}
