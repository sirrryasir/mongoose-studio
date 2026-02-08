"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
    return (
        <Sonner
            theme="dark"
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast:
                        "group toast group-[.toaster]:!bg-zinc-900 group-[.toaster]:text-zinc-50 group-[.toaster]:border-zinc-800 group-[.toaster]:shadow-lg font-sans",
                    description: "group-[.toast]:text-zinc-400",
                    actionButton:
                        "group-[.toast]:!bg-emerald-600 group-[.toast]:!text-zinc-50",
                    cancelButton:
                        "group-[.toast]:!bg-zinc-800 group-[.toast]:!text-zinc-300",
                    error: "group-[.toast]:!bg-red-950/50 group-[.toast]:!text-red-400 group-[.toast]:!border-red-900",
                    info: "group-[.toast]:!bg-blue-950/50 group-[.toast]:!text-blue-400 group-[.toast]:!border-blue-900",
                    warning: "group-[.toast]:!bg-yellow-950/50 group-[.toast]:!text-yellow-400 group-[.toast]:!border-yellow-900",
                    success: "group-[.toast]:!bg-emerald-950/50 group-[.toast]:!text-emerald-400 group-[.toast]:!border-emerald-500",
                },
            }}
            {...props}
        />
    )
}

export { Toaster }
