NODE_BIN := node
NPM_MOD_DIR := $(CURDIR)/node_modules
NPM_BIN := $(NPM_MOD_DIR)/.bin

SRC_DIR := $(CURDIR)/src
PLAIN_DIR := $(CURDIR)/__plain
PLAIN_SRC_DIR := $(PLAIN_DIR)/src
OBJ_DIR := $(CURDIR)/__obj
OBJ_SRC_DIR := $(OBJ_DIR)/src
DIST_DIR := $(CURDIR)/__dist
ARTIFACT_DIR := $(CURDIR)/web-ext-artifacts

ESLINT_TARGET_EXTENSION := js,jsx,cjs,mjs,ts,tsx
PRETTIER_TARGET := '$(SRC_DIR)/**/*.css'

USE_ESBUILD ?= 0

export RELEASE_CHANNEL ?= production

# ifeq ($(RELEASE_CHANNEL),production)
# endif

# Sorry. These are depends on *nix way...
export GIT_REVISION := $(shell git rev-parse --verify HEAD)
export BUILD_DATE := $(shell date '+%Y/%m/%d %H:%M:%S %z')

.PHONY: lint

all: help

help:
	@echo "Specify the task"
	@grep -E '^[0-9a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
	@exit 1


####################################
# Bootstrap
####################################


####################################
# Clean
####################################
clean: clean_dist clean_obj clean_plain clean_webext_artifacts ## Clean up all generated files.

clean_dist:
	$(NPM_BIN)/del $(DIST_DIR) --force

clean_obj:
	$(NPM_BIN)/del $(OBJ_DIR) --force

clean_plain:
	$(NPM_BIN)/del $(PLAIN_DIR) --force

clean_webext_artifacts:
	$(NPM_BIN)/del $(ARTIFACT_DIR)


####################################
# Build
####################################
.PHONY: build
build: lint typecheck build_package ## Build the artifact and run all lint (This is not for CI).

.PHONY: build_package
build_package: __webext_xpi ## Build the artifact.

__webext_xpi: clean_webext_artifacts \
     webextension
	$(NPM_BIN)/web-ext build -s $(DIST_DIR)

icon.png: clean_dist
	$(NPM_BIN)/cpx $(CURDIR)/$@ $(DIST_DIR) --preserve --verbose

webextension: webextension_cp webextension_js webextension_css

webextension_cp: clean_dist
	$(NPM_BIN)/cpx '$(SRC_DIR)/**/**.{json,html,svg}' $(DIST_DIR) --preserve --verbose

ifeq ($(USE_ESBUILD),1)
webextension_js: $(addprefix __bundle_js_esbuild_, background popup sidebar options)
else
webextension_js: $(addprefix __bundle_js_, background popup sidebar options)
endif

webextension_css: $(addprefix __bundle_css_, popup sidebar options)

__bundle_js_esbuild_%: clean_dist __obj __external_dependency
	RELEASE_CHANNEL=$(RELEASE_CHANNEL) \
	ENTRY_POINT=$(OBJ_SRC_DIR)/$*/index.js \
	OUTPUT_FILE=$(DIST_DIR)/$*/$*_bundled.js \
        $(NODE_BIN) $(CURDIR)/tools/run_esbuild.mjs

__bundle_js_%: clean_dist __obj __external_dependency
	RELEASE_CHANNEL=$(RELEASE_CHANNEL) $(NPM_BIN)/rollup $(OBJ_SRC_DIR)/$*/index.js --config $(CURDIR)/rollup.config.mjs --output.file $(DIST_DIR)/$*/$*_bundled.js

__bundle_css_%: clean_dist
	RELEASE_CHANNEL=$(RELEASE_CHANNEL) \
        ENTRY_POINT=$(SRC_DIR)/$*/registry.css \
        OUTPUT_FILE=$(DIST_DIR)/$*/$*.css \
        $(NODE_BIN) $(CURDIR)/tools/run_postcss.mjs

__external_dependency:

__obj: __plain clean_obj
	$(NPM_BIN)/babel $(PLAIN_DIR) --out-dir $(OBJ_DIR) --extensions=.js,.jsx --config-file $(CURDIR)/babel.config.mjs

__plain: $(addprefix __plain_, ts js)

__plain_js: clean_plain
	$(NPM_BIN)/cpx '$(SRC_DIR)/**/*.{js,jsx}' $(PLAIN_SRC_DIR) --preserve --verbose

__plain_ts: clean_plain
	$(NPM_BIN)/tsc -p $(CURDIR)/tsconfig.json --outDir $(PLAIN_SRC_DIR)


####################################
# Test
####################################
test: typecheck lint unittest ## Run all tests command (This is not for CI).

lint: eslint stylelint

eslint: ## Run ESLint
	$(NPM_BIN)/eslint --ext=$(ESLINT_TARGET_EXTENSION) $(CURDIR)

eslint_fix: ## Run ESLint with --fix option
	$(NPM_BIN)/eslint --ext=$(ESLINT_TARGET_EXTENSION) $(CURDIR) --fix

typecheck: ## Check static typing integrity
	$(NPM_BIN)/tsc -p $(CURDIR)/tsconfig.json --noEmit

stylelint: ## Run stylelint
	$(NPM_BIN)/stylelint '$(SRC_DIR)/**/*.css' \
		--config=$(CURDIR)/stylelint.config.cjs \
		-f verbose \
		--syntax css \
		--color

unittest: __obj ## Run unit tests
	$(MAKE) run_ava

run_ava: ## Only run unit tests
	$(NPM_BIN)/ava --config $(CURDIR)/ava.config.cjs

git_diff: ## Test whether there is no committed changes.
	git diff --exit-code


####################################
# Tools
####################################
format: format_css format_js ## Apply formetters for files.

format_css:
	$(NPM_BIN)/prettier --write $(PRETTIER_TARGET)

format_js:
	$(NPM_BIN)/eslint --ext=$(ESLINT_TARGET_EXTENSION) $(CURDIR) --fix

check_format: check_format_css

check_format_css:
	$(NPM_BIN)/prettier --check $(PRETTIER_TARGET)
