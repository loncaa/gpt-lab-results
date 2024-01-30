const audioMimeTypes: { [key: string]: string } = {
  "audio/3gpp": "3gp",
  "audio/amr": "amr",
  "audio/amr-wb": "awb",
  "audio/midi": "mid",
  "audio/mpeg": "mp3",
  "audio/mp4": "mp4",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
};
export function getAudioFileType(mimeType: string): string {
  return audioMimeTypes[mimeType] || "mp3";
}
