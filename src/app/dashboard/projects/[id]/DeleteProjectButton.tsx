"use client";

export function DeleteProjectButton({
  projectId,
  clientName,
  action,
}: {
  projectId: string;
  clientName: string;
  action: (formData: FormData) => void;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        const confirmed = window.confirm(
          `Delete "${clientName}"? This permanently removes all files, file requests, and activity history for this project. This cannot be undone.`,
        );
        if (!confirmed) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="project_id" value={projectId} />
      <button
        type="submit"
        className="rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        Delete project
      </button>
    </form>
  );
}
