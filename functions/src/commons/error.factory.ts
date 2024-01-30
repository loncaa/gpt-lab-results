const createApiError = (message: string): ApiError => ({
  error: true,
  message: message,
});

export type ApiError = {
  error: boolean;
  message: string;
};

export default createApiError;

export const UserJourneyErrorMessage = {
  NotFound: (id: string) => `User Journey id ${id} not found.`,
  NotFoundPlural: `User Journeys not found.`,
  NotAllowed: `Not allowed to fetch selected User Journey.`,
  NotAllowedToUpdate: `User not allowed to update selected User Journey.`,
  NotFoundInList: `User Journey id from payload not found in User Journeys list.`,
  StatusErrorMessage: (id: string, status: string) =>
    `Failed to create user journey. Selected journey ${id} is in status '${
      status ? status : "Undefined"
    }'.`,
};

export const UserInvitationErrorMessage = {
  NotFound: (email: string) => `User Invitation for email ${email} not found.`,
  CompanyNotValid: `User Invitation company not valid.`,
};

export const JourneyErrorMessage = {
  NotFound: (id: string) => `Journey id ${id} not found`,
  ImageUploadFailed: "Failed to upload Journey Image.",
};

export const AssetsErrorMessage = {
  NotFound: (id: string) => `Asset id ${id} not found`,
  UpdateFailed: (id: string) => `Failed to update an Asset id ${id}.`,
  CreateFailed: "Failed to create an Asset.",
  TranscriptionIdNotFound:
    "Failed to update an Asset. TranscriptionId not found.",
  MetadataNotFound: "Failed to update an Asset. Metadata not found.",
  MetadataValuesNotFound:
    "Failed to update an Asset. Metadata values not found.",
  TextValueNotFound: "Failed to update an Asset. Text value not found.",
  StillInProgress:
    "Failed to update Asset. Asset still in process of Transcribing.",
  NotValidType: (id: string) => `Asset id ${id} is not valid type`,
};

export const LessonsErrorMessage = {
  NotFound: (id: string) => `Lesson id ${id} not found`,
  NotExists: `Some of Lessons not exists.`,
};

export const AuthErrorMessage = {
  Unauthorized: "User Unauthorized",
  Forbidden: "Path Forbidden",
};

export const UserErrorMessage = {
  NotFound: `User not found`,
  AccessRestrictedForNoAdminRoles: "Access Allowed only to Admin User role",
};

export const GeneralErrorMessage = {
  UploadSizeLimit: "Failed to upload file because it is too large.",
  UploadFilesLimit: "Only one file is allowed to be uploaded.",
  UploadFieldsLimitation:
    "Failed to upload file because form data fields are not allowed.",
  UploadFileNotFound: "Upload file not found",
  UrlParameterNotFound: "Url parameter not found",
};

export const TextToSpeechErrorMessage = {
  ConvertFailed: (message: string) =>
    `Failed to convert text to speech. ${message}`,
  InitiationFailed: (message: string) =>
    `Failed to initiate text to speech generating. ${message}`,
  StatusFetchFailed: (message: string) => `Failed to fetch status. ${message}`,
  NotConverted: `Synthesized speech not converted.`,
  SpeechUploadFailed: (message: string) =>
    `Uploading Synthesized speech to blob failed. ${message}`,
  SubtitleUploadFailed: (message: string) =>
    `Uploading Synthesized speech subtitles to blob failed. ${message}`,
};
