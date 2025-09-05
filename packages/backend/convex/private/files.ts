import { ConvexError, v } from "convex/values";
import { action, mutation, query, QueryCtx } from "../_generated/server";
import {
  contentHashFromArrayBuffer,
  Entry,
  EntryId,
  guessMimeTypeFromContents,
  guessMimeTypeFromExtension,
  vEntryId,
} from "@convex-dev/rag";
import { extractTextContent } from "../lib/extractTextContent";
import rag from "../system/ai/rag";
import { Id } from "../_generated/dataModel";
import { paginationOptsValidator } from "convex/server";
function guessMineType(filename: string, bytes: ArrayBuffer): string {
  return (
    guessMimeTypeFromContents(bytes) ||
    guessMimeTypeFromExtension(filename) ||
    "application/octet-stream"
  );
}

export const deleteFile = mutation({
  args: {
    entryId: vEntryId,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }
    const orgId = identity.orgId as string;
    if (!orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Organization not found",
      });
    }
    const namespace = await rag.getNamespace(ctx, {
      namespace: orgId,
    });
    if (!namespace) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid namespace",
      });
    }
    const entry = await rag.getEntry(ctx, {
      entryId: args.entryId,
    });
    if (!entry) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Entry not found",
      });
    }
    if (entry.metadata?.uploadedBy !== orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "You are not the owner of this file",
      });
    }

    if (entry.metadata?.storageId) {
      await ctx.storage.delete(entry.metadata.storageId as Id<"_storage">);
    }

    await rag.deleteAsync(ctx, {
      entryId: args.entryId,
    });
  },
});

export const addFile = action({
  args: {
    filename: v.string(),
    mimeType: v.string(),
    bytes: v.bytes(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }
    const orgId = identity.orgId as string;
    if (!orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Organization not found",
      });
    }
    const { bytes, filename, category } = args;
    const mimeType = args.mimeType || guessMineType(filename, bytes);
    const blob = new Blob([bytes], { type: mimeType });
    const storageId = await ctx.storage.store(blob);

    const text = await extractTextContent(ctx, {
      storageId,
      filename,
      bytes,
      mimeType,
    });

    const { entryId, created } = await rag.add(ctx, {
      namespace: orgId, //this is super important,if not added the file uploaded will be global
      text,
      key: filename,
      title: filename,
      metadata: {
        storageId,
        uploadedBy: orgId,
        filename,
        category: category ?? null,
      } as EntryMetadata,
      contentHash: await contentHashFromArrayBuffer(bytes), //To avoid re-inserting if the file content hasn't changed
    });

    if (!created) {
      console.debug("entry already exists, skipping upload metaData");
      await ctx.storage.delete(storageId);
    }

    return {
      url: await ctx.storage.getUrl(storageId),
      entryId,
    };
  },
});

export const list = query({
  args: {
    category: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    // user existance and organization for that user check...
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }
    const orgId = identity.orgId as string;
    if (!orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Organization not found",
      });
    }
    //namespace is like the key stored in the embeddings to tell us for which organizations
    //does the extracted file belongs to...
    const namespace = await rag.getNamespace(ctx, {
      namespace: orgId,
    });

    if (!namespace) {
      return { page: [], isDone: true, continueCursor: "" };
    }
    const results = await rag.list(ctx, {
      namespaceId: namespace.namespaceId,
      paginationOpts: args.paginationOpts,
    });
    const files = await Promise.all(
      results.page.map((entry) => convertEntryToPublicFile(ctx, entry))
    );

    const filteredFiles = args.category
      ? files.filter((file) => file.category === args.category)
      : files;
    return {
      page: filteredFiles,
      isDone: results.isDone,
      continueCursor: results.continueCursor,
    };
  },
});

export type PublicFile = {
  id: EntryId;
  name: string;
  type: string;
  size: string;
  status: "ready" | "processing" | "error";
  url: string | null;
  category?: string;
};

type EntryMetadata = {
  storageId: Id<"_storage">;
  uploadedBy: string;
  filename: string;
  category: string | null;
};
async function convertEntryToPublicFile(
  ctx: QueryCtx,
  entry: Entry
): Promise<PublicFile> {
  // Getting the Metadata from the entry...
  const metadata = entry.metadata as EntryMetadata | undefined;
  const storageId = metadata?.storageId; //getting the storageId to access the stored MetaData
  let fileSize = "unknown";

  if (storageId) {
    try {
      const storageMetadata = await ctx.db.system.get(storageId);
      if (storageMetadata) {
        fileSize = formatFileSize(storageMetadata.size); //getting the format according to the bytes stored...
      }
    } catch (error) {
      console.error("Failed to get storage metadata", error);
    }
  }
  //extracting and processing fileName,extension of that file,status,and url....
  const filename = entry.key || "Unknown";
  const extension = filename.split(".").pop()?.toLowerCase() || "txt";

  let status: "ready" | "processing" | "error" = "error";

  if (entry.status === "ready") {
    status = "ready";
  } else if (entry.status === "pending") {
    status = "processing";
  }

  const url = storageId ? await ctx.storage.getUrl(storageId) : null;
  // returning the data that the user will see on the front-end....(In regards to the file)
  return {
    id: entry.entryId,
    name: filename,
    type: extension,
    size: fileSize,
    status,
    url,
    category: metadata?.category || undefined,
  };
}

// Determining the format of the file on the basis of the bytes given....
function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return "0.0";
  }
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}
