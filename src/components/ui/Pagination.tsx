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

	const pageNumbers = Array.from(
		{ length: pageCount },
		(_, index) => index + 1,
	);
	const isFirstPage = page === 1;
	const isLastPage = page === pageCount;

	return (
		<nav className="pagination" aria-label="Pagination">
			<button
				className="page-arrow"
				type="button"
				aria-label="Previous page"
				disabled={isFirstPage}
				onClick={() => onPageChange(page - 1)}
			>
				‹
			</button>
			{pageNumbers.map((pageNumber) => {
				const isCurrentPage = pageNumber === page;
				return (
					<button
						key={pageNumber}
						type="button"
						className={`pagination-page ${isCurrentPage ? "active" : ""}`}
						aria-current={isCurrentPage ? "page" : undefined}
						onClick={() => onPageChange(pageNumber)}
					>
						{pageNumber}
					</button>
				);
			})}
			<button
				className="page-arrow"
				type="button"
				aria-label="Next page"
				disabled={isLastPage}
				onClick={() => onPageChange(page + 1)}
			>
				›
			</button>
		</nav>
	);
}
