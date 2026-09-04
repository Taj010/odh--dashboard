import * as React from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  Bullseye,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
  Label,
  PageSection,
  Spinner,
  Title,
} from '@patternfly/react-core';
import { CubeIcon } from '@patternfly/react-icons';
import { URL_PREFIX, BFF_API_VERSION } from '~/app/utilities/const';

type Workspace = {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  description?: string;
};

const WorkspaceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [workspace, setWorkspace] = React.useState<Workspace>();
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState<string>();

  React.useEffect(() => {
    let cancelled = false;
    fetch(`${URL_PREFIX}/api/${BFF_API_VERSION}/workspaces/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`BFF responded with ${res.status}`);
        }
        return res.json();
      })
      .then((data: Workspace) => {
        if (!cancelled) {
          setWorkspace(data);
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
  }, [id]);

  if (!loaded) {
    return (
      <PageSection>
        <Bullseye>
          <Spinner aria-label="Loading workspace" />
        </Bullseye>
      </PageSection>
    );
  }

  if (error || !workspace) {
    return (
      <PageSection>
        <Title headingLevel="h1" size="lg">
          Workspace: {id}
        </Title>
        <EmptyState>
          <EmptyStateHeader
            titleText="Workspace not found"
            icon={<EmptyStateIcon icon={CubeIcon} />}
            headingLevel="h2"
          />
          <EmptyStateBody>
            {error ?? `No workspace found with ID "${id}".`}
          </EmptyStateBody>
        </EmptyState>
      </PageSection>
    );
  }

  return (
    <PageSection>
      <Breadcrumb>
        <BreadcrumbItem>
          <Link to="/workspaces">Workspaces</Link>
        </BreadcrumbItem>
        <BreadcrumbItem isActive>{workspace.name}</BreadcrumbItem>
      </Breadcrumb>
      <Title headingLevel="h1" size="lg" style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
        {workspace.name}
      </Title>
      <DescriptionList>
        <DescriptionListGroup>
          <DescriptionListTerm>Status</DescriptionListTerm>
          <DescriptionListDescription>
            <Label color={workspace.status === 'running' ? 'green' : 'orange'}>
              {workspace.status}
            </Label>
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Created</DescriptionListTerm>
          <DescriptionListDescription>
            {new Date(workspace.createdAt).toLocaleString()}
          </DescriptionListDescription>
        </DescriptionListGroup>
        {workspace.description && (
          <DescriptionListGroup>
            <DescriptionListTerm>Description</DescriptionListTerm>
            <DescriptionListDescription>{workspace.description}</DescriptionListDescription>
          </DescriptionListGroup>
        )}
        <DescriptionListGroup>
          <DescriptionListTerm>ID</DescriptionListTerm>
          <DescriptionListDescription>{workspace.id}</DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
    </PageSection>
  );
};

export default WorkspaceDetailPage;
