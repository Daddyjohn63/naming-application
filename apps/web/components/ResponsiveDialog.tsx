"use client"

import { useIsMobile } from "@/hooks/use-mobile"
//import { useIsMobile } from "~/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@workspace/ui/components/drawer"
import { cn } from "@workspace/ui/lib/utils"

import { dataComponent } from "@/lib/data-component"

interface ResponsiveDialogProps {
  title: string
  description?: string
  children: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
  className?: string
  centerHeader?: boolean // Optional: centers header content (default: false)
}

export const ResponsiveDialog = ({
  title,
  description,
  children,
  open,
  onOpenChange,
  className,
  centerHeader = false,
}: ResponsiveDialogProps) => {
  const isMobile = useIsMobile()

  // Header className based on centerHeader prop
  const headerClassName = centerHeader
    ? "flex flex-col items-center justify-center text-center"
    : undefined

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent
          {...dataComponent("ResponsiveDialog")}
          className={cn("bg-white", className)}
        >
          <DrawerHeader className={headerClassName}>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <div className="p-4">{children}</div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        {...dataComponent("ResponsiveDialog")}
        className={cn("bg-white", className)}
      >
        <DialogHeader className={headerClassName}>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
