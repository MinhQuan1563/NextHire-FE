export const environment = {
  production: false,
  apiBaseUrl: 'https://localhost:44396',  // BE ABP
  authority: 'https://localhost:44396',   // OIDC/OpenIddict (ABP)
  clientId: 'NextHire_Angular',
  redirectUri: 'http://localhost:4200',
  postLogoutRedirectUri: 'http://localhost:4200',
  scope: 'offline_access openid profile email roles Nexthire',
};