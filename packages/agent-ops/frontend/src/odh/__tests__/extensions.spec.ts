import extensions from '~/odh/extensions';
import {
  agentOpsSandboxDetailPath,
  agentOpsWorkspaceDetailPath,
  agentOpsWorkspacesPath,
} from '~/app/utilities/routes';

const AGENT_OPS = 'agent-ops';

describe('agent-ops extensions', () => {
  it('should register area, tab-route tab, and route extensions', () => {
    expect(extensions).toHaveLength(3);
    expect(extensions.map((extension) => extension.type)).toEqual([
      'app.area',
      'app.tab-route/tab',
      'app.route',
    ]);
  });

  it('should register the agent ops area with feature flag', () => {
    const area = extensions.find(
      (extension) => extension.type === 'app.area' && extension.properties.id === AGENT_OPS,
    );
    expect(area).toMatchObject({
      type: 'app.area',
      properties: {
        id: AGENT_OPS,
        featureFlags: ['agentOps'],
      },
    });
  });

  it('should register workspaces tab for the agents tab page', () => {
    const tab = extensions.find((extension) => extension.type === 'app.tab-route/tab');
    expect(tab).toMatchObject({
      type: 'app.tab-route/tab',
      flags: {
        required: [AGENT_OPS],
      },
      properties: {
        pageId: 'agents-tab-page',
        id: 'workspaces',
        title: 'Workspaces',
        group: '1_workspaces',
      },
    });
    expect(tab?.type === 'app.tab-route/tab' && tab.properties.component).toBeTruthy();
  });

  it('should register workspace detail route', () => {
    const workspaceRoute = extensions.find(
      (extension) =>
        extension.type === 'app.route' &&
        extension.properties.path === '/ai-hub/agents/workspaces/:workspaceId/*',
    );
    expect(workspaceRoute).toMatchObject({
      type: 'app.route',
      flags: {
        required: [AGENT_OPS],
      },
    });
    expect(
      workspaceRoute?.type === 'app.route' && workspaceRoute.properties.component,
    ).toBeTruthy();
  });

  it('should keep extension route paths in sync with utilities/routes.ts', () => {
    expect(agentOpsWorkspacesPath).toBe('/ai-hub/agents/workspaces');
    expect(agentOpsWorkspaceDetailPath('team1')).toBe('/ai-hub/agents/workspaces/team1');
    expect(agentOpsSandboxDetailPath('team1', 'sandbox-a')).toBe(
      '/ai-hub/agents/workspaces/team1/sandboxes/sandbox-a',
    );
  });
});
