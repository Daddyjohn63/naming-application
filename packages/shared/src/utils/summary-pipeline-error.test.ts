import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  catPhotoBlockAlertTitle,
  catPhotoBlockFallbackMessage,
  resolvePhotoIssueUserMessage,
} from "../constants/cat-photo-validation.ts"
import {
  CAT_PHOTO_LOAD_FAILED_MESSAGE,
  CAT_PHOTO_SUMMARY_FAILED_MESSAGE,
  SUMMARY_PIPELINE_TRANSIENT_ERROR_MESSAGE,
  canReturnToProfileForPhotoReplace,
  classifySummaryPipelineError,
  isPhotoPipelineUserMessage,
  pipelineErrorUsesBackToProfile,
} from "./summary-pipeline-error.ts"

describe("classifySummaryPipelineError", () => {
  it("returns transient when no photo was attached", () => {
    const result = classifySummaryPipelineError({
      error: new Error("Rate limit exceeded"),
      hasPhoto: false,
    })
    assert.equal(result.kind, "transient")
    assert.equal(result.userMessage, SUMMARY_PIPELINE_TRANSIENT_ERROR_MESSAGE)
  })

  it("returns photo when storage URL cannot be resolved", () => {
    const result = classifySummaryPipelineError({
      error: new Error("Photo URL could not be resolved."),
      hasPhoto: true,
    })
    assert.equal(result.kind, "photo")
    assert.equal(result.userMessage, CAT_PHOTO_LOAD_FAILED_MESSAGE)
  })

  it("returns photo when summary is empty with a photo", () => {
    const result = classifySummaryPipelineError({
      error: new Error("The summary came back empty. Please try again."),
      hasPhoto: true,
    })
    assert.equal(result.kind, "photo")
    assert.equal(result.userMessage, CAT_PHOTO_SUMMARY_FAILED_MESSAGE)
  })

  it("returns photo when the error mentions image handling", () => {
    const result = classifySummaryPipelineError({
      error: new Error("Invalid image format for vision model"),
      hasPhoto: true,
    })
    assert.equal(result.kind, "photo")
    assert.equal(result.userMessage, CAT_PHOTO_SUMMARY_FAILED_MESSAGE)
  })

  it("returns transient for generic API errors even when a photo exists", () => {
    const result = classifySummaryPipelineError({
      error: new Error("Service unavailable"),
      hasPhoto: true,
    })
    assert.equal(result.kind, "transient")
    assert.equal(result.userMessage, SUMMARY_PIPELINE_TRANSIENT_ERROR_MESSAGE)
  })
})

describe("resolvePhotoIssueUserMessage", () => {
  it("prefers a non-empty AI userMessage", () => {
    assert.equal(
      resolvePhotoIssueUserMessage({
        userMessage: "This looks like a dog, not a cat.",
        isCat: false,
        isSingleCat: true,
        qualityScore: 2,
      }),
      "This looks like a dog, not a cat.",
    )
  })

  it("falls back to structured copy when userMessage is empty", () => {
    assert.equal(
      resolvePhotoIssueUserMessage({
        userMessage: "   ",
        isCat: true,
        isSingleCat: false,
        qualityScore: 7,
      }),
      catPhotoBlockFallbackMessage({
        isCat: true,
        isSingleCat: false,
        qualityScore: 7,
      }),
    )
  })
})

describe("catPhotoBlockAlertTitle", () => {
  it("uses a multiple-cats title", () => {
    assert.equal(
      catPhotoBlockAlertTitle({
        isCat: true,
        isSingleCat: false,
      }),
      "More than one cat in this photo",
    )
  })

  it("uses a low-quality title", () => {
    assert.equal(
      catPhotoBlockAlertTitle({
        isCat: true,
        isSingleCat: true,
        qualityScore: 4,
      }),
      "Please upload a clearer photo",
    )
  })
})

describe("pipelineErrorUsesBackToProfile", () => {
  it("always uses back to profile during photo validation", () => {
    assert.equal(
      pipelineErrorUsesBackToProfile({
        ceremonyStep: "awaiting_photo_validation",
        summaryGenerationError: "Anything",
      }),
      true,
    )
  })

  it("uses back to profile for known photo messages on summary step", () => {
    assert.equal(
      pipelineErrorUsesBackToProfile({
        ceremonyStep: "awaiting_summary",
        summaryGenerationError: CAT_PHOTO_SUMMARY_FAILED_MESSAGE,
      }),
      true,
    )
  })

  it("uses retry for transient messages on summary step", () => {
    assert.equal(
      pipelineErrorUsesBackToProfile({
        ceremonyStep: "awaiting_summary",
        summaryGenerationError: SUMMARY_PIPELINE_TRANSIENT_ERROR_MESSAGE,
      }),
      false,
    )
  })
})

describe("isPhotoPipelineUserMessage", () => {
  it("recognises canonical photo pipeline copy", () => {
    assert.equal(isPhotoPipelineUserMessage(CAT_PHOTO_LOAD_FAILED_MESSAGE), true)
    assert.equal(isPhotoPipelineUserMessage("Service unavailable"), false)
  })
})

describe("canReturnToProfileForPhotoReplace", () => {
  it("allows idempotent return when already on draft", () => {
    assert.equal(
      canReturnToProfileForPhotoReplace({
        ceremonyStep: "draft",
      }),
      true,
    )
  })

  it("allows return during photo validation", () => {
    assert.equal(
      canReturnToProfileForPhotoReplace({
        ceremonyStep: "awaiting_photo_validation",
      }),
      true,
    )
  })
})
