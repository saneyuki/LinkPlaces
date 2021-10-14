import {
    WhereToOpenItem,
    WHERE_TO_OPEN_ITEM_TO_TAB,
    openItem as openItemViaChannel,
    openWebExtSidebar as openWebExtSidebarDirect,
} from '@linkplaces/ipc_message';

import type { PopupPlainReduxStore } from './PopupMainStore';
import type { RemoteActionChannel } from './PopupMessageChannel';


export class PopupMainEpic {
    private _channel: RemoteActionChannel;

    constructor(channel: RemoteActionChannel, _store: PopupPlainReduxStore) {
        this._channel = channel;
    }

    async openItem(id: string, url: string): Promise<void> {
        const where: WhereToOpenItem = WHERE_TO_OPEN_ITEM_TO_TAB;
        openItemViaChannel(this._channel, id, url, where);
        return closeWindow();
    }

    async openWebExtSidebar(): Promise<void> {
        openWebExtSidebarDirect(browser.sidebarAction);
        return closeWindow();
    }
}

async function closeWindow(): Promise<void> {
    await sleepWithTimeout(0);
    window.close();
}

function sleepWithTimeout(millisec: number): Promise<void> {
    const p = new Promise<void>((resolve) => window.setTimeout(resolve, millisec));
    return p;
}
