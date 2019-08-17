# Changelog

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning].
This change log follows the format documented in [Keep a CHANGELOG].

[semantic versioning]: http://semver.org/
[keep a changelog]: http://keepachangelog.com/

## 1.1.0 - 2019-08-15

### Changed

- Rename `clear` to `remove` keeping `clear` as an alias which will be removed in the next major version.

### Added

- Export `field` from the package root

- Added support for `value` (i.e. `value('increment', 1)`) in the field paths.

- Add support for merge set that use the current document values as defaults:

  ```ts
  await set(user.ref, { name: 'Sasha', date: new Date(1987, 1, 11) })
  await set(user.ref, { name: 'Sasha' }, { merge: true })
  await get(user.ref)
  //=> { data: { name: 'Sasha', date: new Date(1987, 1, 11) }, ... }
  ```

## 1.0.0 - 2019-08-13

First public release.
