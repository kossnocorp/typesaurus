# Changelog

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning].
This change log follows the format documented in [Keep a CHANGELOG].

[semantic versioning]: http://semver.org/
[keep a changelog]: http://keepachangelog.com/

## Unreleased

### Changed

- **BREAKING**: Rework the `subcollection` function to support nested subcollections. [#18](https://github.com/kossnocorp/typesaurus/pull/18)

- **BREAKING**: Rework the `transaction` function. Now it accepts two functions as arguments. The first function allows only reading, and another allows only writing. It will make it impossible to perform reads after writes, which would throw an exception as it's a Firebase limitation. [#16](https://github.com/kossnocorp/typesaurus/pull/16)

- Define the `transaction` function result type. [#16](https://github.com/kossnocorp/typesaurus/pull/16)

- Remove `@google-cloud/firestore`, `firebase`, and `firebase-admin` from the peer dependencies to get rid of unavoidable warnings when Typesaurus is used only in the web or Node.js environment. [#17](https://github.com/kossnocorp/typesaurus/pull/19)

## 4.1.0 - 2020-01-01

### Added

- Add `Batch` type that defines the object returned from the `batch` function.

## 4.0.1 - 2019-12-20

### Fixed

- Make `serverDate` value to actually call Firebase's `serverTimestamp` instead of passing current date.

## 4.0.0 - 2019-12-14

### Fixed

- Fix `array-contains` filter support in `where`.

### Changed

- **BREAKING**: `untypedWhereArrayContains` was removed in favor of native support of `array-contains` filter in `where`.

- **BREAKING**: Update Firebase dependencies to the latest versions:
  - `@google-cloud/firestore`: `>=2.6.0`
  - `firebase`: `>=7.5.0`
  - `firebase-admin`: `>=8.8.0`

### Added

- Added `in` and `array-contains-any` filters support to `where`. Read more about these filters in [the Firebase announcement](https://firebase.googleblog.com/2019/11/cloud-firestore-now-supports-in-queries.html).

## 3.0.0 - 2019-11-11

### Changed

- **BREAKING**: Remove deprecated `clear` that was renamed to `remove`.

- **BREAKING**: Return `null` instead of `undefined` when a document isn't found.

## 2.1.0 - 2019-11-05

### Changed

- Loose up peer dependency requirements. See [#5](https://github.com/kossnocorp/typesaurus/issues/5) for the reasoning.

### Added

- [Add `getMany` function](https://github.com/kossnocorp/typesaurus/pull/10). Kudos to [@thomastoye](https://github.com/thomastoye)!

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
