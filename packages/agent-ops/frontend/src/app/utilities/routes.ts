export const agentOpsRootPath = '/ai-hub/agents';

export const globAgentOpsAll = `${agentOpsRootPath}/*`;

export const agentOpsWorkspacesPath = `${agentOpsRootPath}/workspaces`;

export const agentOpsWorkspaceDetailPath = (workspaceId: string): string =>
  `${agentOpsWorkspacesPath}/${encodeURIComponent(workspaceId)}`;

export const agentOpsSandboxDetailPath = (workspaceId: string, sandboxName: string): string =>
  `${agentOpsWorkspacesPath}/${encodeURIComponent(workspaceId)}/sandboxes/${encodeURIComponent(sandboxName)}`;

/** Guards in-app navigation targets passed via location.state. */
export const isSafeAgentOpsInternalRoute = (path: unknown): boolean => {
  if (typeof path !== 'string') {
    return false;
  }

  if (
    !path.startsWith('/') ||
    path.startsWith('//') ||
    path.includes('://') ||
    path.includes('..') ||
    path.includes('\\') ||
    /[\t\n\r]/.test(path)
  ) {
    return false;
  }

  try {
    const { pathname } = new URL(path, 'http://localhost');
    if (pathname === agentOpsRootPath || pathname === `${agentOpsRootPath}/`) {
      return true;
    }

    return (
      pathname === agentOpsWorkspacesPath || pathname.startsWith(`${agentOpsWorkspacesPath}/`)
    );
  } catch {
    return false;
  }
};
