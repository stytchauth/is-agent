import { createAgentContext } from '@stytch/is-agent';

if (!process.env.NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN) {
  throw Error('Missing required configuration for process.env.NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN');
}

export const { useIsAgent, IsHuman, IsAgent } = createAgentContext(
  process.env.NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN
);
