import type { Locator, Page } from '@playwright/test';

export class ConfirmationDialog {
  readonly root: Locator;
  readonly heading: Locator;
  readonly confirmButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.root = page
      .locator('dialog[open]')
      .filter({ has: page.getByRole('heading', { name: 'Are you sure?' }) });
    this.heading = this.root.getByRole('heading', { name: 'Are you sure?' });
    this.confirmButton = this.root.getByRole('button', { name: 'Yes', exact: true });
    this.cancelButton = this.root.getByRole('button', { name: 'Cancel', exact: true });
  }
}
