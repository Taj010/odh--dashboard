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
import { DesktopIcon } from '@patternfly/react-icons';
import { URL_PREFIX, BFF_API_VERSION } from '~/app/utilities/const';

type Sandbox = {
  id: string;
  workspaceId: string;
  name: string;
  status: string;
  createdAt: string;
};

const SandboxDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [sandbox, setSandbox] = React.useState<Sandbox>();
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState<string>();

  React.useEffect(() => {
    let cancelled = false;
    fetch(`${URL_PREFIX}/api/${BFF_API_VERSION}/sandboxes/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`BFF responded with ${res.status}`);
        }
        return res.json();
      })
      .then((data: Sandbox) => {
        if (!cancelled) {
          setSandbox(data);
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
          <Spinner aria-label="Loading sandbox" />
        </Bullseye>
      </PageSection>
    );
  }

  if (error || !sandbox) {
    return (
      <PageSection>
        <Title headingLevel="h1" size="lg">
          Sandbox: {id}
        </Title>
        <EmptyState>
          <EmptyStateHeader
            titleText="Sandbox not found"
            icon={<EmptyStateIcon icon={DesktopIcon} />}
            headingLevel="h2"
          />
          <EmptyStateBody>
            {error ?? `No sandbox found with ID "${id}".`}
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
        <BreadcrumbItem>
          <Link to={`/workspaces/${sandbox.workspaceId}`}>{sandbox.workspaceId}</Link>
        </BreadcrumbItem>
        <BreadcrumbItem isActive>{sandbox.name}</BreadcrumbItem>
      </Breadcrumb>
      <Title headingLevel="h1" size="lg" style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
        {sandbox.name}
      </Title>
      <DescriptionList>
        <DescriptionListGroup>
          <DescriptionListTerm>Status</DescriptionListTerm>
          <DescriptionListDescription>
            <Label color={sandbox.status === 'running' ? 'green' : 'orange'}>
              {sandbox.status}
            </Label>
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Workspace</DescriptionListTerm>
          <DescriptionListDescription>
            <Link to={`/workspaces/${sandbox.workspaceId}`}>{sandbox.workspaceId}</Link>
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Created</DescriptionListTerm>
          <DescriptionListDescription>
            {new Date(sandbox.createdAt).toLocaleString()}
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>ID</DescriptionListTerm>
          <DescriptionListDescription>{sandbox.id}</DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
    </PageSection>
  );
};

export default SandboxDetailPage;
