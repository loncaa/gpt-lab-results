import * as functions from "firebase-functions";

export function createDataPublicUrl(name: string, mediaToken: string) {
  return `https://firebasestorage.googleapis.com/v0/b/${
    functions.config().project.key
  }.appspot.com/o/${encodeURIComponent(name)}?alt=media&token=${mediaToken}`;
}
