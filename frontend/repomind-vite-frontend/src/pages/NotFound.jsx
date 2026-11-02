import { Link } from "react-router-dom";
export default function NotFound() {
  return <div className="not-found"><div className="not-found-code">404</div><h1>Page not found</h1><p>The page you requested does not exist.</p><Link className="button button-primary" to="/">Return to dashboard</Link></div>;
}