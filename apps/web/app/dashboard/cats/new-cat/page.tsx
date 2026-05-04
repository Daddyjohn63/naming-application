"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { api } from "@workspace/backend/_generated/api"
import {
  catCreateFieldsSchema,
  type CatCreateFields,
  type CatCreateFieldsInput,
} from "@workspace/shared/schemas/cat"
import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { toast } from "@workspace/ui/components/sonner"
import { Textarea } from "@workspace/ui/components/textarea"
import { useMutation } from "convex/react"
import { Controller, useForm } from "react-hook-form"

export default function NewCatPage() {
  const createCat = useMutation(api.cats.createCat)

  const form = useForm<CatCreateFieldsInput, unknown, CatCreateFields>({
    resolver: zodResolver(catCreateFieldsSchema),
    defaultValues: {
      title: "",
      description: "",
      slug: "",
    },
  })

  async function onSubmit(values: CatCreateFields) {
    try {
      await createCat({
        title: values.title,
        description: values.description,
        slug: values.slug,
      })
      toast.success("Cat profile created.")
      form.reset()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create cat.")
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg">
      <FieldSet>
        <FieldLegend>New cat</FieldLegend>
        <FieldDescription>
          Try the shared Zod schema, React Hook Form, and Field components. You
          must be signed in so Convex can attach the profile to your account.
        </FieldDescription>
        <form
          className="mt-4"
          onSubmit={form.handleSubmit(onSubmit)}
          id="form-new-cat"
        >
          <FieldGroup>
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid ? true : undefined}
                >
                  <FieldLabel htmlFor="new-cat-title">Name</FieldLabel>
                  <Input
                    {...field}
                    id="new-cat-title"
                    autoComplete="off"
                    placeholder="e.g. Whiskers"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>
                    How this cat appears in your list (maps to{" "}
                    <code className="text-xs">title</code> in the schema).
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid ? true : undefined}
                >
                  <FieldLabel htmlFor="new-cat-description">
                    About this cat
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="new-cat-description"
                    rows={4}
                    placeholder="Personality, quirks, things to know for naming…"
                    aria-invalid={fieldState.invalid}
                    className="min-h-24 resize-y"
                  />
                  <FieldDescription>
                    Required by the schema today; use a short line if you are
                    only testing the name field.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="slug"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid ? true : undefined}
                >
                  <FieldLabel htmlFor="new-cat-slug">
                    URL slug (optional)
                  </FieldLabel>
                  <Input
                    {...field}
                    id="new-cat-slug"
                    autoComplete="off"
                    placeholder="e.g. whiskers"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>
                    Lowercase letters, numbers, and hyphens only. Leave empty
                    to skip.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          <Field orientation="horizontal" className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={form.formState.isSubmitting}
            >
              Reset
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving…" : "Create cat"}
            </Button>
          </Field>
        </form>
      </FieldSet>
    </div>
  )
}
