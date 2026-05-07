const oktaConfig = {
  clientId: '0oa12pekjhfxY6Wsm698',
  issuer: 'https://integrator-3678611.okta.com/oauth2/default',
  redirectUri: 'http://localhost:3000/login/callback',
  scopes: ['openid', 'profile', 'email'],
  pkce: true,
  disableHttpsCheck: true, // Only for local development
};

export default oktaConfig;
