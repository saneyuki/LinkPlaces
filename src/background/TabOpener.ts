/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */
/*eslint-env webextensions */

import { expectNotNullAndUndefined } from 'option-t/esm/Maybe/expect';
import { expectNotUndefined } from 'option-t/esm/Undefinable/expect';

import { TabId } from '../../typings/webext/tabs';

import { NoImplementationError } from '../shared/NoImplementationError';
import {
    WHERE_TO_OPEN_ITEM_TO_TAB,
    WHERE_TO_OPEN_ITEM_TO_TABSHIFTED,
    WHERE_TO_OPEN_ITEM_TO_WINDOW,
    WHERE_TO_OPEN_ITEM_TO_CURRENT,
    WHERE_TO_OPEN_ITEM_TO_SAVE,
    WhereToOpenItem,
} from '../shared/RemoteAction';

export async function createTab(url: string, where: WhereToOpenItem): Promise<TabId> {
    switch (where) {
        case WHERE_TO_OPEN_ITEM_TO_CURRENT:
            return openItemInCurrentTab(url);
        case WHERE_TO_OPEN_ITEM_TO_SAVE:
            // https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/downloads/download
            throw new NoImplementationError('unimplemented!: where is `save`');
        case WHERE_TO_OPEN_ITEM_TO_WINDOW:
            return openItemInNewWindow(url);
        case WHERE_TO_OPEN_ITEM_TO_TAB:
            return openItemInNewTab(url, true);
        case WHERE_TO_OPEN_ITEM_TO_TABSHIFTED:
            return openItemInNewTab(url, false);
        default:
            throw new RangeError('unexpeced where type');
    }
}

async function getCurrentTabId(): Promise<TabId> {
    const tabList = await browser.tabs.query({
        active: true,
        lastFocusedWindow: true,
        windowType: 'normal',
    });
    if (tabList.length === 0) {
        throw new Error("assert!: don't get the current tab");
    }

    const currentTab = tabList[0];
    const currentId = expectNotNullAndUndefined(currentTab.id, 'currentId should not null');

    return currentId;
}

async function openItemInCurrentTab(url: string): Promise<TabId> {
    const currentTabId = await getCurrentTabId();
    await browser.tabs.update(currentTabId, {
        url,
    });

    return currentTabId;
}

async function openItemInNewWindow(url: string): Promise<TabId> {
    const lastFocused = await getLastFocusedWindow();

    const window = await browser.windows.create({
        url,
        focused: true,
        type: 'normal',
        state: 'normal',
        incognito: lastFocused.incognito,
    });
    const tabs = expectNotNullAndUndefined(window.tabs, 'window.tabs should not be null');
    const tab = expectNotUndefined(tabs[0], 'window.tabs[0] would be the current tab');
    const id = expectNotNullAndUndefined(tab.id, 'id should not null');
    return id;
}

async function openItemInNewTab(url: string, shouldActive: boolean): Promise<TabId> {
    const lastFocused = await getLastFocusedWindow();

    const option = {
        active: shouldActive,
        url,
        windowId: lastFocused.id,
    };

    const newTab = await browser.tabs.create(option);
    const id = expectNotNullAndUndefined(newTab.id, 'id should not null');

    return id;
}

/**
 *  @return {Promise}
 */
function getLastFocusedWindow() {
    const w = browser.windows.getLastFocused({
    });
    return w;
}
