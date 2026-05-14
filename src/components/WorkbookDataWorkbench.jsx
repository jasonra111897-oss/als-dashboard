import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  exportDataSourceRows,
  fetchDataSourceAnalytics,
  fetchDataSourceRows,
  fetchDataSources,
  uploadDataSourceFile,
} from "../services/dataService";
import { formatNumber } from "../utils/formatters";
import "./WorkbookDataWorkbench.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DEFAULT_QUERY = {
  sourceId: "all",
  sheetName: "all",
  search: "",
  sortBy: "_source",
  sortDir: "asc",
  page: 1,
  pageSize: 10,
  dedupe: true,
};

const buildInitialQuery = (lockedSourceId) => ({
  ...DEFAULT_QUERY,
  sourceId: lockedSourceId || DEFAULT_QUERY.sourceId,
});

const WorkbookDataWorkbench = ({
  onSourcesUpdated,
  title = "Manage multiple Excel data sources",
  description = "Upload, compare, and explore both workbook databases without disrupting the current ALS dashboard views.",
  sectionKicker = "Workbook Data Center",
  lockedSourceId = "",
  showHeader = true,
  showSourceCards = true,
  showCombinedAnalytics = true,
  showTopDivisions = true,
  showSummaryMetrics = true,
}) => {
  const [sourcesPayload, setSourcesPayload] = useState({ sources: [], summary: null });
  const [analytics, setAnalytics] = useState(null);
  const [rowsPayload, setRowsPayload] = useState({
    rows: [],
    columns: [],
    sourceOptions: [],
    sheetOptions: [],
    totalRows: 0,
    totalPages: 0,
    page: 1,
    pageSize: DEFAULT_QUERY.pageSize,
  });
  const [query, setQuery] = useState(() => buildInitialQuery(lockedSourceId));
  const [isSourcesLoading, setIsSourcesLoading] = useState(true);
  const [isRowsLoading, setIsRowsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");
  const [uploadState, setUploadState] = useState({});
  const fileInputsRef = useRef({});

  useEffect(() => {
    setQuery((previous) => ({
      ...previous,
      sourceId: lockedSourceId || previous.sourceId || DEFAULT_QUERY.sourceId,
      sheetName: "all",
      page: 1,
    }));
  }, [lockedSourceId]);

  const refreshSources = async () => {
    const [sourceData, analyticsData] = await Promise.all([
      fetchDataSources(),
      fetchDataSourceAnalytics(),
    ]);
    setSourcesPayload(sourceData);
    setAnalytics(analyticsData);
  };

  useEffect(() => {
    let ignore = false;

    const run = async () => {
      try {
        setIsSourcesLoading(true);
        setError("");
        const [sourceData, analyticsData] = await Promise.all([
          fetchDataSources(),
          fetchDataSourceAnalytics(),
        ]);

        if (!ignore) {
          setSourcesPayload(sourceData);
          setAnalytics(analyticsData);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Unable to load workbook data sources.");
        }
      } finally {
        if (!ignore) {
          setIsSourcesLoading(false);
        }
      }
    };

    run();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    const run = async () => {
      try {
        setIsRowsLoading(true);
        setError("");
        const payload = await fetchDataSourceRows(query);

        if (!ignore) {
          setRowsPayload(payload);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Unable to load workbook rows.");
        }
      } finally {
        if (!ignore) {
          setIsRowsLoading(false);
        }
      }
    };

    run();

    return () => {
      ignore = true;
    };
  }, [query]);

  const sourceCards = useMemo(() => sourcesPayload.sources || [], [sourcesPayload.sources]);
  const visibleSourceCards = useMemo(
    () => (lockedSourceId ? sourceCards.filter((source) => source.id === lockedSourceId) : sourceCards),
    [lockedSourceId, sourceCards]
  );
  const combinedSummary = useMemo(
    () => sourcesPayload.summary || analytics || {},
    [analytics, sourcesPayload.summary]
  );
  const effectiveSummary = useMemo(() => {
    if (!lockedSourceId) {
      return combinedSummary;
    }

    const selectedSource = visibleSourceCards[0];

    if (!selectedSource) {
      return {
        activeSources: 0,
        totalSheets: 0,
        totalRows: 0,
        dedupedRows: 0,
      };
    }

    return {
      activeSources: selectedSource.status === "ready" ? 1 : 0,
      totalSheets: selectedSource.sheetCount || 0,
      totalRows: selectedSource.totalRows || 0,
      dedupedRows: selectedSource.dedupedRecordCount || selectedSource.parsedRecordCount || 0,
    };
  }, [combinedSummary, lockedSourceId, visibleSourceCards]);

  const chartData = useMemo(() => {
    if (!visibleSourceCards.length) {
      return null;
    }

    return {
      labels: visibleSourceCards.map((source) => source.label),
      datasets: [
        {
          label: "Parsed Rows",
          data: visibleSourceCards.map((source) => source.totalRows || 0),
          backgroundColor: visibleSourceCards.map((_, index) =>
            ["rgba(220, 38, 38, 0.72)", "rgba(34, 197, 94, 0.72)", "rgba(37, 99, 235, 0.72)"][
              index % 3
            ]
          ),
          borderColor: visibleSourceCards.map((_, index) =>
            ["rgba(220, 38, 38, 1)", "rgba(34, 197, 94, 1)", "rgba(37, 99, 235, 1)"][index % 3]
          ),
          borderWidth: 1.5,
          borderRadius: 12,
          maxBarThickness: 68,
        },
      ],
    };
  }, [visibleSourceCards]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "Workbook row volume by source",
          color: "#10213d",
          font: { size: 16, weight: "700" },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => formatNumber(value),
          },
          grid: { color: "rgba(15, 23, 42, 0.08)" },
        },
        x: {
          grid: { display: false },
        },
      },
    }),
    []
  );

  const visibleSheetOptions = useMemo(() => {
    if (query.sourceId === "all") {
      return [];
    }

    return rowsPayload.sheetOptions || [];
  }, [query.sourceId, rowsPayload.sheetOptions]);

  const handleQueryChange = (updates) => {
    setQuery((previous) => ({
      ...previous,
      ...updates,
      page: updates.page ?? 1,
    }));
  };

  const openFilePicker = (sourceId) => {
    fileInputsRef.current[sourceId]?.click();
  };

  const handleUpload = async (sourceId, file) => {
    if (!file) {
      return;
    }

    try {
      setUploadState((previous) => ({
        ...previous,
        [sourceId]: { progress: 0, status: "uploading", error: "" },
      }));

      await uploadDataSourceFile({
        sourceId,
        file,
        onProgress: (progress) => {
          setUploadState((previous) => ({
            ...previous,
            [sourceId]: { progress, status: "uploading", error: "" },
          }));
        },
      });

      await refreshSources();
      const refreshedRows = await fetchDataSourceRows({
        ...query,
        sourceId: lockedSourceId || query.sourceId,
      });
      setRowsPayload(refreshedRows);
      setUploadState((previous) => ({
        ...previous,
        [sourceId]: { progress: 100, status: "done", error: "" },
      }));
      onSourcesUpdated?.();
    } catch (err) {
      setUploadState((previous) => ({
        ...previous,
        [sourceId]: {
          progress: previous[sourceId]?.progress || 0,
          status: "error",
          error: err.message || "Upload failed.",
        },
      }));
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const blob = await exportDataSourceRows(query);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `als-data-${query.sourceId}-${query.sheetName}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Unable to export filtered rows.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section className={`workbook-hub ${showHeader ? "" : "workbook-hub-compact"}`.trim()}>
      {showHeader ? (
        <div className="workbook-hub-header">
          <div>
            <span className="section-kicker">{sectionKicker}</span>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
        </div>
      ) : null}

      {error ? <div className="workbook-hub-error">{error}</div> : null}

      {showSummaryMetrics ? (
        <div className="workbook-hub-metrics">
          <div className="workbook-hub-metric">
            <span>Active Sources</span>
            <strong>{formatNumber(effectiveSummary.activeSources || 0)}</strong>
          </div>
          <div className="workbook-hub-metric">
            <span>Total Sheets</span>
            <strong>{formatNumber(effectiveSummary.totalSheets || 0)}</strong>
          </div>
          <div className="workbook-hub-metric">
            <span>Parsed Rows</span>
            <strong>{formatNumber(effectiveSummary.totalRows || 0)}</strong>
          </div>
          <div className="workbook-hub-metric">
            <span>Deduped Records</span>
            <strong>{formatNumber(effectiveSummary.dedupedRows || 0)}</strong>
          </div>
        </div>
      ) : null}

      {showSourceCards ? (
        <div className="workbook-source-grid">
          {visibleSourceCards.map((source) => {
            const state = uploadState[source.id] || {};
            const isUploading = state.status === "uploading";

            return (
              <article key={source.id} className="workbook-source-card">
                <div className="workbook-source-copy">
                  <span className="section-kicker">{source.label}</span>
                  <h3>{source.fileName}</h3>
                  <p>{source.description}</p>
                </div>

                <div className="workbook-source-meta">
                  <span>Status: {source.status}</span>
                  <span>Sheets: {formatNumber(source.sheetCount)}</span>
                  <span>Rows: {formatNumber(source.totalRows)}</span>
                  <span>Kind: {source.workbookKind}</span>
                </div>

                <div className="workbook-source-actions">
                  <button
                    type="button"
                    className="workbook-upload-button"
                    onClick={() => openFilePicker(source.id)}
                    disabled={isUploading}
                  >
                    {isUploading ? "Uploading..." : "Replace Workbook"}
                  </button>
                  <input
                    ref={(node) => {
                      fileInputsRef.current[source.id] = node;
                    }}
                    type="file"
                    accept=".xlsx"
                    className="workbook-upload-input"
                    onChange={(event) => handleUpload(source.id, event.target.files?.[0])}
                  />
                </div>

                <div className="workbook-upload-state">
                  <div className="workbook-upload-progress">
                    <span style={{ width: `${state.progress || 0}%` }} />
                  </div>
                  <small>
                    {state.error
                      ? state.error
                      : state.status === "done"
                        ? "Upload complete and dashboard refreshed."
                        : state.status === "uploading"
                          ? `${state.progress || 0}% uploaded`
                          : source.lastModified
                            ? `Last updated: ${new Date(source.lastModified).toLocaleString()}`
                            : "No upload activity yet."}
                  </small>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}

      {showCombinedAnalytics || showTopDivisions ? (
        <div className="workbook-analytics-layout">
          {showCombinedAnalytics ? (
            <div className="workbook-chart-card">
              {isSourcesLoading || !chartData ? (
                <div className="workbook-empty-chart">Loading source analytics...</div>
              ) : (
                <div className="workbook-chart-shell">
                  <Bar data={chartData} options={chartOptions} />
                </div>
              )}
            </div>
          ) : null}

          {showTopDivisions ? (
            <div className="workbook-division-card">
              <div className="workbook-division-card-header">
                <span className="section-kicker">Top Divisions from all sources</span>
                <h3>Cross-workbook coverage</h3>
              </div>

              <div className="workbook-division-list">
                {(combinedSummary.topDivisions || []).length ? (
                  combinedSummary.topDivisions.map((division) => (
                    <div key={division.division} className="workbook-division-row">
                      <strong>{division.division}</strong>
                      <span>{formatNumber(division.count)} records</span>
                    </div>
                  ))
                ) : (
                  <p className="workbook-empty-chart">No division metadata is available yet.</p>
                )}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="workbook-explorer-card">
        <div className="workbook-explorer-header">
          <div>
            <span className="section-kicker">Dataset Explorer</span>
            <h3>Search, filter, sort, and export rows</h3>
          </div>
          <button
            type="button"
            className="workbook-export-button"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? "Exporting..." : "Export Filtered Rows"}
          </button>
        </div>

        <div
          className={`workbook-explorer-toolbar ${
            lockedSourceId ? "workbook-explorer-toolbar-locked" : ""
          }`.trim()}
        >
          {!lockedSourceId ? (
            <select
              value={query.sourceId}
              onChange={(event) =>
                handleQueryChange({
                  sourceId: event.target.value,
                  sheetName: "all",
                  sortBy: "_source",
                })
              }
            >
              <option value="all">All Datasets</option>
              {rowsPayload.sourceOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : null}

          <select
            value={query.sheetName}
            onChange={(event) =>
              handleQueryChange({ sheetName: event.target.value, sortBy: "_source" })
            }
            disabled={query.sourceId === "all"}
          >
            <option value="all">All Sheets</option>
            {visibleSheetOptions.map((option) => (
              <option key={`${option.sourceId}:${option.sheetName}`} value={option.sheetName}>
                {option.sheetName} ({option.rowCount})
              </option>
            ))}
          </select>

          <input
            type="text"
            value={query.search}
            placeholder="Search by division, school, teacher, address..."
            onChange={(event) => handleQueryChange({ search: event.target.value })}
          />

          <select
            value={query.sortBy}
            onChange={(event) => handleQueryChange({ sortBy: event.target.value })}
          >
            {rowsPayload.columns.map((column) => (
              <option key={column.key} value={column.key}>
                Sort: {column.label}
              </option>
            ))}
          </select>

          <select
            value={query.sortDir}
            onChange={(event) => handleQueryChange({ sortDir: event.target.value })}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>

          <select
            value={query.pageSize}
            onChange={(event) => handleQueryChange({ pageSize: Number(event.target.value) })}
          >
            <option value="10">10 / page</option>
            <option value="25">25 / page</option>
            <option value="50">50 / page</option>
          </select>
        </div>

        <div className="workbook-table-shell">
          {isRowsLoading ? (
            <div className="workbook-empty-chart">Loading workbook rows...</div>
          ) : rowsPayload.rows.length ? (
            <table className="workbook-table">
              <thead>
                <tr>
                  {rowsPayload.columns.map((column) => (
                    <th key={column.key}>{column.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rowsPayload.rows.map((row) => (
                  <tr key={row._recordId}>
                    {rowsPayload.columns.map((column) => (
                      <td key={`${row._recordId}-${column.key}`}>{row[column.key] || "-"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="workbook-empty-chart">No rows match the current filters.</div>
          )}
        </div>

        <div className="workbook-pagination">
          <span>
            Page {formatNumber(rowsPayload.page || 1)} of {formatNumber(rowsPayload.totalPages || 0)} ·{" "}
            {formatNumber(rowsPayload.totalRows || 0)} result(s)
          </span>
          <div className="workbook-pagination-actions">
            <button
              type="button"
              onClick={() => handleQueryChange({ page: Math.max(1, (rowsPayload.page || 1) - 1) })}
              disabled={(rowsPayload.page || 1) <= 1}
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() =>
                handleQueryChange({
                  page: Math.min(rowsPayload.totalPages || 1, (rowsPayload.page || 1) + 1),
                })
              }
              disabled={(rowsPayload.page || 1) >= (rowsPayload.totalPages || 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkbookDataWorkbench;
