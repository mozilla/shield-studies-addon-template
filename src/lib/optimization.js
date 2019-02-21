/* global PREFS */
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "(svmLoss|FrecencyOptimizer)" }]*/

async function svmLoss(urls, correct) {
  const frecencies = await urlsToFrecencies(urls);
  const correctFrecency = frecencies[correct];

  let loss = 0;

  for (const frecency of frecencies) {
    if (frecency > correctFrecency) {
      loss += frecency - correctFrecency;
    }
  }

  return loss;
}

async function urlsToFrecencies(urls) {
  return Promise.all(
    urls.map(url => browser.experiments.frecency.calculateByURL(url)),
  );
}

class FrecencyOptimizer {
  constructor(synchronizer, lossFn, eps = 1) {
    this.synchronizer = synchronizer;
    this.lossFn = lossFn;
    this.eps = eps;
  }

  async step(
    numberOfSuggestions,
    selectedIndex,
    bookmarkOrHistoryUrlSuggestions,
    selectedBookmarkOrHistoryIndex,
    numTypedChars,
    selectedStyle,
  ) {
    await browser.study.logger.debug([
      "FrecencyOptimizer.step entered",
      {
        bookmarkOrHistoryUrlSuggestions,
        selectedBookmarkOrHistoryIndex,
        numTypedChars,
        selectedStyle,
      },
    ]);
    const gradient = await this.computeGradient(
      bookmarkOrHistoryUrlSuggestions,
      selectedBookmarkOrHistoryIndex,
    );
    const frecencies = await urlsToFrecencies(bookmarkOrHistoryUrlSuggestions);
    return this.synchronizer.pushModelUpdate({
      weights: gradient,
      loss: await svmLoss(
        bookmarkOrHistoryUrlSuggestions,
        selectedBookmarkOrHistoryIndex,
      ),
      numberOfSuggestions,
      selectedIndex,
      numBookmarkAndHistorySuggestionsDisplayed:
        bookmarkOrHistoryUrlSuggestions.length,
      selectedBookmarkOrHistoryIndex,
      selectedStyle,
      numTypedChars,
      frecencyScores: frecencies,
    });
  }

  async computeGradient(
    bookmarkOrHistoryUrlSuggestions,
    selectedBookmarkOrHistoryIndex,
  ) {
    const gradient = [];

    for (const pref of PREFS) {
      const currentValue = await browser.experiments.prefs.getIntPref(pref);

      await browser.experiments.prefs.setIntPref(pref, currentValue - this.eps);
      const loss1 = await this.lossFn(
        bookmarkOrHistoryUrlSuggestions,
        selectedBookmarkOrHistoryIndex,
      );

      await browser.experiments.prefs.setIntPref(pref, currentValue + this.eps);
      const loss2 = await this.lossFn(
        bookmarkOrHistoryUrlSuggestions,
        selectedBookmarkOrHistoryIndex,
      );

      const finiteDifference = (loss1 - loss2) / (2 * this.eps);
      gradient.push(finiteDifference);

      await browser.experiments.prefs.setIntPref(pref, currentValue);
    }

    return gradient;
  }
}
