import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

type BoundingBox = {
  pageNumber: number;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

const dummyBoundingBoxes: BoundingBox[] = [
  {
    pageNumber: 3,
    label: "Title",
    x: 80,
    y: 90,
    width: 300,
    height: 50,
  },
  {
    pageNumber: 3,
    label: "Paragraph",
    x: 90,
    y: 180,
    width: 550,
    height: 100,
  },
  {
    pageNumber: 4,
    label: "Page 2 Box",
    x: 100,
    y: 120,
    width: 400,
    height: 80,
  },
];

export default function PdfViewer() {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const pageWidth = 800;

  function handleDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    setCurrentPage(1);
  }

  function handleDocumentLoadError(error: Error): void {
    console.error("PDF load error:", error);
  }

  function goToPreviousPage(): void {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  }

  function goToNextPage(): void {
    if (!numPages) return;

    setCurrentPage((prevPage) => Math.min(prevPage + 1, numPages));
  }

  const currentPageBoxes = dummyBoundingBoxes.filter(
    (box) => box.pageNumber === currentPage
  );

  return (
    <div style={styles.viewer}>
      <h2>PDF Viewer with Pagination and Bounding Boxes</h2>

      <div style={styles.controls}>
        <button
          onClick={goToPreviousPage}
          disabled={currentPage <= 1}
          style={styles.button}
        >
          Previous
        </button>

        <span style={styles.pageText}>
          Page {currentPage} {numPages ? `of ${numPages}` : ""}
        </span>

        <button
          onClick={goToNextPage}
          disabled={!numPages || currentPage >= numPages}
          style={styles.button}
        >
          Next
        </button>
      </div>

      <Document
        file="/sample.pdf"
        onLoadSuccess={handleDocumentLoadSuccess}
        onLoadError={handleDocumentLoadError}
        loading={<p>Loading PDF...</p>}
        error={<p>Failed to load PDF. Check console.</p>}




      >
        <PdfPageWithOverlay
          pageNumber={currentPage}
          pageWidth={pageWidth}
          boxes={currentPageBoxes}
        />
      </Document>
    </div>
  );
}

type PdfPageWithOverlayProps = {
  pageNumber: number;
  pageWidth: number;
  boxes: BoundingBox[];
};

function PdfPageWithOverlay({
  pageNumber,
  pageWidth,
  boxes,
}: PdfPageWithOverlayProps) {
  const [pageHeight, setPageHeight] = useState<number | null>(null);

  function handlePageRenderSuccess(page: any): void {
    const viewport = page.getViewport({ scale: 1 });
    const scale = pageWidth / viewport.width;
    const calculatedHeight = viewport.height * scale;

    setPageHeight(calculatedHeight);
  }

  return (
    <div style={styles.pageShell}>
      <div
        style={{
          ...styles.pageWrapper,
          width: pageWidth,
          height: pageHeight ?? "auto",
        }}
      >
        <Page
          pageNumber={pageNumber}
          width={pageWidth}
          renderTextLayer={true}
          renderAnnotationLayer={true}
          onRenderSuccess={handlePageRenderSuccess}
        />

        {pageHeight && (
          <svg
            style={styles.overlay}
            width={pageWidth}
            height={pageHeight}
            viewBox={`0 0 ${pageWidth} ${pageHeight}`}
          >
            {boxes.map((box, index) => (
              <g key={`${box.label}-${index}`}>
                <rect
                  x={box.x}
                  y={box.y}
                  width={box.width}
                  height={box.height}
                  fill="rgba(0, 132, 255, 0.15)"
                  stroke="rgba(0, 132, 255, 0.95)"
                  strokeWidth="2"
                />

                <text
                  x={box.x}
                  y={box.y - 6}
                  fontSize="14"
                  fill="rgba(0, 80, 180, 1)"
                >
                  {box.label}
                </text>
              </g>
            ))}
          </svg>
        )}
      </div>
    </div>
  );
}

const styles: {
  viewer: React.CSSProperties;
  controls: React.CSSProperties;
  button: React.CSSProperties;
  pageText: React.CSSProperties;
  pageShell: React.CSSProperties;
  pageWrapper: React.CSSProperties;
  overlay: React.CSSProperties;
} = {
  viewer: {
    minHeight: "100vh",
    background: "#f3f4f6",
    padding: "32px",
  },
  controls: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
    marginBottom: "24px",
  },
  button: {
    padding: "8px 16px",
    cursor: "pointer",
  },
  pageText: {
    fontSize: "16px",
    fontWeight: 500,
  },
  pageShell: {
    marginBottom: "32px",
    display: "flex",
    justifyContent: "center",
  },
  pageWrapper: {
    position: "relative",
    background: "white",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    pointerEvents: "none",
    zIndex: 10,
  },
};