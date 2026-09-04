import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  Bullseye,
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
  Label,
  PageSection,
  Spinner,
  Title,
} from '@patternfly/react-core';
import { CubesIcon } from '@patternfly/react-icons';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import { URL_PREFIX, BFF_API_VERSION } from '~/app/utilities/const';

type Workspace = {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  description?: string;
};

const statusColor = (status: string) => {
  switch (status) {
    case 'running':
      return 'green';
    case 'stopped':
      return 'orange';
    default:
      return 'grey';
  }
};

const WorkspaceListPage: React.FC = () => {
  const [workspaces, setWorkspaces] = React.useState<Workspace[]>([]);
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState<string>();

  React.useEffect(() => {
    let cancelled = false;
    fetch(`${URL_PREFIX}/api/${BFF_API_VERSION}/workspaces`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`BFF responded with ${res.status}`);
        }
        return res.json();
      })
      .then((data: Workspace[]) => {
        if (!cancelled) {
          setWorkspaces(data);
          setLoaded(true);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
          setLoaded(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loaded) {
    return (
      <PageSection>
        <Bullseye>
          <Spinner aria-label="Loading workspaces" />
        </Bullseye>
      </PageSection>
    );
  }

  if (error) {
    return (
      <PageSection>
        <Title headingLevel="h1" size="lg">
          Workspaces
        </Title>
        <EmptyState>
          <EmptyStateHeader
            titleText="Unable to load workspaces"
            icon={<EmptyStateIcon icon={CubesIcon} />}
            headingLevel="h2"
          />
          <EmptyStateBody>
            Could not retrieve workspace data from the OpenShell BFF. Ensure the backend is running
            and the proxy is configured.
          </EmptyStateBody>
        </EmptyState>
      </PageSection>
    );
  }

  if (workspaces.length === 0) {
    return (
      <PageSection>
        <Title headingLevel="h1" size="lg">
          Workspaces
        </Title>
        <EmptyState>
          <EmptyStateHeader
            titleText="No workspaces yet"
            icon={<EmptyStateIcon icon={CubesIcon} />}
            headingLevel="h2"
          />
          <EmptyStateBody>
            No workspaces are available. Create a workspace to get started.
          </EmptyStateBody>
        </EmptyState>
      </PageSection>
    );
  }

  return (
    <PageSection>
      <Title headingLevel="h1" size="lg">
        Workspaces
      </Title>
      <Table aria-label="Workspaces table">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Status</Th>
            <Th>Created</Th>
            <Th>Description</Th>
          </Tr>
        </Thead>
        <Tbody>
          {workspaces.map((ws) => (
            <Tr key={ws.id}>
              <Td dataLabel="Name">
                <Link to={`/workspaces/${ws.id}`}>{ws.name}</Link>
              </Td>
              <Td dataLabel="Status">
                <Label color={statusColor(ws.status)}>{ws.status}</Label>
              </Td>
              <Td dataLabel="Created">{new Date(ws.createdAt).toLocaleDateString()}</Td>
              <Td dataLabel="Description">{ws.description ?? '-'}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </PageSection>
  );
};

export default WorkspaceListPage;
