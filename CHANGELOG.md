# Change Log
All notable changes to this project will be documented in this file, following the suggestions of [Keep a CHANGELOG](http://keepachangelog.com/). This project adheres to [Semantic Versioning](http://semver.org/).


## [Unreleased]
### Changed
- don't set protocol in base url to allow https


## [v1.0.0] - 2016-08-15
### Changed
- use mmtf version 1.0 url


## [v0.3.0] - 2016-06-08
### Added
- support for mmtf version 0.2 (new decoding functions)
- encoding support (MMTF.encode)
- ncsOperatorList field
- es6 build
- MMTF.fetch & MMTF.fetchReduced helper methods
- bioAssemblyList[].name field

### Changed
- groupList[].atomCharge renamed to .formalCharge

### Removed
- support for mmtf version 0.1
- api docs from repository (now written to build/docs/api/)


## [v0.2.3] - 2016-05-19
### Added
- check left-alignment of chainIds & chainNames
- param argument for MMTF.traverse to traverse only the first model

### Changed
- traverse atoms before group-bonds in MMTF.traverse
- traverse inter-group bonds in order of models in MMTF.traverse
- fix chainIds & chainNames to be left-alignment in test data
- fixed MMTF.traverse not handling atomIdList being optional
- allow multiple values for --file and --url args in report.js script


## [v0.2.2] - 2016-04-26
### Added
- jsdoc api documentation

### Changed
- renamed second MMTF.traverse argument from `callbackDict` to `eventCallbacks`


## [v0.2.1] - 2016-04-25
### Changed
- fixed MMTF.version not included in distribution files


## [v0.2.0] - 2016-04-25
### Added
- MMTF namespace
- MMTF.decode convenience function that includes msgpack deserialization
- MMTF.traverse function to loop over the structure hierarchy
- script/report.js for basic reporting on a large number of structures
- MMTF.version

### Changed
- decoupled serialization from decoding, no more msgpack deserialization in `decodeMmtf`
- renamed mmtf-decode-helpers to mmtf-utils
- switched to UMD format for distribution files

### Removed
- MmtfIterator, use traversal function instead
- removed old examples


## v0.1.0 - 2016-04-13
### Added
- Initial release


[Unreleased]: https://github.com/rcsb/mmtf-javascript/compare/v1.0.0...HEAD
[v1.0.0]: https://github.com/rcsb/mmtf-javascript/compare/v0.3.0...v1.0.0
[v0.3.0]: https://github.com/rcsb/mmtf-javascript/compare/v0.2.3...v0.3.0
[v0.2.3]: https://github.com/rcsb/mmtf-javascript/compare/v0.2.2...v0.2.3
[v0.2.2]: https://github.com/rcsb/mmtf-javascript/compare/v0.2.1...v0.2.2
[v0.2.1]: https://github.com/rcsb/mmtf-javascript/compare/v0.2.0...v0.2.1
[v0.2.0]: https://github.com/rcsb/mmtf-javascript/compare/v0.1.0...v0.2.0