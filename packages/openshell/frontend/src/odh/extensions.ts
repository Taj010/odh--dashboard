import type {
  AreaExtension,
  RouteExtension,
  TabRouteTabExtension,
} from '@odh-dashboard/plugin-core/extension-points';

const AGENTS_OPENSHELL = 'agents-openshell';
const AGENTS_TAB_PAGE = 'agents-tab-page';

const extensions: (AreaExtension | RouteExtension | TabRouteTabExtension)[] = [
  {
    type: 'app.area',
    properties: {
      id: AGENTS_OPENSHELL,
      featureFlags: ['disableOpenShell'],
    },
  },
  {
    type: 'app.tab-route/tab',
    flags: {
      required: [AGENTS_OPENSHELL],
    },
    properties: {
      pageId: AGENTS_TAB_PAGE,
      id: 'openshell',
      title: 'OpenShell',
      component: () => import('./OpenShellWrapper'),
      group: '2_openshell',
    },
  },
  {
    type: 'app.route',
    flags: {
      required: [AGENTS_OPENSHELL],
    },
    properties: {
      path: '/ai-hub/agents/openshell/*',
      component: () => import('./OpenShellWrapper'),
    },
  },
];

export default extensions;
