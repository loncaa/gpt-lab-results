import * as functions from "firebase-functions";
import { StatusCodes } from "http-status-codes";
import createBaseFunction from "./commons/base.function";
import { Router, Request, Response } from "express";

import fileMiddleware from "./commons/middleware/formDataFile.middleware";
import pdfParse from "pdf-parse";

import { Configuration, OpenAIApi } from "openai";
import { logger } from "./commons/logger.dev";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const importantBloodTestsMap: { [key: string]: string } = {
  "(K) Eritrociti": "red blood cell",
  "(K) RDW": "RDW",
  "(K) MVC": "MVC",
  "(K) Hemoglobin": "Hemoglobin",
  "(K) Hematokrit": "hematocrit",
  "(K) Trombociti": "platelet",
  "(K) MCH": "MCH",
  "(K) MCHC": "MCHC",
  "(K) MPV": "MPV",
  "(K) Lkc": "Lkc",
  "(S) Glukoza": "glucose",
  "(S) Kreatinin": "creatinine",
  "(S) AST": "AST",
  "(S) ALT": "ALT",
  "(S) GGT": "GGT",
  "(S) Kalij": "electrolyte",
  "(S) Ureja": "urea",
  TSH: "TSH",
  Limfociti: "lymphocyte",
  Monociti: "monocyte",
};

const parsePdfText = (text: string): string[] => {
  let count = 0;
  let tempArray: string[] = [];

  return text.split("\n").reduce((array: string[], str: string) => {
    const trimmed = str.trim();

    const bloodTest = importantBloodTestsMap[trimmed];
    if (bloodTest) {
      count = 1;
      tempArray.push(bloodTest);
    } else if (count !== 0) {
      tempArray.push(trimmed);
      count += 1;
    }

    if (trimmed && count === 3) {
      array.push(tempArray.join(" "));
      count = 0;
      tempArray = [];
    }

    return array;
  }, []);
};

const router = Router();
router.post("/parse", fileMiddleware, async (req: Request, res: Response) => {
  const { file } = res.locals;

  const { text } = await pdfParse(file);

  const parsedDataString = parsePdfText(text).join(", ");
  const messagePrompt = `give me a summary interpretation of lab results in one paragraph with no more than 150 words: ${parsedDataString}`;

  //send data to chat gpt
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: messagePrompt,
    temperature: 0,
    max_tokens: 300,
  });

  const { choices } = response.data;

  logger.info(messagePrompt);
  logger.info(choices[0].text);

  res.status(StatusCodes.OK).json({
    messagePrompt,
    promptResponse: choices[0].text,
  });
});

const app = createBaseFunction(router, "pdf");

export const pdf = functions
  .runWith({
    memory: "1GB",
  })
  .https.onRequest(app);
