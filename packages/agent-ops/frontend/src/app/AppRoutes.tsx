import * as React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import NotFound from './components/NotFound';
import OpenShellDetailRoutes from '~/odh/OpenShellDetailRoutes';
import OpenShellFederatedProviders from '~/odh/OpenShellFederatedProviders';
import OpenShellRoutes from '~/odh/OpenShellRoutes';

const WorkspacesRoutes: React.FC = () => (
  <OpenShellFederatedProviders>
    <OpenShellRoutes />
  </OpenShellFederatedProviders>
);

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/workspaces" replace />} />
    <Route path="/workspaces" element={<WorkspacesRoutes />} />
    <Route path="/workspaces/:workspaceId/*" element={<OpenShellDetailRoutes />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
