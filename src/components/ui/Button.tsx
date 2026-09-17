import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "secondary" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: ButtonVariant;
	size?: "small";
	loading?: boolean;
};

export function Button({
	variant,
	size,
	loading = false,
	className = "",
	type = "button",
	disabled = false,
	...props
}: ButtonProps) {
	const classes = [
		"button",
		variant ?? "",
		size === "small" ? "small" : "",
		loading ? "loading" : "",
		className,
	]
		.filter(Boolean)
		.join(" ");

	return (
		<button
			type={type}
			className={classes}
			disabled={loading || disabled}
			{...props}
		/>
	);
}
