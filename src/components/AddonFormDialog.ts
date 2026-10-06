import type { Locator, Page } from '@playwright/test';

export class AddonFormDialog {
  readonly root: Locator;
  readonly firstNameField: Locator;
  readonly lastNameField: Locator;
  readonly emailField: Locator;
  readonly submitButton: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.root = page.locator('dialog[open]');
    this.firstNameField = this.root.getByLabel('First name');
    this.lastNameField = this.root.getByLabel('Last name');
    this.emailField = this.root.getByLabel('Email (optional)');
    this.submitButton = this.root.locator('.item-action');
    this.closeButton = this.root.getByRole('button', { name: 'close dialog' });
  }
}
