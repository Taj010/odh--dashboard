import type {
  AreaExtension,
  RouteExtension,
  TabRouteTabExtension,
} from '@odh-dashboard/plugin-core/extension-points';

// Must match `${agentOpsWorkspacesPath}/:workspaceId/*` in ~/app/utilities/routes.ts.
const agentOpsWorkspacesDetailPath = '/ai-hub/agents/workspaces/:workspaceId/*';

const AGENT_OPS = 'agent-ops';
const AGENTS_TAB_PAGE = 'agents-tab-page';

const extensions: (AreaExtension | TabRouteTabExtension | RouteExtension)[] = [
  {
    type: 'app.area',
    properties: {
      id: AGENT_OPS,
      featureFlags: ['agentOps'],
    },
  },
  {
    type: 'app.tab-route/tab',
    flags: {
      required: [AGENT_OPS],
    },
    properties: {
      pageId: AGENTS_TAB_PAGE,
      id: 'workspaces',
      title: 'Workspaces',
      component: () => import('~/app/openShell/OpenShellRoutes.tsx'),
      group: '1_workspaces',
    },
  },
  {
    type: 'app.route',
    flags: {
      required: [AGENT_OPS],
    },
    properties: {
      path: agentOpsWorkspacesDetailPath,
      component: () => import('~/app/openShell/OpenShellDetailRoutes.tsx'),
    },
  },
];

export default extensions;
