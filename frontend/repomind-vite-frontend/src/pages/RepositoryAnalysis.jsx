import { useState } from "react";
import { useApp } from "../context/AppContext";
import { analyzeRepository } from "../services/api";

import PageHeader from "../components/PageHeader";
import RepositoryForm from "../components/RepositoryForm";
import EmptyState from "../components/EmptyState";

import {
  AlertTriangle,
  CheckCircle2,
  Code2,
  FlaskConical,
  ShieldAlert,
} from "lucide-react";

function unwrapResponse(response) {
  return response?.data?.data ?? response?.data ?? response;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function getReviewStatus(result) {
  return result?.review_status ?? result?.reviewStatus ?? {};
}

function Finding({ item }) {
  const severity = String(item?.severity ?? "info").toLowerCase();
  const title = item?.title ?? item?.message ?? "Review finding";
  const explanation =
    item?.explanation ?? item?.detail ?? item?.description ?? "";

  return (
    <article className="finding-item">
      <div className={`severity-dot ${severity}`} />
      <div className="finding-content">
        <div className="finding-title-row">
          <strong>{title}</strong>
          <span className={`severity-label ${severity}`}>
            {item?.severity ?? "Info"}
          </span>
        </div>

        {(item?.file || item?.path) && (
          <code>
            {item.file ?? item.path}
            {item.line ? ` : Line ${item.line}` : ""}
          </code>
        )}

        {explanation && <p>{explanation}</p>}

        {item?.evidence && (
          <div className="finding-evidence">
            <strong>Evidence:</strong>
            <p>{item.evidence}</p>
          </div>
        )}

        {item?.suggestion && (
          <div className="finding-suggestion">
            <strong>Suggested fix:</strong>
            <p>{item.suggestion}</p>
          </div>
        )}
      </div>
    </article>
  );
}

function ReviewProgress({ reviewStatus }) {
  const status = String(reviewStatus?.status ?? "UNKNOWN").toUpperCase();
  const selected = Number(reviewStatus?.chunks_selected ?? 0);
  const reviewed = Number(reviewStatus?.chunks_reviewed ?? 0);
  const failed = Number(reviewStatus?.chunks_failed ?? 0);
  const errors = asArray(reviewStatus?.review_errors);

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <h2>
            <CheckCircle2 size={18} /> Review status
          </h2>
          <p>Progress of AI-based code review.</p>
        </div>
      </div>

      <div className="review-status-label">
        <strong>Review status:</strong>
        <span className={`status-badge ${status.toLowerCase()}`}>
          {status}
        </span>
      </div>

      <div className="mini-metrics">
        <div>
          <span>Chunks selected</span>
          <strong>{selected}</strong>
        </div>
        <div>
          <span>Chunks reviewed</span>
          <strong>{reviewed}</strong>
        </div>
        <div>
          <span>Chunks failed</span>
          <strong>{failed}</strong>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="notice notice-warning">
          <AlertTriangle size={18} />
          <div>
            <strong>Some code chunks could not be reviewed.</strong>
            {errors.map((error, index) => (
              <p key={`${error?.file ?? "chunk"}-${index}`}>
                {error?.file ? `${error.file}: ` : ""}
                {error?.error ?? error?.message ?? "Review failed."}
              </p>
            ))}
          </div>
        </div>
      )}

      {status === "PARTIAL" && errors.length === 0 && (
        <p className="muted-text">
          Some chunks were not reviewed. Check the backend logs for details.
        </p>
      )}
    </section>
  );
}

function SeveritySummary({ summary = {} }) {
  const levels = ["critical", "high", "medium", "low"];

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <h2>Finding severity summary</h2>
          <p>Distribution of detected code and security findings.</p>
        </div>
      </div>

      <div className="mini-metrics">
        {levels.map((level) => (
          <div key={level}>
            <span>{level.toUpperCase()}</span>
            <strong>{summary?.[level] ?? 0}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function RepositoryAnalysis() {
  const {
    repositoryUrl,
    setRepositoryUrl,
    analysisResult,
    setAnalysisResult,
  } = useApp();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runAnalysis(url) {
    if (!url?.trim()) {
      setError("Please enter a valid GitHub repository URL.");
      return;
    }

    setRepositoryUrl(url.trim());
    setLoading(true);
    setError("");
    setAnalysisResult(null);

    try {
      const response = await analyzeRepository(url.trim());
      const result = unwrapResponse(response);

      if (!result || typeof result !== "object" || Array.isArray(result)) {
        throw new Error("The analysis service returned an invalid response.");
      }

      setAnalysisResult(result);
    } catch (err) {
      console.error("Repository analysis failed:", err);
      setAnalysisResult(null);
      setError(
        err?.response?.data?.message ??
          err?.response?.data?.detail ??
          err?.message ??
          "Unable to analyze this repository. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const result = analysisResult;
  const reviewStatus = getReviewStatus(result);
  const issues = asArray(result?.issues);
  const securityFindings = asArray(result?.security_findings);
  const testCases = asArray(result?.missing_test_cases);
  const summaries = asArray(result?.ai_summary);
  const severitySummary = result?.severity_summary ?? {};
  const limitations = asArray(result?.limitations);
  const hasResult = Boolean(result) && !loading;

  return (
    <>
      <PageHeader
        eyebrow="CODE INTELLIGENCE"
        title="Repository analysis"
        description="Review code quality, reliability, and potential security risks across supported programming languages."
      />

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Repository source</h2>
            <p>Provide the GitHub repository you want to inspect.</p>
          </div>
        </div>

        <RepositoryForm
          onSubmit={runAnalysis}
          loading={loading}
          buttonText="Run code review"
        />

        {repositoryUrl && (
          <p className="selected-repo">
            Selected: <strong>{repositoryUrl}</strong>
          </p>
        )}

        {error && (
          <div className="notice notice-warning">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}
      </section>

      {loading && (
        <div className="loading-panel">
          <div className="spinner" />
          <strong>Reviewing repository code...</strong>
          <span>
            Source files are being analyzed in smaller chunks. Larger
            repositories may take longer.
          </span>
        </div>
      )}

      {hasResult && (
        <>
          <div className="result-heading">
            <div>
              <h2>Code review results</h2>
              <p>
                Validate AI-generated findings against the original source
                code before applying changes.
              </p>
            </div>
          </div>

          <ReviewProgress reviewStatus={reviewStatus} />

          <SeveritySummary summary={severitySummary} />

          <section className="panel">
            <div className="section-heading">
              <div>
                <h2>
                  <Code2 size={18} /> Code quality findings
                </h2>
                <p>
                  Potential bugs, edge cases, reliability, performance, and
                  maintainability concerns.
                </p>
              </div>
              <span className="count-tag">{issues.length} findings</span>
            </div>

            {issues.length > 0 ? (
              <div className="finding-list">
                {issues.map((item, index) => (
                  <Finding key={`${item?.file ?? "issue"}-${index}`} item={item} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No code quality findings returned"
                description="No defensible code quality findings were returned for the reviewed chunks. This does not guarantee that the code is free of defects."
              />
            )}
          </section>

          <section className="panel">
            <div className="section-heading">
              <div>
                <h2>
                  <ShieldAlert size={18} /> Security findings
                </h2>
                <p>
                  Potential security vulnerabilities that require developer
                  verification.
                </p>
              </div>
              <span className="count-tag">
                {securityFindings.length} findings
              </span>
            </div>

            {securityFindings.length > 0 ? (
              <div className="finding-list">
                {securityFindings.map((item, index) => (
                  <Finding
                    key={`${item?.file ?? "security"}-${index}`}
                    item={item}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No security findings returned"
                description="The review did not return security findings. This is not a guarantee that the code is secure."
              />
            )}
          </section>

          <section className="panel">
            <div className="section-heading">
              <div>
                <h2>
                  <FlaskConical size={18} /> Suggested test cases
                </h2>
                <p>
                  Additional scenarios to consider when testing the
                  application.
                </p>
              </div>
              <span className="count-tag">
                {testCases.length} suggestions
              </span>
            </div>

            {testCases.length > 0 ? (
              <div className="finding-list">
                {testCases.map((test, index) => (
                  <article className="finding-item" key={index}>
                    <div className="finding-content">
                      <strong>{test?.scenario ?? "Test scenario"}</strong>
                      {test?.file && <code>{test.file}</code>}
                      {test?.reason && <p>{test.reason}</p>}
                      {test?.suggested_test && (
                        <div className="finding-suggestion">
                          <strong>Suggested test:</strong>
                          <p>{test.suggested_test}</p>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No test suggestions returned"
                description="The AI review did not return additional test-case suggestions."
              />
            )}
          </section>

          <section className="panel">
            <div className="section-heading">
              <div>
                <h2>AI review summary</h2>
                <p>Short summaries of the reviewed source files.</p>
              </div>
            </div>

            {summaries.length > 0 ? (
              <div className="finding-list">
                {summaries.map((item, index) => (
                  <article className="finding-item" key={index}>
                    <div className="finding-content">
                      <strong>{item?.file ?? "Repository file"}</strong>
                      <p>{item?.summary ?? item?.description ?? ""}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No AI summaries returned"
                description="No file summaries were included in the review response."
              />
            )}
          </section>

          {limitations.length > 0 && (
            <section className="panel">
              <div className="section-heading">
                <div>
                  <h2>Analysis limitations</h2>
                  <p>Important information about interpreting this report.</p>
                </div>
              </div>
              <ul>
                {limitations.map((item, index) => (
                  <li key={index}>
                    {typeof item === "string"
                      ? item
                      : item?.message ?? JSON.stringify(item)}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      {!result && !loading && !error && (
        <div className="panel">
          <EmptyState
            title="Ready to review your code"
            description="Enter a GitHub repository URL above. Your code review report will appear here."
          />
        </div>
      )}
    </>
  );
}
