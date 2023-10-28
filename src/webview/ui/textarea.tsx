import { cn } from "#webview/lib/utils";
import { TextareaHTMLAttributes, forwardRef } from "react";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
    return (
        <textarea
            className={cn(
                "flex min-h-[80px] w-full border border-vscode-input-border bg-vscode-input-background px-3 py-2 text-sm ring-offset-vscode-sideBar-background placeholder:text-vscode-input-placeholderForeground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vscode-focusBorder focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                className,
            )}
            ref={ref}
            {...props}
        />
    );
});
Textarea.displayName = "Textarea";
