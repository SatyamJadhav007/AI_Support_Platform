import { google } from "@ai-sdk/google";

import { generateText } from "ai";
import type { StorageActionWriter } from "convex/server";
import { assert } from "convex-helpers";
import { Id } from "../_generated/dataModel";
import { mime } from "zod/v4";

const AI_MODELS = {
  image: google.chat("gemini-2.5-flash"),
  pdf: google.chat("gemini-2.5-pro"),
  html: google.chat("gemini-2.5-pro"),
} as const;

const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

const SYSTEM_PROMPTS = {
  image:
    "You turn images into text. If it is a photo of a document, transcribe it. If it is not a document, describe it.",
  pdf: "You transform PDF files into text.",
  html: "You transform content into markdown.",
};

export type ExtractTextContentArgs = {
  storageId: Id<"_storage">;
  filename: string;
  bytes?: ArrayBuffer;
  mimeType: string;
};

export async function extractTextContent(
  ctx: { storage: StorageActionWriter },
  args: ExtractTextContentArgs
): Promise<string> {
  const { storageId, filename, mimeType, bytes } = args;
  const url = await ctx.storage.getUrl(storageId);
  assert(url, "Failed to get storage URL");
  //Image ahe tyatun text data kaad bro...
  if (SUPPORTED_IMAGE_TYPES.some((type) => type === mimeType)) {
    return extractImageText(url);
  }
  //pdf ahe tyatun text data kaad bro...
  if (mimeType.toLowerCase().includes("pdf")) {
    return extractPdfText(url, mimeType, filename);
  }
  //
  if (mimeType.toLowerCase().includes("text")) {
    return extractTextFileContent(ctx, storageId, bytes, mimeType);
  }
  throw new Error(`Unsupported file type: ${mimeType}`);
}
async function extractTextFileContent(
  ctx: { storage: StorageActionWriter },
  storageId: Id<"_storage">,
  bytes: ArrayBuffer | undefined,
  mimeType: string
): Promise<string> {
  // use the bytes directly or get the bytes for the file from the DB...
  const ArrayBuffer =
    bytes || (await (await ctx.storage.get(storageId))?.arrayBuffer()); //raw binary ->arrayBuffer(it is a type of store for binary)

  if (!ArrayBuffer) {
    throw new Error("Failed to get file content");
  }
  //the stored binary is converted to text/string
  const text = new TextDecoder().decode(ArrayBuffer);
  //In this case, the mimeType can be markdown or html/xml,etc...so we will use to convert it
  //to text
  if (mimeType.toLowerCase() !== "text/plain") {
    const result = await generateText({
      model: AI_MODELS.html,
      system: SYSTEM_PROMPTS.html,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text,
            },
            {
              type: "text",
              text: "Extract the text and print it in a markdown format without explaining that you'll do so.",
            },
          ],
        },
      ],
    });
    return result.text;
  }
  return text;
}

async function extractImageText(url: string): Promise<string> {
  const result = await generateText({
    model: AI_MODELS.image,
    system: SYSTEM_PROMPTS.image,
    messages: [
      {
        role: "user",
        content: [{ type: "image", image: new URL(url) }],
      },
    ],
  });
  return result.text;
}
async function extractPdfText(
  url: string,
  mimeType: string,
  filename: string
): Promise<string> {
  const result = await generateText({
    model: AI_MODELS.pdf,
    system: SYSTEM_PROMPTS.pdf,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "file",
            data: new URL(url),
            mimeType,
            filename,
          },
          {
            type: "text",
            text: "Extract the text from the PDF and print it without explaining you'll do so.",
          },
        ],
      },
    ],
  });
  return result.text;
}
