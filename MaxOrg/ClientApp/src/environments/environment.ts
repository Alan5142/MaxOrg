// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: 'https://maxorg.com:5001/api/',
  githubAuth: {
    clientId: '69a05969e2390923914f'
  },
  vsDevOps: {
    clientId: 'C69068CE-3FB3-411B-AD45-46D37F10DD36',
    scope: 'vso.build_execute vso.loadtest_write vso.test_write',
    redirect: 'https://maxorg.com:5001/auth/devops',
    authUrl: 'https://app.vssps.visualstudio.com/oauth2/authorize'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
