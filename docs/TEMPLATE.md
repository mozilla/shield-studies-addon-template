# Using this study add-on template

(Remove this file after you have cloned/merged the template to your own study add-on repo.)

Thinking about building a Study Add-on? Please read [the docs on Pref-Flip and Add-On Experiments](https://mana.mozilla.org/wiki/display/FIREFOX/Pref-Flip+and+Add-On+Experiments) first.

## Aims

The aim is to bring together tools and services we've used on other [Shield and Pioneer Add-on Experiments](https://mana.mozilla.org/wiki/display/FIREFOX/Pref-Flip+and+Add-On+Experiments) into a template/example repository, so that new projects can come
along and get infrastructure together, and be up and running with code, test suites, coverage etc quickly.

Using this template will get you these things:

* [Shield Utils](https://github.com/mozilla/shield-studies-addon-utils/) integration and example usage
* Functional tests
* Unit tests
* Continuous integration testing against Dev Edition and Nightly (via Circle CI)
* [Example web extension experiment implementing custom ui using privileged code](./src/privileged/introductionNotificationBar/)
* Linting
* Partial code coverage (specific files)

Bonus:

* Consistent package.json (fixpack) and package-lock.json
* Addon-linter

## Documentation

It is intended that all parts of this repository have at least outline
documentation. If you find any parts that are missing, please file an issue or
create a PR.

## Using this template

1. Fork this repository, rename it to reflect your study. Make the repo end with `-shield-study`
2. Make this README reflect your study (including removing all of this `About This Repository` section whilst keeping `Seeing the add-on in action` and below)
3. Remove irrelevant example code
4. Build your study add-on and make the docs reflect your study
5. File issues/PRs against https://github.com/mozilla/shield-studies-addon-template/ when you come across things to improve in the template

For more information on engineering study add-ons, see <https://github.com/mozilla/shield-studies-addon-utils/> (especially <https://github.com/mozilla/shield-studies-addon-utils/blob/master/docs/engineering.md>).

### Retrofitting an existing study add-on to use the template

First, move all existing files in your study add-on repository into a new folder and commit those changes. Then:

    git clone https://github.com/mozilla/shield-studies-addon-template /tmp/shield-studies-addon-template
    git remote add shield-studies-addon-template /tmp/shield-studies-addon-template
    git fetch shield-studies-addon-template
    git merge --allow-unrelated-histories shield-studies-addon-template/master
    git remote remove shield-studies-addon-template

After this, move back the files into the template structure as necessary. For an example of this, see [this](https://github.com/mozilla/federated-learning-v2-study-addon/commit/7367aa8d3f6d29f675ff3f36a1136c6b09476ace).
