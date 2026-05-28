import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-10 w-full rounded-lg border border-input bg-secondary/40 px-3 py-2 text-sm",
                    "text-foreground placeholder:text-muted-foreground",
                    "transition-all duration-200",
                    "hover:border-border/80 hover:bg-secondary/60",
                    "focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary/50 focus:bg-background",
                    "file:border-0 file:bg-transparent file:text-sm file:font-medium",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }
