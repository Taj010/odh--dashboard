# No terminal or live connection in this release

After Connect, the person can see the selected gateway's workspaces. A terminal or other live connection stays off. The OpenShell login is sent on normal page requests in a dedicated header, and a browser live connection cannot attach that header. Enabling those connections in this release would need a second way to pass the login, which we have not designed.
