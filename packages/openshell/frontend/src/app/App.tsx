import * as React from 'react';
import '@patternfly/react-core/dist/styles/base.css';
import { Page } from '@patternfly/react-core';
import AppRoutes from '~/app/AppRoutes';

const App: React.FC = () => (
  <Page mainContainerId="primary-app-container">
    <AppRoutes />
  </Page>
);

export default App;
