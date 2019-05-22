export const environment = {
  production: true,
  apiUrl: 'https://maxorg.azurewebsites.net/api/',
  githubAuth: {
    clientId: '69a05969e2390923914f'
  },
  vsDevOps: {
    clientId: 'C69068CE-3FB3-411B-AD45-46D37F10DD36',
    scope: 'vso.build_execute vso.loadtest_write vso.test_write',
    redirect: 'https://maxorg.azurewebsites.net/auth/devops',
    authUrl: 'https://app.vssps.visualstudio.com/oauth2/authorize'
  }
};
