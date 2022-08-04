.DEFAULT_GOAL := build
.PHONY: build

BIN = $(shell yarn bin)

test:
	npx firebase emulators:exec --only firestore "npx jest --env node"
.PHONY: test

test-watch:
	npx firebase emulators:exec --only firestore "npx jest --env node --watch"

test-setup:
	npx firebase setup:emulators:firestore

test-system: test-system-node test-system-browser

test-system-node:
	npx jest --env node

test-system-node-watch:
	npx jest --env node --watch

test-system-browser:
	npx karma start --single-run

test-system-browser-watch:
	npx karma start

build:
	@rm -rf lib
	@npx tsc --project tsconfig.lib.json
	@npx prettier "lib/**/*.[jt]s" --write --loglevel silent
	@cp package.json lib
	@cp *.md lib
	@rsync --archive --prune-empty-dirs --exclude '*.ts' --relative src/./ lib
	@npx tsc --project tsconfig.lib.json --outDir lib/esm --module es2020 --target es2019
	@cp src/adapter/package.esm.json lib/esm/adapter/package.json

publish: build
	cd lib && npm publish --access public

publish-next: build
	cd lib && npm publish --access public --tag next

docs:
	@npx typedoc --theme minimal --name Typesaurus
.PHONY: docs