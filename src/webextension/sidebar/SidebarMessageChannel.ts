import { createChannelToBackground as create, Channel } from '../shared/Channel';
import { CONNECTION_PING_FROM_SIDEBAR } from '../shared/MessageValue';

export async function createChannel(): Promise<Channel> {
    return create(CONNECTION_PING_FROM_SIDEBAR);
}
