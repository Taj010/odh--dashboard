# User asked to generalize BFF parts across CR and OpenShell

They already see that every BFF has ports, API wiring, and rules. The useful split is shell vs domain: host proxy, unique ports, health, token *header* are a repeated pattern; Kubernetes SAR, Sandbox CR clients, and OpenAPI documents are fillings and must not be DRY’d together. Future sessions can skip “what is a port” and should push back if they propose one spec or one K8s client for both paths.
