import { createOk, Result } from 'option-t/esm/PlainResult';
import { NoImplementationError } from '../foundation/NoImplementationError';
import type { TowerService } from '../foundation/tower_like_ipc/traits';
import { createBookmarkItem, getLinkSchemeType, removeBookmarkItem } from '../shared/Bookmark';
import { MSG_TYPE_OPEN_URL, MSG_TYPE_REGISTER_URL, RemoteAction, WhereToOpenItem } from '../shared/RemoteAction';

import { createTab } from './TabOpener';

export class BackgroundRemoteActionReciever implements TowerService<RemoteAction, void> {
    async ready(): Promise<Result<void, Error>> {
        return createOk(undefined);
    }

    async call(msg: RemoteAction): Promise<void> {
        switch (msg.type) {
            case MSG_TYPE_OPEN_URL: {
                const { id, url, where } = msg.value;
                await openUrlFromPopup(url, id, where);
                return;
            }
            case MSG_TYPE_REGISTER_URL: {
                const { url, title } = msg.value;
                await createBookmarkItem(url, title);
                return;
            }
            default:
                throw new RangeError(`undefined type: ${JSON.stringify(msg)}`);
        }
    }
}

async function openUrlFromPopup(url: string, bookmarkId: string, where: WhereToOpenItem): Promise<void> {
    await openUrl(url, where);
    await removeBookmarkItem(bookmarkId);
}

async function openUrl(url: string, where: WhereToOpenItem): Promise<number> {
    const { isPrivileged } = getLinkSchemeType(url);
    if (isPrivileged) {
        const e = new NoImplementationError('opening a privileged url');
        throw e;
    }

    const opened = createTab(url, where);
    return opened;
}
