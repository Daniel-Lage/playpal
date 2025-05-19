import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "~/lib/utils";

const buttonVariants = cva(
  "p-2 inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:backdrop-brightness-95",
        login:
          "bg-primary-accent hover:brightness-95 absolute self-center rounded-full md:relative",
        link: "text-primary underline-offset-4 hover:underline",
        play: "rounded-full bg-secondary p-4 hover:brightness-95",
      },
      size: {
        select:
          "w-[200px] h-9 justify-between font-bold [&_svg]:size-6 p-0 px-2",
        nav: "h-12 w-12 justify-center p-0 md:h-14 md:w-full md:pl-4 [&_svg]:size-8 md:justify-start",
        icon: "h-9 w-9 justify-center p-0 [&_svg]:size-6 shrink-0",
        bigicon: "h-12 w-12 justify-center p-0 [&_svg]:size-8 shrink-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "icon",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
