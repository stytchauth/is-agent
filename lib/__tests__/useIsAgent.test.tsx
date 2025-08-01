import '@testing-library/jest-dom';
import { act, render, screen, waitFor } from '@testing-library/react';
import { createAgentContext } from '../src';
import type { useIsAgent, IsAgent, IsHuman } from '../src';
import * as isAgentModule from '../src/isAgent';

jest.mock('../src/isAgent');
const mockIsAgent = jest.mocked(isAgentModule.isAgent);

describe('useIsAgent hook and components', () => {
  const testToken = 'test-stytch-token';
  let useIsAgent: useIsAgent;
  let IsAgent: IsAgent;
  let IsHuman: IsHuman;

  beforeEach(() => {
    ({ useIsAgent, IsAgent, IsHuman } = createAgentContext(testToken));
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('useIsAgent hook', () => {
    function TestComponent() {
      const state = useIsAgent();
      return (
        <div>
          <div data-testid="loading">{state.loading.toString()}</div>
          <div data-testid="error">{state.error?.message || 'null'}</div>
          <div data-testid="bot-identity">{state.identity || 'null'}</div>
          <div data-testid="likely-bot">{state.isAgentClientHint?.toString() || 'null'}</div>
        </div>
      );
    }

    it('should start in loading state', () => {
      mockIsAgent.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<TestComponent />);

      expect(screen.getByTestId('loading')).toHaveTextContent('true');
      expect(screen.getByTestId('error')).toHaveTextContent('null');
      expect(screen.getByTestId('bot-identity')).toHaveTextContent('null');
      expect(screen.getByTestId('likely-bot')).toHaveTextContent('null');
    });

    it('should handle successful response', async () => {
      mockIsAgent.mockResolvedValue({
        is_agent_client_hint: true,
        identity: 'test-bot',
      });

      act(() => {
        render(<TestComponent />);
      });

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      expect(screen.getByTestId('error')).toHaveTextContent('null');
      expect(screen.getByTestId('bot-identity')).toHaveTextContent('test-bot');
      expect(screen.getByTestId('likely-bot')).toHaveTextContent('true');
    });

    it('should handle error response', async () => {
      const errorMessage = 'API Error';
      mockIsAgent.mockRejectedValue(new Error(errorMessage));

      act(() => {
        render(<TestComponent />);
      });

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      expect(screen.getByTestId('error')).toHaveTextContent(errorMessage);
      expect(screen.getByTestId('bot-identity')).toHaveTextContent('null');
      expect(screen.getByTestId('likely-bot')).toHaveTextContent('null');
    });

    it('should call isAgent with correct token', async () => {
      mockIsAgent.mockResolvedValue({
        is_agent_client_hint: false,
        identity: null,
      });

      await act(async () => {
        render(<TestComponent />);
      });

      expect(mockIsAgent).toHaveBeenCalledWith(testToken);
      expect(mockIsAgent).toHaveBeenCalledTimes(1);
    });
  });

  describe('IsAgent component', () => {
    it('should show loading component while loading', () => {
      mockIsAgent.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(
        <IsAgent loadingComponent={<div data-testid="loading">Loading...</div>}>
          <div data-testid="agent-content">Agent Content</div>
        </IsAgent>
      );

      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.queryByTestId('agent-content')).not.toBeInTheDocument();
    });

    it('should show error component on error', async () => {
      const error = new Error('Test error');
      mockIsAgent.mockRejectedValue(error);

      render(
        <IsAgent
          errorComponent={({ error }) => <div data-testid="error">Error: {error?.message}</div>}
        >
          <div data-testid="agent-content">Agent Content</div>
        </IsAgent>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeInTheDocument();
      });

      expect(screen.getByTestId('error')).toHaveTextContent('Error: Test error');
      expect(screen.queryByTestId('agent-content')).not.toBeInTheDocument();
    });

    it('should show children when is_agent_client_hint is true', async () => {
      mockIsAgent.mockResolvedValue({
        is_agent_client_hint: true,
        identity: 'test-bot',
      });

      render(
        <IsAgent>
          <div data-testid="agent-content">Agent Content</div>
        </IsAgent>
      );

      await waitFor(() => {
        expect(screen.getByTestId('agent-content')).toBeInTheDocument();
      });
    });

    it('should hide children when is_agent_client_hint is false', async () => {
      mockIsAgent.mockResolvedValue({
        is_agent_client_hint: false,
        identity: null,
      });

      render(
        <IsAgent>
          <div data-testid="agent-content">Agent Content</div>
        </IsAgent>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('agent-content')).not.toBeInTheDocument();
      });
    });
  });

  describe('IsHuman component', () => {
    it('should show loading component while loading', () => {
      mockIsAgent.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(
        <IsHuman loadingComponent={<div data-testid="loading">Loading...</div>}>
          <div data-testid="human-content">Human Content</div>
        </IsHuman>
      );

      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.queryByTestId('human-content')).not.toBeInTheDocument();
    });

    it('should show error component on error', async () => {
      const error = new Error('Test error');
      mockIsAgent.mockRejectedValue(error);

      render(
        <IsHuman errorComponent={<div data-testid="error">Error occurred</div>}>
          <div data-testid="human-content">Human Content</div>
        </IsHuman>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('human-content')).not.toBeInTheDocument();
    });

    it('should show children when is_agent_client_hint is false', async () => {
      mockIsAgent.mockResolvedValue({
        is_agent_client_hint: false,
        identity: null,
      });

      render(
        <IsHuman>
          <div data-testid="human-content">Human Content</div>
        </IsHuman>
      );

      await waitFor(() => {
        expect(screen.getByTestId('human-content')).toBeInTheDocument();
      });
    });

    it('should hide children when is_agent_client_hint is true', async () => {
      mockIsAgent.mockResolvedValue({
        is_agent_client_hint: true,
        identity: 'test-bot',
      });

      render(
        <IsHuman>
          <div data-testid="human-content">Human Content</div>
        </IsHuman>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('human-content')).not.toBeInTheDocument();
      });
    });
  });
});
