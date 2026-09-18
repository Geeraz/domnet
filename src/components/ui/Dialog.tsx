import type { ReactNode } from "react";

type DialogProps = {
	onClose: () => void;
	title: string;
	children: ReactNode;
	footer?: ReactNode;
	size?: "small";
};

export function Dialog({
	onClose,
	title,
	children,
	footer,
	size,
}: DialogProps) {
	const dialogClassName = size ? `dialog ${size}` : "dialog";

	return (
		<div className="dialog-backdrop">
			<section
				className={dialogClassName}
				role="dialog"
				aria-modal="true"
				aria-label={title}
			>
				<header className="dialog-header">
					<h2 className="dialog-title">{title}</h2>
					<button
						className="dialog-close"
						type="button"
						aria-label="Close dialog"
						onClick={onClose}
					>
						×
					</button>
				</header>
				<div className="dialog-body">{children}</div>
				{footer ? <footer className="dialog-footer">{footer}</footer> : null}
			</section>
		</div>
	);
}
