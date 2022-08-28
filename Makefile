.DEFAULT_GOAL := build
.PHONY: build

BIN = $(shell yarn bin)

test: test-node test-browser
.PHONY: test

test-setup:
	npx firebase setup:emulators:firestore

test-node:
	npx firebase emulators:exec --only firestore "npx jest --env node"

test-node-watch:
	npx firebase emulators:exec --only firestore "npx jest --env node --watch"

test-browser:
	npx firebase emulators:exec --only firestore "npx karma start --single-run"

test-browser-watch:
	npx firebase emulators:exec --only firestore "npx karma start"

test-system: test-system-node test-system-browser

test-system-node:
	env GOOGLE_APPLICATION_CREDENTIALS=${CURDIR}/secrets/key.json npx jest --env node

test-system-node-watch:
	npx jest --env node --watch

test-system-browser:
	npx karma start --single-run

test-system-browser-watch:
	npx karma start

build:
	@rm -rf lib
	@env BABEL_ENV=esm npx babel src --config-file ./babel.config.lib.js --source-root src --out-dir lib --extensions .mjs,.ts --out-file-extension .mjs --quiet
	@env BABEL_ENV=cjs npx babel src --config-file ./babel.config.lib.js --source-root src --out-dir lib --extensions .mjs,.ts --out-file-extension .js --quiet
	@npx tsc -p tsconfig.lib.json
# @env npx babel src --config-file ./babel.config.lib.js --source-root src --out-dir lib --extensions .mjs,.ts,.js --out-file-extension .js --ignore "src/**/tests.ts" --ignore "src/tests/**/*" --ignore "src/**/tysts.ts" --ignore "src/**/*.d.ts" --quiet
# @npx prettier "lib/**/*.[jt]s" --write --loglevel silent
# @cp package.json lib
# @cp *.md lib
# @rsync --archive --prune-empty-dirs --exclude '*.ts' --relative src/./ lib
# @npx tsc --project tsconfig.lib.json --outDir lib/esm --module es2020 --target es2019
# @cp src/adapter/package.esm.json lib/esm/adapter/package.json
	@rsync --archive --prune-empty-dirs --include='*.d.ts' --include='*.json' -f 'hide,! */' --relative src/./ lib
	@cp package.json lib

publish: build
	cd lib && npm publish --access public

publish-next: build
	cd lib && npm publish --access public --tag next

docs:
	@npx typedoc --theme minimal --name Typesaurus
.PHONY: docs