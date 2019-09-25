# Changelog

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning].
This change log follows the format documented in [Keep a CHANGELOG].

[semantic versioning]: http://semver.org/
[keep a changelog]: http://keepachangelog.com/

## 2.0.0 - 2019-09-25

### Changed

- **BREAKING**: Move Firebase packages to the peer dependencies to prevent npm from installing two or more firebase-admin versions which cause obscure errors like "The default Firebase app does not exist".

## 1.2.0 - 2019-09-02

### Changed

- Now `ref` generates an id when one isn't passed.

## 1.1.0 - 2019-08-17

### Changed

- Rename `clear` to `remove` everywhere keeping `clear` as an alias which will be removed in the next major version.

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
