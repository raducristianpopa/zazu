import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cn } from '#webview/lib/utils';
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react';

export const Separator = forwardRef<
	ElementRef<typeof SeparatorPrimitive.Root>,
	ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
	(
		{ className, orientation = 'horizontal', decorative = true, ...props },
		ref
	) => (
		<SeparatorPrimitive.Root
			ref={ref}
			decorative={decorative}
			orientation={orientation}
			className={cn(
				'shrink-0 bg-vscode-sideBar-border',
				orientation === 'horizontal'
					? 'h-[2px] w-full'
					: 'h-full w-[2px]',
				className
			)}
			{...props}
		/>
	)
);
Separator.displayName = SeparatorPrimitive.Root.displayName;
