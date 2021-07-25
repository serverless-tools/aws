require('esbuild').build({
  entryPoints: [
    'apigateway/CognitoAuthorizer.ts', 'apigateway/Request.ts',
    'cognito/CognitoUser.ts', 'cognito/PoolAdmin.ts'
  ],
  bundle: true, 
  minify: false,
  outdir: '.',
  target: "node12",
  platform: "node",
  watch: false,
}).catch((e:any) => {console.error(e); process.exit(1)})
