export const environment = {
  production: false,
  apiBaseUrl: 'http://136.110.48.253:5000',
  apiUrl: 'http://136.110.48.253:5000/api',
  application: {
    baseUrl: 'http://localhost:4200/',
    name: 'NextHireApp',
  },
  oAuthConfig: {
    issuer: 'http://136.110.48.253:5000/', 
    clientId: 'NextHireApp_Password', 
    responseType: 'password', 
    scope: 'openid profile email offline_access NextHireApp', 
    requireHttps: false, 
    strictDiscoveryDocumentValidation: false
  },
  apis: {
    default: {
      url: 'http://136.110.48.253:5000',
      rootNamespace: 'NextHireApp',
    },
  },
};