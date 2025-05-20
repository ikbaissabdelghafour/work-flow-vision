
import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"

import { cn } from "@/lib/utils"

const Toaster = ({ ...props }) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group glass-effect animate-scale-in toast group-[.toaster]:bg-background/80 group-[.toaster]:backdrop-blur-md group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-gradient-blue group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toaster]:border-l-4 group-[.toaster]:border-l-green-500",
          error: "group-[.toaster]:border-l-4 group-[.toaster]:border-l-red-500",
          info: "group-[.toaster]:border-l-4 group-[.toaster]:border-l-blue-500",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
