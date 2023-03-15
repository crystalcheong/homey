import { expect, Page, test } from "@playwright/test";

import { listingTypes } from "#/constants";

test.describe("page: index", () => {
  test("render: hero content", async ({ page }) => {
    // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
    await page.goto("/");

    //CHECK: Expected static content
    const checkExpectedContent = async (
      currentPage: Page,
      testId: string | RegExp,
      expected: string | RegExp | Array<string | RegExp>
    ) => {
      const testElement = await currentPage.getByTestId(testId);
      await expect(testElement).toContainText(expected);
    };

    const expectedContent = new Map([
      ["hero-text-headline", "Find your dream home in Singapore"],
      [
        "hero-text-subHeading",
        "Search for properties, connect with agents, and get expert advice",
      ],
    ]);

    for (const [testId, content] of expectedContent) {
      await checkExpectedContent(page, testId, content);
    }

    //CHECK: Form inputs
    /// Click `Browse Properties` button
    const listingType = listingTypes[0];
    const browseBtn = await page.getByTestId(`hero-btn-browse-${listingType}`);
    await browseBtn.click({ force: true });
    await expect(page).toHaveURL(`/property/${listingType}`);
    await page.goto("/");
  });

  test("render: listings content", async ({ page }) => {
    // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
    await page.goto("/");

    for (const listingType of listingTypes) {
      const gridTitle = await page.getByTestId(
        `grid-text-title-${listingType}`
      );
      await expect(gridTitle).toHaveText(`${listingType} Listings`);
    }
  });
});
