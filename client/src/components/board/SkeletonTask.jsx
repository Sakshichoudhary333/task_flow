export default function SkeletonTask() {
  return (
    <div className="kanban-task-card kanban-task-skeleton">
      <div className="skeleton w-16 h-5 rounded-full" />
      <div className="skeleton w-full h-4 rounded mt-3" />
      <div className="skeleton w-3/4 h-4 rounded mt-2" />
      <div className="flex gap-2 mt-4">
        <div className="skeleton w-8 h-8 rounded-full" />
        <div className="skeleton w-8 h-8 rounded-full" />
        <div className="skeleton w-8 h-8 rounded-full" />
      </div>
      <div className="skeleton w-full h-2 rounded-full mt-4" />
    </div>
  );
}
