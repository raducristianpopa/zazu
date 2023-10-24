import { cn } from '#webview/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { HTMLAttributes } from 'react';

const badgeVariants = cva(
	'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
	{
		variants: {
			variant: {
				default:
					'border-transparent bg-vscode-badge-background text-vscode-badge-foreground',
				ghost: 'border-0 text-vscode-badge-foreground'
			}
		},
		defaultVariants: {
			variant: 'default'
		}
	}
);

export interface BadgeProps
	extends HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof badgeVariants> {}

export const Badge = ({ className, variant, ...props }: BadgeProps) => {
	return (
		<div className={cn(badgeVariants({ variant }), className)} {...props} />
	);
};
