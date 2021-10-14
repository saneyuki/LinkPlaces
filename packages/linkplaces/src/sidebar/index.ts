import { BookmarkSvc } from '@linkplaces/foundation';
import { landViewContext } from '@linkplaces/foundation/__dist/view_ctx/mod';

import { SidebarContext } from './SidebarContext';
import { createChannel } from './SidebarMessageChannel';

const getUnfiledBoolmarkFolder = BookmarkSvc.getUnfiledBoolmarkFolder;

(async function main() {
    const [list, channel] = await Promise.all([
        getUnfiledBoolmarkFolder(),
        createChannel(),
    ]);

    window.addEventListener('contextmenu', disableCtxMenu);

    window.addEventListener('pagehide', function onClose(_event) {
        window.removeEventListener('contextmenu', disableCtxMenu);
        channel.destroy();
    }, {
        once: true,
    });

    const ctx = new SidebarContext(list, channel);
    await landViewContext(ctx);
})().catch(console.error);

function disableCtxMenu(event: MouseEvent) {
    if (event.shiftKey) {
        // allow to open debugger if the shiftkey is down.
        return;
    }

    event.preventDefault();
}
