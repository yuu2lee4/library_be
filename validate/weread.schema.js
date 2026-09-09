import { z } from 'zod';

export const wereadGatewayBody = z.record(z.string(), z.unknown());