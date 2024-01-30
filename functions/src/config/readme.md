**How to add firebase config**

- download `serviceAccountKey.json` from firebase dashboard
- set firebase env keys
  - firebase functions:config:set private.key="" project.key="" client.email=""
- fetch runtime config file
  - npm run get-config
