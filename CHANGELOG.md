# Change Log
All notable changes to this project will be documented in this file, following the suggestions of [Keep a CHANGELOG](http://keepachangelog.com/). This project adheres to [Semantic Versioning](http://semver.org/).


## [Unreleased]
### Added
- traverse atoms before group-bonds in `MMTF.traverse`
- WIP: short circuit structure traversal by return false from event callbacks


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


[Unreleased]: https://github.com/rcsb/mmtf-javascript/compare/v0.2.2...HEAD
[v0.2.2]: https://github.com/rcsb/mmtf-javascript/compare/v0.2.1...v0.2.2
[v0.2.1]: https://github.com/rcsb/mmtf-javascript/compare/v0.2.0...v0.2.1
[v0.2.0]: https://github.com/rcsb/mmtf-javascript/compare/v0.1.0...v0.2.0