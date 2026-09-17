type PaginationProps = {
	page: number;
	pageSize: number;
	total: number;
	onPageChange: (page: number) => void;
};

export function Pagination({
	page,
	pageSize,
	total,
	onPageChange,
}: PaginationProps) {
	const pageCount = Math.ceil(total / pageSize);
	if (pageCount < 2) return null;

	return (
		<nav className="pagination" aria-label="Pagination">
			<button
				className="page-arrow"
				type="button"
				aria-label="Previous page"
				disabled={page === 1}
				onClick={() => onPageChange(page - 1)}
			>
				‹
			</button>
			{Array.from({ length: pageCount }, (_, index) => index + 1).map(
				(pageNumber) => (
					<button
						key={pageNumber}
						type="button"
						className={`pagination-page ${pageNumber === page ? "active" : ""}`}
						aria-current={pageNumber === page ? "page" : undefined}
						onClick={() => onPageChange(pageNumber)}
					>
						{pageNumber}
					</button>
				),
			)}
			<button
				className="page-arrow"
				type="button"
				aria-label="Next page"
				disabled={page === pageCount}
				onClick={() => onPageChange(page + 1)}
			>
				›
			</button>
		</nav>
	);
}
