import React from "react";
import WorkbookDataWorkbench from "./WorkbookDataWorkbench";
import "./ClcshaDataPage.css";

const ClcshaDataPage = ({ onSourcesUpdated }) => (
  <section className="clcsha-page">
    <div className="clcsha-page-hero">
      <div className="clcsha-page-copy">
        <span className="section-kicker">CLCSHA Data Workspace</span>
        <h1>CLCSHA DB_NCR.xlsx</h1>
        <p>
          Explore the NCR CLCSHA workbook in a dedicated full-width data workspace.
        </p>
      </div>

      <div className="clcsha-page-notes">
        <div className="clcsha-page-note">
          <span>Focused Source</span>
          <strong>CLCSHA NCR Dataset</strong>
        </div>
        <div className="clcsha-page-note">
          <span>Explorer Mode</span>
          <strong>Sheet-aware row browser</strong>
        </div>
      </div>
    </div>

    <WorkbookDataWorkbench
      onSourcesUpdated={onSourcesUpdated}
      title="CLCSHA NCR workbook records"
      description="Browse the uploaded CLCSHA workbook by sheet, search across rows, export filtered results, and replace the source file when a new version is ready."
      sectionKicker="CLCSHA Data Center"
      lockedSourceId="clcsha"
      showHeader={false}
      showSummaryMetrics={false}
      showCombinedAnalytics={false}
      showTopDivisions={false}
    />
  </section>
);

export default ClcshaDataPage;
