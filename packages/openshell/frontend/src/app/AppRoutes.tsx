import * as React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import WorkspaceListPage from '~/app/pages/WorkspaceListPage';
import WorkspaceDetailPage from '~/app/pages/WorkspaceDetailPage';
import SandboxDetailPage from '~/app/pages/SandboxDetailPage';

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/workspaces" replace />} />
    <Route path="/workspaces" element={<WorkspaceListPage />} />
    <Route path="/workspaces/:id" element={<WorkspaceDetailPage />} />
    <Route path="/sandboxes/:id" element={<SandboxDetailPage />} />
    <Route path="*" element={<Navigate to="/workspaces" replace />} />
  </Routes>
);

export default AppRoutes;
