const { OdhFederationPlugin } = require('@odh-dashboard/app-config/rspack');

module.exports = {
  moduleFederationPlugins: [
    new OdhFederationPlugin({
      name: 'openShell',
      isHost: process.env.DEPLOYMENT_MODE === 'standalone',
      exposes: {
        './extensions': './src/odh/extensions',
      },
    }),
  ],
};
