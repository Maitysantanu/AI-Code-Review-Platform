import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import PageHeader from "../components/PageHeader";
import RepositoryForm from "../components/RepositoryForm";
import StatCard from "../components/StatCard";
import EmptyState from "../components/EmptyState";
import { Activity, Bug, GitPullRequest, ShieldCheck, ArrowUpRight, Code2, Sparkles } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { repositoryUrl, setRepositoryUrl, analysisResult } = useApp();

  function startAnalysis(url) {
    setRepositoryUrl(url);
    navigate("/repository-analysis");
  }

  return (
    <>
      <PageHeader eyebrow="OVERVIEW" title="Your code, understood." description="Analyze repository quality, evaluate job-specific skills, and learn how projects work." />
      <section className="welcome-banner">
        <div className="welcome-copy"><div className="banner-kicker"><Sparkles size={14} /> REPOSITORY INTELLIGENCE</div><h2>Turn GitHub repositories<br />into actionable insights.</h2><p>One workspace for code quality, security signals, candidate matching, and project learning.</p><button className="button button-light" onClick={() => navigate("/repository-analysis")}>Explore code analysis <ArrowUpRight size={16} /></button></div>
        <div className="banner-art"><div className="art-orbit orbit-one"></div><div className="art-orbit orbit-two"></div><div className="art-core"><Code2 size={42} /></div><div className="art-chip chip-one">{"{ }"}</div><div className="art-chip chip-two"><Activity size={19} /></div><div className="art-chip chip-three"><ShieldCheck size={19} /></div></div>
      </section>
      <section className="stats-grid">
        <StatCard label="Repositories analyzed" value={analysisResult ? "1" : "0"} detail="In this session" icon={GitPullRequest} />
        <StatCard label="Code quality score" value={analysisResult?.quality_score != null ? `${analysisResult.quality_score}/100` : "—"} detail="Available after analysis" icon={Activity} tone="blue" />
        <StatCard label="Issues detected" value={analysisResult?.issues?.length ?? "—"} detail="Static analysis findings" icon={Bug} tone="orange" />
        <StatCard label="Security findings" value={analysisResult?.security_findings?.length ?? "—"} detail="Requires security scan" icon={ShieldCheck} tone="green" />
      </section>
      <section className="panel">
        <div className="section-heading"><div><h2>Analyze a repository</h2><p>Start with a GitHub repository URL.</p></div><span className="soft-tag">QUICK START</span></div>
        <RepositoryForm onSubmit={startAnalysis} buttonText="Continue to analysis" />
      </section>
      <section className="panel">
        <div className="section-heading"><div><h2>Recent activity</h2><p>Your latest repository work will appear here.</p></div></div>
        {repositoryUrl ? <div className="activity-row"><div className="activity-symbol"><GithubIcon /></div><div className="activity-info"><strong>{repositoryUrl.split("/").slice(-2).join("/")}</strong><span>Selected for analysis</span></div><button className="text-button" onClick={() => navigate("/repository-analysis")}>Open analysis <ArrowUpRight size={15} /></button></div> : <EmptyState title="No repository activity" description="Submit a GitHub repository above to begin your first analysis." />}
      </section>
    </>
  );
}

function GithubIcon() { return <Code2 size={18} />; }