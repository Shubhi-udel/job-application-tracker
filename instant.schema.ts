import { i } from '@instantdb/react';

const _schema = i.schema({
  entities: {
    $users: i.entity({
      email: i.string().unique().indexed(),
    }),
    applications: i.entity({
      companyName: i.string(),
      jobTitle: i.string(),
      applicationDate: i.date(),
      status: i.string(),
      createdAt: i.date().indexed(),
    }),
  },
  links: {
    applicationOwner: {
      forward: { on: 'applications', has: 'one', label: 'owner' },
      reverse: { on: '$users', has: 'many', label: 'applications' },
    },
  },
});

type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
