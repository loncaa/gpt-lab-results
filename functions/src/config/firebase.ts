import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

const config = functions.config();

const firebaseConfig = {
  credential: admin.credential.cert({
    privateKey: config.private.key.replace(/\\n/g, "\n"),
    projectId: config.project.key,
    clientEmail: config.client.email,
  }),
  databaseURL: `https://${config.project.key}.firebaseio.com`,
  storageBucket: `${config.project.key}.appspot.com`,
};

const app = admin.initializeApp(firebaseConfig);

const db = admin.firestore();
const storage = admin.storage().bucket();

export { admin, db, storage, app, firebaseConfig };
