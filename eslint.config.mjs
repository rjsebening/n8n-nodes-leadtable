import { config } from '@n8n/node-cli/eslint';

export default [
  ...config,
  {
    // `node-usable-as-tool` flipped meaning in @n8n/eslint-plugin-community-nodes 0.29.0:
    // it used to require `usableAsTool`, it now forbids it on trigger nodes. The published
    // package scanner already ships 0.29.0 and blocks releases that set it, while
    // @n8n/node-cli still pins 0.28.0 and demands it. The scanner is the publish gate, so
    // the property stays removed and the outdated rule is switched off for trigger files
    // only - action nodes keep the check. Remove this block once @n8n/node-cli ships >= 0.29.0.
    files: ['**/*Trigger.node.ts'],
    rules: {
      '@n8n/community-nodes/node-usable-as-tool': 'off',
    },
  },
];
