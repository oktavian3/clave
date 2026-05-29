"use client";

export default function EmptyState({ icon, title, description, action }: {
  icon: string; title: string; description: string; action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center animate-fade-in">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-h3 font-semibold mb-2">{title}</h3>
      <p className="text-caption text-neutral-400 max-w-sm mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2.5 rounded-sm bg-primary text-primary-500 text-sm font-medium shadow-[2px_2px_5px_#D4A8D6,-2px_-2px_5px_#F5EAF5] hover:shadow-[inset_2px_2px_4px_#D4A8D6,inset_-2px_-2px_4px_#F5EAF5] transition-all duration-200"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
