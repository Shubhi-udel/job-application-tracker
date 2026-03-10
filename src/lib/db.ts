import { init } from '@instantdb/react';
import schema from '../../instant.schema';

const APP_ID = 'ece4f71e-3213-4f6e-a41e-cc7ce4f9fbde';

export const db = init({
  appId: APP_ID,
  schema,
});
