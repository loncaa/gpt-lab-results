import axios from "axios";
import * as functions from "firebase-functions";
import { getAuth } from "firebase-admin/auth";

const config = functions.config();

export async function fetchIdToken(uid: string): Promise<string> {
  const customToken = await getAuth().createCustomToken(uid);

  const apikey = config.project.apikey;
  const res = await axios.post(
    `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyCustomToken?key=${apikey}`,

    {
      token: customToken,
      returnSecureToken: true,
    }
  );

  return res.data.idToken;
}
