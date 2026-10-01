import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  BlogSlugError,
  assertUniquePostSlugs,
  resolveCategoryLabels,
  slugify,
} from "./blog-slug.ts"

describe("slugify", () => {
  it("lowercases, strips punctuation, and keeps hyphens between words", () => {
    assert.equal(slugify("Naming Your First Cat!"), "naming-your-first-cat")
  })

  it("strips diacritics and turns & into and", () => {
    assert.equal(slugify("Crème brûlée & café"), "creme-brulee-and-cafe")
  })

  it("collapses extra punctuation into one hyphen", () => {
    assert.equal(slugify("Hello... world!!"), "hello-world")
  })

  it("cuts a long slug on the last hyphen before 80 characters", () => {
    const value = `${"a".repeat(70)}-${"b".repeat(20)}`
    assert.equal(slugify(value), "a".repeat(70))
    assert.ok(slugify(value).length <= 80)
  })

  it("cuts at 80 characters when there is no hyphen", () => {
    assert.equal(slugify("a".repeat(90)), "a".repeat(80))
  })

  it("keeps a slug that is already 80 characters", () => {
    assert.equal(slugify("a".repeat(80)), "a".repeat(80))
  })

  it("throws when the derivation is empty", () => {
    assert.throws(() => slugify("!!!"), BlogSlugError)
    assert.throws(() => slugify("   "), BlogSlugError)
  })
})

describe("assertUniquePostSlugs", () => {
  it("names both files when two posts share a slug", () => {
    assert.throws(
      () =>
        assertUniquePostSlugs([
          { slug: "naming-your-first-cat", source: "content/blog/a.md" },
          { slug: "naming-your-first-cat", source: "content/blog/b.md" },
        ]),
      (error: unknown) => {
        assert.ok(error instanceof BlogSlugError)
        assert.match(error.message, /content\/blog\/a\.md/)
        assert.match(error.message, /content\/blog\/b\.md/)
        return true
      }
    )
  })

  it("rejects the reserved slug category", () => {
    assert.throws(
      () =>
        assertUniquePostSlugs([
          { slug: "category", source: "content/blog/category.md" },
        ]),
      (error: unknown) => {
        assert.ok(error instanceof BlogSlugError)
        assert.match(error.message, /content\/blog\/category\.md/)
        assert.match(error.message, /category/)
        return true
      }
    )
  })

  it("allows distinct slugs", () => {
    assert.doesNotThrow(() =>
      assertUniquePostSlugs([
        { slug: "one", source: "content/blog/one.md" },
        { slug: "two", source: "content/blog/two.md" },
      ])
    )
  })
})

describe("resolveCategoryLabels", () => {
  it("collapses labels that differ only by case or repeated spaces", () => {
    const categories = resolveCategoryLabels([
      { label: "Naming", source: "content/blog/a.md" },
      { label: "naming", source: "content/blog/b.md" },
      { label: "Naming   guides", source: "content/blog/a.md" },
      { label: "naming guides", source: "content/blog/c.md" },
    ])

    assert.deepEqual(categories, [
      { label: "Naming", slug: "naming" },
      { label: "Naming guides", slug: "naming-guides" },
    ])
  })

  it("fails when different spellings share a slug", () => {
    assert.throws(
      () =>
        resolveCategoryLabels([
          { label: "Cat Names", source: "content/blog/a.md" },
          { label: "Cat-Names", source: "content/blog/b.md" },
        ]),
      (error: unknown) => {
        assert.ok(error instanceof BlogSlugError)
        assert.match(error.message, /content\/blog\/a\.md/)
        assert.match(error.message, /content\/blog\/b\.md/)
        assert.match(error.message, /cat-names/)
        return true
      }
    )
  })
})
