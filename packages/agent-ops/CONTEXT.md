# Agent Ops

The dashboard area where a person works with OpenShell after they have already logged in to Open Data Hub.

## Language

**ODH session**:
The person's login to the dashboard. It says who they are in Open Data Hub.
_Avoid_: Dashboard token, platform auth

**Gateway**:
An OpenShell entry point a person connects to. One OpenShell login belongs to one gateway.
_Avoid_: Workspace, cluster, endpoint

**Login settings**:
The issuer, audience, public client id, scopes, and callback for one gateway. If these change, that gateway's OpenShell login and its loaded workspaces are dropped, and the gateway becomes unconnected. A rename does not do this. Other gateways stay as they are.
_Avoid_: Gateway name

**Selected gateway**:
The one gateway whose workspaces are on screen. Other gateways may still have an OpenShell login, but their workspaces stay hidden until the person selects them. The selection is part of where the person is in Agent Ops, so coming back to the same place selects the same gateway even when that gateway's OpenShell login is gone.
_Avoid_: Active gateway, current workspace

**Gateway chooser**:
The list of gateways on the page. It shows which gateway is selected. Choosing one changes the selected gateway. It does not start an OpenShell login, and it does not drop any OpenShell login.
_Avoid_: Connect, disconnect, logout

**Last selected gateway**:
The gateway this person most recently selected. When they open Agent Ops with no gateway selected, this one becomes the selected gateway. If they have never selected one, the first gateway in the list is selected. This memory is not an OpenShell login. A change of person does not clear it.
_Avoid_: Default login, saved session

**Connect**:
The action that starts an OpenShell login for the selected gateway only. Choosing a gateway does not start a login, and it does not end the login for any other gateway.
_Avoid_: Gateway chooser, dashboard sign-in

**Failed login return**:
The person comes back from the identity provider without an OpenShell login for the selected gateway. That gateway stays unconnected, the page explains the failure, and Connect is offered again. Other gateways keep their logins. The dashboard user does not change.
_Avoid_: Not allowed, generic error page

**Disconnect**:
The action that drops the OpenShell login for the selected gateway only, and drops the workspaces loaded for that gateway. It does not log out of the identity provider. Other gateways keep their logins. The selected gateway becomes unconnected.
_Avoid_: Logout, account switch, log out of the dashboard

**Logout**:
The action that drops the OpenShell login for the selected gateway, and the workspaces loaded for it, and logs out of the identity provider when that provider allows it. If the provider cannot log out, the login is still dropped and the page says the provider may still remember the account. It does not ask the person to pick a new account. Other gateways keep their logins. The dashboard user does not change.
_Avoid_: Disconnect, account switch, leaving the dashboard

**Account switch**:
The action that drops the OpenShell login for the selected gateway, and the workspaces loaded for it, so the person can sign in as a different OpenShell account. When the identity provider allows it, that provider session is logged out too, and the person is asked to log in again. If the provider cannot log out, the login is still dropped, the page says the provider may still remember the account, and the new login may come back as the same account. Other gateways keep their logins. The dashboard user does not change.
_Avoid_: Disconnect, logout, ODH session

**Missing gateway**:
The address names a gateway that is not in the list. The page says that gateway was not found and lets the person pick another one. It does not open a different gateway, and it does not start a login.
_Avoid_: Unconnected gateway, empty workspace list, no gateways

**No gateways**:
The list of gateways is empty. The page says there are no gateways. Connect is not offered, because there is no gateway to log in to.
_Avoid_: Missing gateway, unconnected gateway, gateway list error

**Gateway list error**:
The page could not load the gateway list. It says so and lets the person try again. It does not say there are no gateways, and it does not offer Connect.
_Avoid_: No gateways, missing gateway

**Unconnected gateway**:
A gateway with no OpenShell login for this person. A login that is missing or no longer valid is dropped, and the gateway becomes unconnected. When it is selected, the page offers Connect for that gateway only. A login for a different gateway does not connect this one.
_Avoid_: Empty workspace list, logged out of the dashboard, not allowed

**Login renewal**:
While this browser page stays open, an OpenShell login that is about to run out is renewed for that gateway. A failed renewal drops that login, and the gateway becomes unconnected. Reloading the page or opening a new tab does not renew it, because the login is already gone.
_Avoid_: Page refresh, restored session

**Not allowed**:
The person still has an OpenShell login for the selected gateway, and that gateway refuses access. The login stays. The page says they cannot view this gateway's workspaces.
_Avoid_: Unconnected gateway, Connect

**Workspace**:
A working area that belongs to one gateway. Its contents are available only after that gateway has an OpenShell login. An address for a workspace whose gateway is unconnected stays on that address and offers Connect. After a successful login, that workspace loads.
_Avoid_: Gateway, sandbox

**Empty workspace list**:
The selected gateway has an OpenShell login and has no workspaces. The page says so. The login stays, and Connect is not offered.
_Avoid_: Unconnected gateway, no gateways, missing gateway

**OpenShell login**:
A second login for one gateway, held for the person in the current ODH session. It is not the ODH session, and a login for gateway A is not a login for gateway B. A person can hold a login for more than one gateway at the same time. Connecting to one gateway does not remove the others. When the ODH session changes to a different person, every OpenShell login is dropped, and the workspaces loaded for them are dropped. Each login lasts only while this browser page is open.
_Avoid_: Double authentication, token bundle, gateway token
