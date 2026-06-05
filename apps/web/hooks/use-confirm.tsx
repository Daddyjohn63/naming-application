/**
 * useConfirm Hook
 *
 * A powerful and reusable hook that creates a confirmation dialog with a Promise-based API.
 * This hook is particularly useful for actions that require user confirmation before proceeding,
 * such as deletions, expensive operations, or actions that can't be undone.
 *
 * Key benefits:
 * 1. Promise-based API makes it easy to use with async/await
 * 2. Encapsulates all dialog state management
 * 3. Provides a consistent confirmation UX across the application
 * 4. Responsive design works on both desktop and mobile
 * 5. Fully accessible with keyboard navigation
 *
 * Usage example:
 * ```tsx
 * const [ShowConfirm, confirm] = useConfirm("Delete item?", "This cannot be undone");
 *
 * const handleDelete = async () => {
 *   const confirmed = await confirm();
 *   if (confirmed) {
 *     // Proceed with deletion
 *   }
 * };
 * ```
 */

import { useState, type JSX } from "react"

import { Button } from "@workspace/ui/components/button"
import { ResponsiveDialog } from "@/components/ResponsiveDialog"

export const useConfirm = (
  title: string,
  description: string
): [() => JSX.Element, () => Promise<boolean>] => {
  // State to store the Promise resolver function
  // When null, the dialog is closed
  const [promise, setPromise] = useState<{
    resolve: (value: boolean) => void
  } | null>(null)

  /**
   * Creates a new Promise and stores its resolver function in state
   * This effectively opens the dialog and waits for user interaction
   */
  const confirm = (): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setPromise({ resolve })
    })
  }

  /**
   * Closes the dialog by clearing the Promise resolver from state
   * This is called after both confirmation and cancellation
   */
  const handleClose = () => {
    setPromise(null)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      promise?.resolve(false)
      handleClose()
    }
  }

  /**
   * Resolves the Promise with true when user confirms
   * This triggers the awaiting code to proceed with its action
   */
  const handleConfirm = () => {
    promise?.resolve(true)
    handleClose()
  }

  /**
   * Resolves the Promise with false when user cancels
   * This allows the awaiting code to handle the cancellation case
   */
  const handleCancel = () => {
    promise?.resolve(false)
    handleClose()
  }

  /**
   * The actual dialog component that will be rendered
   * Uses ResponsiveDialog for a mobile-friendly layout
   * Dialog is only shown when promise is not null (i.e., when confirm() is called)
   */

  //function component to render the dialog. we can return this as a component in the page which we call the hook in.
  const ConfirmationDialog = () => (
    <ResponsiveDialog
      open={promise !== null}
      onOpenChange={handleOpenChange}
      title={title}
      description={description}
    >
      <div className="flex w-full flex-col-reverse items-center justify-end gap-x-2 gap-y-2 pt-4 lg:flex-row">
        <Button
          type="button"
          onClick={handleCancel}
          variant="outline"
          className="w-full lg:w-auto"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleConfirm}
          variant="default"
          className="w-full lg:w-auto"
        >
          Confirm
        </Button>
      </div>
    </ResponsiveDialog>
  )

  // Returns both the dialog component and the confirm function
  // The component must be rendered somewhere in the component tree
  // The confirm function is called to trigger the confirmation flow
  return [ConfirmationDialog, confirm]
}
