import type { ViewContext } from '@linkplaces/foundation';
import { expectNotNull } from 'option-t/esm/Nullable/expect';

import { createOptionsView } from './OptionsView';

function getUrl(path: string): { url: string; title: string; } {
    const url = browser.runtime.getURL(path);
    return {
        url,
        title: path,
    };
}

export class OptionsContext implements ViewContext {
    constructor() {
    }

    destroy(): void {
    }

    async onActivate(mountpoint: Element): Promise<void> {
        const list = [
            getUrl('popup/index.html'),
            getUrl('sidebar/index.html'),
            getUrl('options/index.html'),
        ];

        const view = createOptionsView({
            list,
        });

        mountpoint.appendChild(view);
    }

    async onDestroy(mountpoint: Element): Promise<void> {
        while (mountpoint.firstChild) {
            const lastChild = expectNotNull(mountpoint.lastChild, '.lastChild should be exist');
            mountpoint.removeChild(lastChild);
        }
    }

    async onResume(mountpoint: Element): Promise<void> {
        return this.onActivate(mountpoint);
    }

    async onSuspend(mountpoint: Element): Promise<void> {
        return this.onDestroy(mountpoint);
    }
}
