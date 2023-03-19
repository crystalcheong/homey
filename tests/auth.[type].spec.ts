import { expect, Page, test } from "@playwright/test";

import { testAccount } from "#/constants";

test.describe(`page: auth/[type]`, () => {
  const fillSignUpForm = async (
    currentPage: Page,
    inputAccount: typeof testAccount
  ) => {
    // Fill in with test account details
    await currentPage.getByPlaceholder("Full name").click();
    await currentPage.getByPlaceholder("Full name").fill(inputAccount.name);
    await currentPage.getByRole("button", { name: "Next step" }).click();
    await currentPage.getByPlaceholder("Email").click();
    await currentPage.getByPlaceholder("Email").fill(inputAccount.email);
    await currentPage.getByPlaceholder("Password").click();
    await currentPage.getByPlaceholder("Password").fill(inputAccount.password);
    await currentPage.getByPlaceholder("Confirm Password").click();
    await currentPage
      .getByPlaceholder("Confirm Password")
      .fill(inputAccount.confirmPassword);
  };

  const fillSignInForm = async (
    currentPage: Page,
    inputAccount: typeof testAccount
  ) => {
    await currentPage.getByPlaceholder("Email").click();
    await currentPage.getByPlaceholder("Email").fill(inputAccount.email);
    await currentPage.getByPlaceholder("Password").fill(inputAccount.password);
    await currentPage
      .getByRole("button", { name: "Sign In", exact: true })
      .click();
  };

  test(`test/signUp: invalid account credentials`, async ({ page }) => {
    // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
    await page.goto(`/account/signUp`);

    const checkFailedStatus = async (
      currentPage: Page,
      inputAccount: typeof testAccount
    ) => {
      await fillSignUpForm(currentPage, inputAccount);

      // Click on Sign Up button
      await currentPage
        .getByRole("button", { name: "Sign Up", exact: true })
        .click();

      // TEST[Fail]: Account already exists
      await expect(
        currentPage.getByRole("alert", { name: "Sign Up Failed" })
      ).toBeVisible();
    };

    //TEST: Invalid password
    await checkFailedStatus(page, {
      ...testAccount,
      password: "wrongPassword",
      confirmPassword: "wrongPassword",
    });

    //TEST: Duplicate email
    await checkFailedStatus(page, testAccount);
  });

  test(`test/signIn: invalid account credentials`, async ({ page }) => {
    // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
    await page.goto(`/account/signIn`);

    const checkFailedStatus = async (
      currentPage: Page,
      inputAccount: typeof testAccount
    ) => {
      await fillSignInForm(currentPage, inputAccount);

      await expect(
        page.getByRole("alert", { name: "Sign In Failed" })
      ).toBeVisible();
    };

    // Test: Invalid password
    await checkFailedStatus(page, {
      ...testAccount,
      password: "wrongPassword",
    });

    // Test: Invalid email
    await checkFailedStatus(page, {
      ...testAccount,
      email: "test1@gmail.com",
    });
  });

  test(`test: valid sign in`, async ({ page }) => {
    // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
    await page.goto(`/account/signIn`);

    // Fill in with test account details
    await fillSignInForm(page, testAccount);

    // TEST[Success]: Account exists
    await expect(page).toHaveURL(`/`);
  });
});
