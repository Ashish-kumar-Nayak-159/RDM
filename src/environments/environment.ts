// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // test RDM app server
  // appServerURL: 'https://kemsysrdmfuntionapp.azurewebsites.net/api/',
  // dev RDM app server
  appServerURL: 'https://devkemsysrdmfuntionapp.azurewebsites.net/api/',
  blobAccountName: 'storageaccountkemsy96a3',
  blobContainerName: 'rdm-images',
  blobKey: '?sv=2019-12-12&ss=bfqt&srt=co&sp=rwdlacupx&se=2050-08-24T01:36:54Z&st=2020-08-23T17:36:54Z&spr=https,http&sig=RQIjWkLDMqo6bxn5QtZrBLBQ7qYDn2q2dPZyckV%2FGJc%3D',
  blobURL: 'https://storageaccountkemsy96a3.blob.core.windows.net/',
  cachedTelemetryContainer: 'telemetry',
  app: undefined,
  version: '5.0',
  packageManagementContainer: 'packages',
  storgageSecretKey: 'kEm$Y$*RdM'

  // appServerURL: 'https://kirloskarfunctionapp.azurewebsites.net/api/',
  // blobAccountName: 'sopancmsblobstorage',
  // blobContainerName: 'ui-media',
  // blobKey: '?sv=2019-12-12&ss=bf&srt=co&sp=rwacx&se=2049-12-31T18:30:00Z&st=2020-12-31T18:30:00Z&' +
  // 'spr=https,http&sig=Ly45a15rNQmdSDXpSQqGC6vkXhV3Q4BCPI7YAXuv%2BsM%3D',
  // blobURL: 'https://sopancmsblobstorage.blob.core.windows.net',
  // cachedTelemetryContainer: 'telemetry',
  // app: 'KCMS',
  // version: '1.0'

};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
