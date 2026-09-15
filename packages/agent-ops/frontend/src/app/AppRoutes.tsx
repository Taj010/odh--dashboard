import * as React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import NotFound from './components/NotFound';
import OpenShellDetailRoutes from '~/app/openShell/OpenShellDetailRoutes';
import OpenShellListRoutes from '~/app/openShell/OpenShellRoutes';

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/workspaces" replace />} />
    <Route path="/workspaces" element={<OpenShellListRoutes />} />
    <Route path="/workspaces/:workspaceId/*" element={<OpenShellDetailRoutes />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
