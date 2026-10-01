import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { filterBlogPosts } from "./filter-posts.ts"
import { markdownToPlainText } from "./markdown-plain-text.ts"

const posts = [
  {
    title: "Your cat already has three names",
    subtitle: "the ineffable one",
    excerpt: "Every cat is owed three names.",
    plainText: markdownToPlainText(
      "## What the three names are for\n\nFond of the windowsill."
    ),
    categories: [{ label: "Naming" }, { label: "Guides" }],
  },
  {
    title: "Keep the name they already answer to",
    excerpt: "A household nickname can stay.",
    plainText: "Bring the nickname with you.",
    categories: [{ label: "Naming" }],
  },
]

describe("filterBlogPosts", () => {
  it("matches a term inside a word", () => {
    const matches = filterBlogPosts(posts, "name")
    assert.equal(matches.length, 2)
  })

  it("requires every term", () => {
    const matches = filterBlogPosts(posts, "windowsill guides")
    assert.deepEqual(
      matches.map((post) => post.title),
      ["Your cat already has three names"]
    )
  })

  it("matches a subtitle, an excerpt, a body word, and a category", () => {
    assert.equal(filterBlogPosts(posts, "ineffable").length, 1)
    assert.equal(filterBlogPosts(posts, "nickname").length, 1)
    assert.equal(filterBlogPosts(posts, "windowsill").length, 1)
    assert.equal(filterBlogPosts(posts, "Guides").length, 1)
  })

  it("does not match a markdown heading marker on its own", () => {
    assert.equal(filterBlogPosts(posts, "##").length, 0)
  })

  it("returns every post for an empty query", () => {
    assert.equal(filterBlogPosts(posts, "   ").length, posts.length)
  })
})

describe("markdownToPlainText", () => {
  it("drops heading markers and keeps the heading words", () => {
    assert.equal(
      markdownToPlainText("## What the three names are for"),
      "What the three names are for"
    )
  })
})
