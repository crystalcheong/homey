import { expect, test } from "@playwright/test";

import { testAccount } from "#/constants";

test.describe(`page: auth/[type]`, () => {
  test(`render: auth/signUp form`, async ({ page }) => {
    // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
    await page.goto(`/account/signUp`);

    // Fill in with test account details
    await page.getByPlaceholder("Full name").click();
    await page.getByPlaceholder("Full name").fill(testAccount.name);
    await page.getByRole("button", { name: "Next step" }).click();
    await page.getByPlaceholder("Email").click();
    await page.getByPlaceholder("Email").fill(testAccount.email);
    await page.getByPlaceholder("Password").click();
    await page.getByPlaceholder("Password").fill(testAccount.password);
    await page.getByPlaceholder("Confirm Password").click();
    await page.getByPlaceholder("Confirm Password").fill(testAccount.password);

    // Click on Sign Up button
    await page.getByRole("button", { name: "Sign Up", exact: true }).click();

    // TEST[Fail]: Account already exists
    await expect(
      page.getByRole("alert", { name: "Sign Up Failed" })
    ).toBeVisible();

    // TEST[Success]: Account is created
    // await expect(page).toHaveURL(`/`);
  });

  test(`render: auth/signIn form`, async ({ page }) => {
    // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
    await page.goto(`/account/signIn`);

    // Fill in with test account details
    await page.getByPlaceholder("Email").click();
    await page.getByPlaceholder("Email").fill("test@gmail.com");
    await page.getByPlaceholder("Password").fill("test");
    await page.getByRole("button", { name: "Sign In", exact: true }).click();

    // TEST[Success]: Account exists
    await expect(page).toHaveURL(`/`);
  });
});
