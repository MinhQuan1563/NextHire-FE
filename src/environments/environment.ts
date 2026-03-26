export const environment = {
  production: false,
  apiBaseUrl: 'https://localhost:44396',
  apiUrl: 'https://localhost:44396/api',
  googleMapsApiKey: 'AIzaSyBbIks6dt11jA5JkqLQhi3l-mWG73JRCuw',
  application: {
    baseUrl: 'http://localhost:4200/',
    name: 'NextHireApp',
  },
  oAuthConfig: {
    issuer: 'https://localhost:44396/', 
    clientId: 'NextHireApp_Password', 
    responseType: 'password', 
    scope: 'openid profile email offline_access NextHireApp', 
    requireHttps: false, 
    strictDiscoveryDocumentValidation: false
  },
  apis: {
    default: {
      url: 'https://localhost:44396',
      rootNamespace: 'NextHireApp',
    },
  },
};