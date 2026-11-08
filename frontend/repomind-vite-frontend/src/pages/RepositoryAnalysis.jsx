
import { useState } from "react";
import { useApp } from "../context/AppContext";
import { analyzeRepository } from "../services/api";

import PageHeader from "../components/PageHeader";
import RepositoryForm from "../components/RepositoryForm";
import ScoreRing from "../components/ScoreRing";
import EmptyState from "../components/EmptyState";

import {
  AlertTriangle,
  ShieldAlert,
  Code2,
  CheckCircle2,
  Layers3,
  FlaskConical,
  Info,
  FileCode2,
} from "lucide-react";

// --------------------------------------------------
// RESPONSE HELPERS
// --------------------------------------------------

function unwrapResponse(response) {
  return response?.data?.data ?? response?.data ?? response;
}

function getList(value) {
  return Array.isArray(value) ? value : [];
}

function formatValue(value) {
  if (typeof value === "string") return value;

  if (value && typeof value === "object") {
    return value.name || value.language || value.title || "";
  }

  return String(value ?? "");
}

function TechnologyList({ title, items }) {
  const values = getList(items)
    .map(formatValue)
    .filter(Boolean);

  if (!values.length) return null;

  return (
    <div className="technology-group">
      <strong>{title}</strong>
      <div className="technology-tags">
        {values.map((item, index) => (
          <span className="technology-tag" key={`${item}-${index}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// --------------------------------------------------
// MAIN COMPONENT
// --------------------------------------------------

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

    setRepositoryUrl(url);
    setLoading(true);
    setError("");

    // Never display old or fabricated findings.
    setAnalysisResult(null);

    try {
      const response = await analyzeRepository(url);
      const result = unwrapResponse(response);

      if (!result || typeof result !== "object") {
        throw new Error("The analysis service returned an invalid response.");
      }

      setAnalysisResult(result);
    } catch (err) {
      console.error("Repository analysis failed:", err);

      setAnalysisResult(null);

      setError(
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "Unable to analyze this repository. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const result = analysisResult;

  const overview = result?.project_overview ?? {};
  const technologyStack = overview.technology_stack ?? {};
  const metrics = result?.metrics ?? {};
  const reviewStatus = result?.review_status ?? {};
  const severitySummary = result?.severity_summary ?? {};

  const issues = getList(result?.issues);
  const securityFindings = getList(result?.security_findings);
  const missingTests = getList(result?.missing_test_cases);
  const summaries = getList(result?.ai_summary);
  const limitations = getList(result?.limitations);

  const hasResult = Boolean(result) && !loading;

  return (
    <>
      <PageHeader
        eyebrow="CODE INTELLIGENCE"
        title="Repository analysis"
        description="Analyze repository structure, code quality, maintainability, and potential security risks."
      />

      {/* ------------------------------------------ */}
      {/* REPOSITORY INPUT */}
      {/* ------------------------------------------ */}

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
          buttonText="Run analysis"
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

      {/* ------------------------------------------ */}
      {/* LOADING */}
      {/* ------------------------------------------ */}

      {loading && (
        <div className="loading-panel">
          <div className="spinner" />
          <strong>Analyzing repository...</strong>
          <span>
            Fetching source files, discovering project structure,
            and reviewing code.
          </span>
          <span>This may take some time for larger repositories.</span>
        </div>
      )}

      {/* ------------------------------------------ */}
      {/* RESULTS */}
      {/* ------------------------------------------ */}

      {hasResult && (
        <>
          <div className="result-heading">
            <div>
              <h2>Analysis results</h2>
              <p>
                Review the analysis report and validate AI-generated
                findings against the original source code.
              </p>
            </div>

            <span className="count-tag">
              {metrics.files_analyzed ?? 0} files analyzed
            </span>
          </div>

          {/* ---------------------------------------- */}
          {/* PROJECT OVERVIEW */}
          {/* ---------------------------------------- */}

          <section className="panel">
            <div className="section-heading">
              <div>
                <h2>
                  <Layers3 size={18} /> Project overview
                </h2>
                <p>Project purpose, functionality, and architecture.</p>
              </div>
            </div>

            <h3>
              {overview.project_name ||
                result.repository?.name ||
                "Repository"}
            </h3>

            <p>
              {overview.purpose ||
                "Project purpose was not identified."}
            </p>

            {overview.domain && overview.domain !== "Unknown" && (
              <p>
                <strong>Domain:</strong> {overview.domain}
              </p>
            )}

            {getList(overview.main_features).length > 0 && (
              <>
                <h4>Main features</h4>
                <ul>
                  {overview.main_features.map((feature, index) => (
                    <li key={index}>{formatValue(feature)}</li>
                  ))}
                </ul>
              </>
            )}

            <div className="technology-stack">
              <h4>Technology stack</h4>

              <TechnologyList
                title="Languages"
                items={technologyStack.languages}
              />

              <TechnologyList
                title="Frameworks"
                items={technologyStack.frameworks}
              />

              <TechnologyList
                title="Libraries"
                items={technologyStack.libraries}
              />

              <TechnologyList
                title="Databases"
                items={technologyStack.databases}
              />

              <TechnologyList
                title="Tools"
                items={technologyStack.tools}
              />

              <TechnologyList
                title="Deployment"
                items={technologyStack.deployment}
              />

              {!Object.values(technologyStack).some(
                (value) => getList(value).length > 0
              ) && (
                <p>Technology stack information is unavailable.</p>
              )}
            </div>

            {overview.architecture?.type && (
              <div className="architecture-summary">
                <h4>Architecture</h4>
                <p>{overview.architecture.type}</p>
              </div>
            )}
          </section>
          
{/* DEPENDENCY ANALYSIS */}

<section className="panel">
  <div className="section-heading">
    <div>
      <h2>Dependency analysis</h2>
      <p>Declared packages and their verification status.</p>
    </div>
    <span className="count-tag">
      {getList(overview.dependencies).length} dependencies
    </span>
  </div>

  {getList(overview.dependencies).length > 0 ? (
    <div className="finding-list">
      {overview.dependencies.map((dependency, index) => (
        <article className="finding-item" key={index}>
          <div className="finding-content">
            <div className="finding-title-row">
              <strong>{dependency.name || "Unknown package"}</strong>
              <span className="severity-label">
                {dependency.status || "unknown"}
              </span>
            </div>

            <code>
              Version: {dependency.declared_version || "Not specified"}
            </code>

            {dependency.reason && <p>{dependency.reason}</p>}
          </div>
        </article>
      ))}
    </div>
  ) : (
    <EmptyState
      title="No dependencies identified"
      description="No dependency information was returned by project discovery."
    />
  )}
</section>

          {/* ---------------------------------------- */}
          {/* QUALITY SCORE AND METRICS */}
          {/* ---------------------------------------- */}

          <section className="analysis-summary">
            <div className="panel score-panel">
              <ScoreRing
                score={result.quality_score ?? 0}
                label="Quality"
                size={132}
              />

              <div>
                <h3>Code quality score</h3>
                <p>
                  {result.score_note ||
                    "Heuristic score based on detected findings and complexity indicators."}
                </p>
              </div>
            </div>

            <div className="panel mini-metrics">
              <div>
                <span>Files analyzed</span>
                <strong>{metrics.files_analyzed ?? "—"}</strong>
              </div>

              <div>
                <span>Functions analyzed</span>
                <strong>{metrics.functions_analyzed ?? "—"}</strong>
              </div>

              <div>
                <span>Classes analyzed</span>
                <strong>{metrics.classes_analyzed ?? "—"}</strong>
              </div>

              <div>
                <span>Test files</span>
                <strong>{metrics.test_files ?? "—"}</strong>
              </div>

              <div>
                <span>Lines analyzed</span>
                <strong>{metrics.lines_analyzed ?? "—"}</strong>
              </div>

              <div>
                <span>Complexity indicators</span>
                <strong>{metrics.complexity_indicators ?? "—"}</strong>
              </div>
            </div>
          </section>

          {/* ---------------------------------------- */}
          {/* REVIEW STATUS */}
          {/* ---------------------------------------- */}

          <section className="panel">
            <div className="section-heading">
              <div>
                <h2>
                  <CheckCircle2 size={18} /> Review status
                </h2>
                <p>Progress of AI-based code review.</p>
              </div>
            </div>

            <div className="mini-metrics">
              <div>
                <span>Chunks selected</span>
                <strong>{reviewStatus.chunks_selected ?? "—"}</strong>
              </div>

              <div>
                <span>Chunks reviewed</span>
                <strong>{reviewStatus.chunks_reviewed ?? "—"}</strong>
              </div>

              <div>
                <span>Chunks failed</span>
                <strong>{reviewStatus.chunks_failed ?? "—"}</strong>
              </div>
            </div>

            {getList(reviewStatus.review_errors).length > 0 && (
              <div className="notice notice-warning">
                <AlertTriangle size={18} />
                <div>
                  <strong>Some code chunks could not be reviewed.</strong>
                  {reviewStatus.review_errors.map((item, index) => (
                    <p key={index}>
                      {item.file}: {item.error}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* ---------------------------------------- */}
          {/* SEVERITY SUMMARY */}
          {/* ---------------------------------------- */}

          <section className="panel">
            <div className="section-heading">
              <div>
                <h2>Finding severity summary</h2>
                <p>Distribution of detected code and security findings.</p>
              </div>
            </div>

            <div className="mini-metrics">
              {["critical", "high", "medium", "low"].map((severity) => (
                <div key={severity}>
                  <span>{severity.toUpperCase()}</span>
                  <strong>{severitySummary[severity] ?? 0}</strong>
                </div>
              ))}
            </div>
          </section>

          {/* ---------------------------------------- */}
          {/* CODE QUALITY FINDINGS */}
          {/* ---------------------------------------- */}

          <section className="panel">
            <div className="section-heading">
              <div>
                <h2>
                  <Code2 size={18} /> Code quality findings
                </h2>
                <p>
                  Potential bugs, reliability, performance, and
                  maintainability concerns.
                </p>
              </div>

              <span className="count-tag">
                {issues.length} findings
              </span>
            </div>

            {issues.length > 0 ? (
              <div className="finding-list">
                {issues.map((item, index) => (
                  <Finding key={index} item={item} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No code quality findings returned"
                description="No defensible code quality findings were returned for the reviewed chunks. This does not guarantee that the code is free of defects."
              />
            )}
          </section>

          {/* ---------------------------------------- */}
          {/* SECURITY FINDINGS */}
          {/* ---------------------------------------- */}

          <section className="panel">
            <div className="section-heading">
              <div>
                <h2>
                  <ShieldAlert size={18} /> Security findings
                </h2>
                <p>
                  Potential security vulnerabilities requiring
                  developer verification.
                </p>
              </div>

              <span className="count-tag">
                {securityFindings.length} findings
              </span>
            </div>

            {securityFindings.length > 0 ? (
              <div className="finding-list">
                {securityFindings.map((item, index) => (
                  <Finding key={index} item={item} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No security findings returned"
                description="The review did not return security findings. This is not a guarantee that the repository is secure."
              />
            )}
          </section>

          {/* ---------------------------------------- */}
          {/* MISSING TEST CASES */}
          {/* ---------------------------------------- */}

          <section className="panel">
            <div className="section-heading">
              <div>
                <h2>
                  <FlaskConical size={18} /> Suggested test cases
                </h2>
                <p>
                  Additional scenarios that should be considered
                  when testing the application.
                </p>
              </div>

              <span className="count-tag">
                {missingTests.length} suggestions
              </span>
            </div>

            {missingTests.length > 0 ? (
              <div className="finding-list">
                {missingTests.map((test, index) => (
                  <article className="finding-item" key={index}>
                    <div className="finding-content">
                      <strong>{test.scenario || "Test scenario"}</strong>

                      {test.file && <code>{test.file}</code>}

                      <p>
                        {test.reason || "No reason provided."}
                      </p>

                      {test.suggested_test && (
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

          {/* ---------------------------------------- */}
          {/* AI SUMMARY */}
          {/* ---------------------------------------- */}

          <section className="panel">
            <div className="section-heading">
              <div>
                <h2>AI review summary</h2>
                <p>Short summaries of reviewed source files.</p>
              </div>
            </div>

            {summaries.length > 0 ? (
              <div className="finding-list">
                {summaries.map((item, index) => (
                  <article className="finding-item" key={index}>
                    <div className="finding-content">
                      <strong>{item.file || "Repository file"}</strong>
                      <p>{item.summary}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p>No AI summaries were returned.</p>
            )}
          </section>

          {/* ---------------------------------------- */}
          {/* LIMITATIONS */}
          {/* ---------------------------------------- */}

          <section className="panel">
            <div className="section-heading">
              <div>
                <h2>
                  <Info size={18} /> Analysis limitations
                </h2>
                <p>Important information about interpreting this report.</p>
              </div>
            </div>

            <ul>
              {limitations.map((item, index) => (
                <li key={index}>{formatValue(item)}</li>
              ))}
            </ul>

            {result.analysis_method && (
              <p>
                <strong>Analysis method:</strong>{" "}
                {result.analysis_method}
              </p>
            )}
          </section>
        </>
      )}

      {/* ------------------------------------------ */}
      {/* EMPTY STATE */}
      {/* ------------------------------------------ */}

      {!result && !loading && !error && (
        <div className="panel">
          <EmptyState
            title="Ready to inspect your code"
            description="Enter a GitHub repository URL above. Your analysis report will appear here."
          />
        </div>
      )}
    </>
  );
}

// --------------------------------------------------
// REUSABLE FINDING COMPONENT
// --------------------------------------------------

function Finding({ item }) {
  const severity = (item.severity || "info").toLowerCase();

  const title =
    item.title ||
    item.message ||
    "Review finding";

  const explanation =
    item.explanation ||
    item.detail ||
    item.description ||
    "";

  return (
    <article className="finding-item">
      <div className={`severity-dot ${severity}`} />

      <div className="finding-content">
        <div className="finding-title-row">
          <strong>{title}</strong>

          <span className={`severity-label ${severity}`}>
            {item.severity || "Info"}
          </span>
        </div>

        <code>
          {item.file || item.path || "File not specified"}
          {item.line ? ` : Line ${item.line}` : ""}
        </code>

        {explanation && <p>{explanation}</p>}

        {item.evidence && (
          <div className="finding-evidence">
            <strong>Evidence:</strong>
            <p>{item.evidence}</p>
          </div>
        )}

        {item.suggestion && (
          <div className="finding-suggestion">
            <strong>Suggested fix:</strong>
            <p>{item.suggestion}</p>
          </div>
        )}
      </div>
    </article>
  );
}
