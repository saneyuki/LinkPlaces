import type { Nullable } from 'option-t/Nullable/Nullable';

import type { TowerService } from '../traits.js';
import type { Packet } from './Packet.js';

export interface PacketCreationService<TRequestBody, out TResponse>
    extends TowerService<[req: Packet<TRequestBody>], Nullable<Packet<TResponse>>> {}
