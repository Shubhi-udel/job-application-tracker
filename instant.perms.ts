import type { InstantRules } from '@instantdb/react';

const rules = {
  $users: {
    allow: {
      view: 'auth.id == data.id',
      create: 'false',
      delete: 'false',
      update: 'false',
    },
  },
  applications: {
    allow: {
      view: "data.id in auth.ref('$user.applications.id')",
      create: "auth.id != null",
      update: "data.id in auth.ref('$user.applications.id')",
      delete: "data.id in auth.ref('$user.applications.id')",
    },
  },
  attrs: {
    allow: {
      $default: 'false',
    },
  },
} satisfies InstantRules;

export default rules;
