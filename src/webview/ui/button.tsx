import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '#webview/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

const buttonVariants = cva(
	'inline-flex items-center focus:outline-none justify-center text-sm font-medium transition-colors focus-visible:ring-1 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
	{
		variants: {
			variant: {
				default:
					'bg-vscode-button-background hover:text-vscode-button-foreground text-vscode-button-foreground shadow hover:bg-vscode-button-hoverBackground focus-visible:ring-vscode-button-background ring-offset-vscode-sideBar-background',
				secondary:
					'bg-vscode-button-secondaryBackground hover:text-vscode-button-secondaryForeground text-vscode-button-secondaryForeground shadow hover:bg-vscode-button-secondaryHoverBackground focus-visible:ring-vscode-button-secondaryBackground ring-offset-vscode-sideBar-background',
				destructive:
					'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90'
			},
			size: {
				default: 'h-9 px-4 py-2',
				sm: 'h-8 px-3 text-xs',
				lg: 'h-10 px-8',
				icon: 'h-9 w-9'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'default'
		}
	}
);

export interface ButtonProps
	extends ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : 'button';
		return (
			<Comp
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				{...props}
			/>
		);
	}
);
Button.displayName = 'Button';
