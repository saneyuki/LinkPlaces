// https://searchfox.org/mozilla-central/source/dom/webidl/ExtensionPort.webidl

import type { ExtensionEventManager } from './ExtensionEventManager';

export interface ExtensionPort {
    readonly name: string;
    readonly sender: object;
    readonly error?: object;

    disconnect(): void;
    postMessage<T>(message: T): void;

    readonly onDisconnect: ExtensionEventManager;
    readonly onMessage: ExtensionEventManager;
}

export interface ExtensionPortDescriptor {
    portId: string;
    name: string;
}
