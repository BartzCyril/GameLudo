import {ComponentProps} from "react";

type ButtonProps = ComponentProps<"button"> & {
    variant?: "primary" | "secondary" | "roll"
}

const variants = {
    primary: "btn btn--primary",
    secondary: "btn btn--secondary",
    roll: "btn btn--primary btn--roll",
}

export function Button({variant = "primary", ...props}: ButtonProps) {
    return <button type="button" className={variants[variant]} {...props}/>;
}
