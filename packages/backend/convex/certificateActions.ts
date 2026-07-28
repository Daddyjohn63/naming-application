"use node"

/**
 * Certificate upload registration — PDF magic / size checks need Node storage reads.
 */

import { ConvexError, v } from "convex/values"

import {
  MAX_CERTIFICATE_PDF_BYTES,
  bufferLooksLikePdf,
} from "@workspace/shared/constants/certificate"
import { STAGED_NAMING_ERROR_CODE } from "@workspace/shared/constants/staged-naming-errors"

import { api, internal } from "./_generated/api"
import { action } from "./_generated/server"

/**
 * After the client uploads a certificate PDF, validate bytes and bind the blob
 * to `{ userId, catId }` on the upload ledger (SECURITY.md M3).
 */
export const registerCertificateUpload = action({
  args: {
    catId: v.string(),
    storageId: v.id("_storage"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (identity === null) {
      throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.NOT_AUTHENTICATED })
    }

    const user = await ctx.runQuery(api.users.current, {})
    if (user === null) {
      throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.NOT_AUTHENTICATED })
    }

    const cat = await ctx.runQuery(api.cats.getCatByIdForOwner, {
      catId: args.catId,
    })
    if (cat === null) {
      throw new ConvexError({ code: STAGED_NAMING_ERROR_CODE.NOT_FOUND })
    }

    const blob = await ctx.storage.get(args.storageId)
    if (blob === null) {
      throw new ConvexError({
        code: STAGED_NAMING_ERROR_CODE.INVALID_CERTIFICATE_UPLOAD,
      })
    }
    if (blob.size > MAX_CERTIFICATE_PDF_BYTES) {
      throw new ConvexError({
        code: STAGED_NAMING_ERROR_CODE.INVALID_CERTIFICATE_UPLOAD,
      })
    }

    const bytes = new Uint8Array(await blob.arrayBuffer())
    if (!bufferLooksLikePdf(bytes)) {
      throw new ConvexError({
        code: STAGED_NAMING_ERROR_CODE.INVALID_CERTIFICATE_UPLOAD,
      })
    }

    await ctx.runMutation(internal.certificate.recordCertificateUpload, {
      userId: user._id,
      catId: cat._id,
      storageId: args.storageId,
    })

    return null
  },
})
