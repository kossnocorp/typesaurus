# Contributing

## Code style

Please use [Prettier](https://prettier.io/) to format the code.

## Tests

### Unit tests

Before running unit tests for the first time, you need to download the Firestore emulator by running the command:

```bash
make test-setup
```

To run the tests:

```bash
# Run tests once
make test

# Run tests in the watch mode
make test-watch
```

### System tests

As Typesaurus itself, its tests work both in browser and Node.js. Typesaurus system tests connect to a real database, so to run them, you need to prepare a Firebase project and point the suite to the project. See [How to set up tests?](#how-to-set-up-system-tests) for more details.

#### How to run system tests?

To run the tests:

```bash
# Run tests both in Node.js and browser:
make test-system

# Run only Node.js tests:
make test-system-node

# Run Node.js tests in the watch mode:
make test-system-node-watch

# Run only browser tests:
make test-system-browser

# Run browser tests in the watch mode:
make test-system-browser-watch
```

#### How to set up system tests?

1. First of all, [create a Firebase project](https://console.firebase.google.com/) and [enable Firestore](https://console.firebase.google.com/project/_/storage).

2. To be able to run Node.js tests, you need to [generate service key](https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk) and save it to `secrets/key.json`.

3. For browser tests, you'll need to set the project ID and web API key to `FIREBASE_PROJECT_ID` and `FIREBASE_API_KEY` respectively.

4. You also might want to create a user with a password (set email to `FIREBASE_USERNAME` and password to `FIREBASE_PASSWORD`) and set your rules to allow writes and reads only to this user:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth.uid == "xxx";
    }
  }
}
```

However, this step is optional and should not be a concern unless you make your web API key public.
