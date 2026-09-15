import {
  agentOpsSandboxDetailPath,
  agentOpsWorkspaceDetailPath,
  agentOpsWorkspacesPath,
  isSafeAgentOpsInternalRoute,
} from '~/app/utilities/routes';

describe('agent-ops routes', () => {
  it('defines workspace paths under the agents root', () => {
    expect(agentOpsWorkspacesPath).toBe('/ai-hub/agents/workspaces');
    expect(agentOpsWorkspaceDetailPath('ws-1')).toBe('/ai-hub/agents/workspaces/ws-1');
    expect(agentOpsSandboxDetailPath('ws-1', 'sb-1')).toBe(
      '/ai-hub/agents/workspaces/ws-1/sandboxes/sb-1',
    );
  });

  describe('isSafeAgentOpsInternalRoute', () => {
    it('accepts valid workspace paths', () => {
      expect(isSafeAgentOpsInternalRoute('/ai-hub/agents/workspaces')).toBe(true);
      expect(isSafeAgentOpsInternalRoute('/ai-hub/agents/workspaces/team1')).toBe(true);
      expect(
        isSafeAgentOpsInternalRoute('/ai-hub/agents/workspaces/team1/sandboxes/sandbox-a'),
      ).toBe(true);
    });

    it('accepts the agents root path', () => {
      expect(isSafeAgentOpsInternalRoute('/ai-hub/agents')).toBe(true);
    });

    it('rejects legacy deployment paths', () => {
      expect(isSafeAgentOpsInternalRoute('/ai-hub/agents/deployments/team1')).toBe(false);
    });

    it('rejects external URLs', () => {
      expect(isSafeAgentOpsInternalRoute('https://evil.com')).toBe(false);
    });

    it('rejects protocol-relative URLs', () => {
      expect(isSafeAgentOpsInternalRoute('//evil.com')).toBe(false);
    });

    it('rejects path traversal segments', () => {
      expect(isSafeAgentOpsInternalRoute('/ai-hub/agents/workspaces/foo/../../other')).toBe(false);
    });

    it('rejects backslash path segments', () => {
      expect(isSafeAgentOpsInternalRoute('/ai-hub/agents\\workspaces')).toBe(false);
    });

    it('rejects control characters before URL parsing', () => {
      expect(isSafeAgentOpsInternalRoute('/ai-hub/agents/workspaces/team1\n/evil')).toBe(false);
      expect(isSafeAgentOpsInternalRoute('/ai-hub/agents/workspaces\tteam1')).toBe(false);
    });

    it('rejects non-string values', () => {
      expect(isSafeAgentOpsInternalRoute(123)).toBe(false);
    });

    it('returns false when URL parsing throws', () => {
      const urlSpy = jest.spyOn(global, 'URL').mockImplementation(() => {
        throw new TypeError('Invalid URL');
      });

      expect(isSafeAgentOpsInternalRoute('/ai-hub/agents/workspaces/team1')).toBe(false);

      urlSpy.mockRestore();
    });
  });
});
