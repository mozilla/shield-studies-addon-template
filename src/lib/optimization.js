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
    numSuggestionsDisplayed,
    rankSelected,
    bookmarkAndHistoryUrlSuggestions,
    bookmarkAndHistoryRankSelected,
    numCharsTyped,
    selectedStyle,
  ) {
    await browser.study.logger.debug([
      "FrecencyOptimizer.step entered",
      {
        numSuggestionsDisplayed,
        rankSelected,
        bookmarkAndHistoryUrlSuggestions,
        bookmarkAndHistoryRankSelected,
        numCharsTyped,
        selectedStyle,
      },
    ]);
    const frecencyScores = await urlsToFrecencies(
      bookmarkAndHistoryUrlSuggestions,
    );
    const loss = await svmLoss(
      bookmarkAndHistoryUrlSuggestions,
      bookmarkAndHistoryRankSelected,
    );
    const weights = await this.computeGradient(
      bookmarkAndHistoryUrlSuggestions,
      bookmarkAndHistoryRankSelected,
    );
    return this.synchronizer.pushModelUpdate({
      frecencyScores,
      loss,
      weights,
      numSuggestionsDisplayed,
      rankSelected,
      bookmarkAndHistoryNumSuggestionsDisplayed:
        bookmarkAndHistoryUrlSuggestions.length,
      bookmarkAndHistoryRankSelected,
      numCharsTyped,
      selectedStyle,
    });
  }

  async computeGradient(
    bookmarkAndHistoryUrlSuggestions,
    bookmarkAndHistoryRankSelected,
  ) {
    const gradient = [];

    for (const pref of PREFS) {
      const currentValue = await browser.experiments.prefs.getIntPref(pref);

      await browser.experiments.prefs.setIntPref(pref, currentValue - this.eps);
      const loss1 = await this.lossFn(
        bookmarkAndHistoryUrlSuggestions,
        bookmarkAndHistoryRankSelected,
      );

      await browser.experiments.prefs.setIntPref(pref, currentValue + this.eps);
      const loss2 = await this.lossFn(
        bookmarkAndHistoryUrlSuggestions,
        bookmarkAndHistoryRankSelected,
      );

      const finiteDifference = (loss1 - loss2) / (2 * this.eps);
      gradient.push(finiteDifference);

      await browser.experiments.prefs.setIntPref(pref, currentValue);
    }

    return gradient;
  }
}
