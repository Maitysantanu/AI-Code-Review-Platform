import { FolderGit2 } from "lucide-react";

export default function EmptyState({ title = "Nothing here yet", description = "Connect a repository to get started." }) {
  return (
    <div className="empty-state">
      <div className="empty-icon"><FolderGit2 size={25} /></div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}