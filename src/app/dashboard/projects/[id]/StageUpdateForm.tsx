"use client";

import { useState } from "react";

export function StageUpdateForm({
  projectId,
  currentStage,
  stages,
  action,
}: {
  projectId: string;
  currentStage: string;
  stages: readonly string[];
  action: (formData: FormData) => void;
}) {
  const [selected, setSelected] = useState(currentStage);

  return (
    <form
      action={action}
      className="mt-3 flex items-center gap-3"
      onSubmit={(e) => {
        if (selected !== currentStage) {
          const confirmed = window.confirm(
            `Move this project to "${selected}"? Your client may see this update.`,
          );
          if (!confirmed) {
            e.preventDefault();
          }
        }
      }}
    >
      <input type="hidden" name="project_id" value={projectId} />
      <select
        name="stage"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
      >
        {stages.map((stage) => (
          <option key={stage} value={stage}>
            {stage}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
      >
        Update
      </button>
    </form>
  );
}
