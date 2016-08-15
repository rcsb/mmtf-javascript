
Making a Release
================

Follow semantic versioning and make sure the changelog is up-to-date.

Change the version number in:
- package.json
- README.md
- CHANGELOG.md
- src/mmtf.js
- docs/api-overview.md

Make sure the distribution files are up-to-date.

Build the API documentation (`gulp doc`) and push to gh-pages under `docs/api/VERSION`.

Push to github. Make a release on github, tag the commit and copy the relevant info from the changelog file.
