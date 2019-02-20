/* global ExtensionAPI */

"use strict";

this.frecency = class extends ExtensionAPI {
  getAPI() {
    const { PlacesUtils } = ChromeUtils.import(
      "resource://gre/modules/PlacesUtils.jsm",
    );

    const CHUNK_SIZE = 1000;

    async function removeFrecencyTrigger() {
      return PlacesUtils.withConnectionWrapper("federated-learning", async db =>
        db.execute(
          "DROP TRIGGER IF EXISTS moz_places_afterupdate_frecency_trigger",
        ),
      );
    }

    async function restoreFrecencyTrigger() {
      // Query from https://dxr.mozilla.org/mozilla-central/source/toolkit/components/places/nsPlacesTriggers.h#176
      return PlacesUtils.withConnectionWrapper("federated-learning", async db =>
        db.execute(`
CREATE TEMP TRIGGER moz_places_afterupdate_frecency_trigger AFTER UPDATE OF frecency ON moz_places FOR EACH ROW WHEN NOT is_frecency_decaying() BEGIN INSERT INTO moz_updateoriginsupdate_temp (prefix, host, frecency_delta) VALUES (get_prefix(NEW.url), get_host_and_port(NEW.url), MAX(NEW.frecency, 0) - MAX(OLD.frecency, 0)) ON CONFLICT(prefix, host) DO UPDATE SET frecency_delta = frecency_delta + EXCLUDED.frecency_delta; END
    `),
      );
    }

    async function getMozPlacesCount() {
      const res = await PlacesUtils.withConnectionWrapper(
        "federated-learning",
        async db => db.execute("SELECT COUNT(*) as count FROM moz_places"),
      );
      return res[0].getResultByName("count");
    }

    return {
      experiments: {
        frecency: {
          async calculateByURL(url) {
            const res = await PlacesUtils.withConnectionWrapper(
              "federated-learning",
              async db =>
                db.execute(
                  "SELECT CALCULATE_FRECENCY(id) as frecency FROM moz_places WHERE url_hash = hash(?)",
                  [url],
                ),
            );
            if (res.length >= 1) {
              return res[0].getResultByName("frecency");
            }
            return -1;
          },

          async updateAllFrecencies() {
            await removeFrecencyTrigger();

            let count = await getMozPlacesCount();

            for (let i = 0; i < count; i += CHUNK_SIZE) {
              await PlacesUtils.withConnectionWrapper(
                "frecency-update",
                async db =>
                  db.execute(
                    `UPDATE moz_places SET frecency = CALCULATE_FRECENCY(id) WHERE id in (
                SELECT id FROM moz_places ORDER BY id LIMIT ? OFFSET ?
              )`,
                    [CHUNK_SIZE, i],
                  ),
              );

              // In the last iteration we want to check if new rows were added
              if (i + CHUNK_SIZE >= count) {
                count = await getMozPlacesCount();
              }
            }

            return restoreFrecencyTrigger();
          },
        },
      },
    };
  }
};
