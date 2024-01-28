🎉️ NEW: [Typesaurus X is out](https://blog.typesaurus.com/typesaurus-x-is-out/)!

# 🦕 Typesaurus

TypeScript-first ODM for Firestore.

_Looking for **React** adaptor?_ Check [Typesaurus React](https://github.com/kossnocorp/typesaurus-react)!

**Why?**

- Designed with TypeScript's type inference in mind
- Universal code (browser & Node.js)
- Uncompromised type-safety
- Code autocomplete
- Say goodbye to any!
- Say goodbye to exceptions!
- [Ready to start? Follow this guide](https://typesaurus.com/get-started/).

## Installation

The library is available as an [npm package](https://www.npmjs.com/package/typesaurus).
To install Typesaurus, run:

```sh
npm install --save typesaurus firebase firebase-admin
```

_Note that Typesaurus requires the `firebase` package to work in the web environment and `firebase-admin` to work in Node.js. These packages aren't listed as dependencies, so they won't install automatically with the Typesaurus package._

## Features

- **Complete type-safety**: uncompromised type-safety, includes Firestore quirks.
- **Universal package**: reuse the same code on the client and server.
- **JavaScript-native**: converts Firestore data types, i.e. timestamp, to native JS types, i.e. `Date`.
- **Build size-efficiency**: optimized build-size for web.
- **Typed ids**: all document ids are types, so you'll never mix up a user id with an account id.
- **Centralized schema**: easy to define, read and update.
- **Single-import principle**: single import to define, single import to use.

<!-- TODO: Do it one day
Want to read about features in detail? [Go to Key Features](https://typesaurus.com/about/features/). -->

## Changelog

See [the changelog](./CHANGELOG.md).

## License

[MIT © Sasha Koss](https://kossnocorp.mit-license.org/)
