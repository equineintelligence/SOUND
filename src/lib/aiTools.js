// AI tools shown on the AI Tools page. To add a tool, add an entry here.
//
// kind "botpress": a Botpress webchat. Copy the two <script src="…"> addresses
// from Botpress (Webchat → Embed code): the inject script and your bot's
// config script.
export const AI_TOOLS = [
  {
    id: 'saef-rules-guide',
    kind: 'botpress',
    name: 'SAEF Rules Guide',
    tagline: 'SAEF rules, made clearer',
    description:
      'Ask questions about SAEF rules and policies. Answers are grounded in the supplied regulations and policy documents, with citations.',
    note: 'An AI assistant can make mistakes. Check important answers against the official SAEF documents.',
    scripts: [
      'https://cdn.botpress.cloud/webchat/v5.0/inject.js',
      'https://files.bpcontent.cloud/2026/10/29/10/20261029104701-HMGGZKME.js',
    ],
  },
];
