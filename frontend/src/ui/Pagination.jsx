import Button from "./Button";

export default function Pagination({ page, totalPages, onPageChange, style }) {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
        marginTop: 16,
        ...style,
      }}
    >
      <div style={{ fontSize: 12, color: "rgba(236,241,243,0.62)" }}>
        Page {page} of {totalPages}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <Button
          variant="surface"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Prev
        </Button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map(
          (pageNumber) => (
            <Button
              key={pageNumber}
              variant={pageNumber === page ? "primary" : "surface"}
              size="sm"
              onClick={() => onPageChange(pageNumber)}
              aria-current={pageNumber === page ? "page" : undefined}
            >
              {pageNumber}
            </Button>
          ),
        )}
        <Button
          variant="surface"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
