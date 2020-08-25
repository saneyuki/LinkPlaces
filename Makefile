NODE_BIN := node
NPM_MOD_DIR := $(CURDIR)/node_modules
NPM_BIN := $(NPM_MOD_DIR)/.bin

SRC_DIR := $(CURDIR)/src
OBJ_DIR := $(CURDIR)/__obj
OBJ_SRC_DIR := $(OBJ_DIR)/src
DIST_DIR := $(CURDIR)/__dist
ARTIFACT_DIR := $(CURDIR)/web-ext-artifacts

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


# clean
clean: clean_dist clean_obj clean_webext_artifacts ## Clean up all generated files.

clean_dist:
	$(NPM_BIN)/del $(DIST_DIR) --force

clean_obj:
	$(NPM_BIN)/del $(OBJ_DIR) --force

clean_webext_artifacts:
	$(NPM_BIN)/del $(ARTIFACT_DIR)


# build
build: ## Build the artifact.
	$(MAKE) __webext_xpi -C $(CURDIR)

__webext_xpi: clean_webext_artifacts \
     lint \
     webextension
	$(NPM_BIN)/web-ext build -s $(DIST_DIR)

icon.png: clean_dist
	$(NPM_BIN)/cpx $(CURDIR)/$@ $(DIST_DIR) --preserve

webextension: webextension_cp webextension_js webextension_css

webextension_cp: clean_dist
	$(NPM_BIN)/cpx '$(SRC_DIR)/**/**.{json,html,svg}' $(DIST_DIR) --preserve

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
	$(NPM_BIN)/postcss $(SRC_DIR)/$*/registry.css --config --output $(DIST_DIR)/$*/$*.css

__external_dependency: \
	__external_dependency_react \
	__external_dependency_react_dom \
	__external_dependency_redux_thunk \
	__external_dependency_rxjs

__external_dependency_react: clean_dist
	$(NPM_BIN)/cpx '$(NPM_MOD_DIR)/react/umd/react.production.min.js' $(DIST_DIR)/third_party --preserve
__external_dependency_react_dom: clean_dist
	$(NPM_BIN)/cpx '$(NPM_MOD_DIR)/react-dom/umd/react-dom.production.min.js' $(DIST_DIR)/third_party --preserve
__external_dependency_redux_thunk: clean_dist
#	$(NPM_BIN)/cpx '$(NPM_MOD_DIR)/redux-thunk/dist/redux-thunk.js' $(DIST_DIR)/third_party --preserve
__external_dependency_rxjs: clean_dist
	$(NPM_BIN)/cpx '$(NPM_MOD_DIR)/rxjs/bundles/rxjs.umd.min.js' $(DIST_DIR)/third_party --preserve

__obj: $(addprefix __obj_, ts js)

__obj_js: clean_obj
	$(NPM_BIN)/cpx '$(SRC_DIR)/**/*.{js,jsx}' $(OBJ_SRC_DIR) --preserve

__obj_ts: clean_obj
	$(NPM_BIN)/tsc -p $(CURDIR)/tsconfig.json --outDir $(OBJ_SRC_DIR)


# Test
test: lint ava

lint: eslint stylelint tscheck

eslint:
	$(NPM_BIN)/eslint --ext=js,jsx,cjs,mjs,ts,tsx $(CURDIR)

tscheck:
	$(NPM_BIN)/tsc -p $(CURDIR)/tsconfig.json --noEmit

stylelint:
	$(NPM_BIN)/stylelint '$(SRC_DIR)/**/*.css' \
		--config=$(CURDIR)/stylelint.config.js \
		-f verbose \
		--syntax css \
		--color

ava: __obj
	$(MAKE) run_ava

run_ava:
	$(NPM_BIN)/ava --config $(CURDIR)/ava.config.cjs

git_diff: ## Test whether there is no committed changes.
	git diff --exit-code


# Tools
fmt: fmt_css fmt_js ## Apply formetters for files.

fmt_css:
	$(NPM_BIN)/prettier --write '$(SRC_DIR)/**/*.css'

fmt_js:
	$(NPM_BIN)/eslint --ext=js,jsx,mjs,ts,tsx $(CURDIR) --fix

check_fmt: check_fmt_css

check_fmt_css:
	$(NPM_BIN)/prettier --check '$(SRC_DIR)/**/*.css'
