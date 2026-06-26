import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { groupTasksByStatus, KANBAN_COLUMNS, filterTasks } from "../lib/taskHelpers";
import KanbanColumn from "../components/board/KanbanColumn";
import TaskModal from "../components/board/TaskModal";
import BoardHeader from "../components/board/BoardHeader";

export default function BoardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { logout } = useAuth();

  const [modal, setModal] = useState({ open: false, task: null, status: "todo" });
  const [draggingId, setDraggingId] = useState(null);
  const [filters, setFilters] = useState({ dateRange: "all", priorities: [], members: [] });

  const boardQ = useQuery({ queryKey: ["board", id], queryFn: async () => (await api.get(`/boards/${id}`)).data });
  const tasksQ = useQuery({
    queryKey: ["tasks", id],
    queryFn: async () =>
      (await api.get("/tasks", { params: { boardId: id, sortBy: "createdAt", order: "asc" } })).data,
  });

  const tasks = tasksQ.data || [];
  const filteredTasks = useMemo(() => filterTasks(tasks, filters), [tasks, filters]);
  const groupedTasks = useMemo(() => groupTasksByStatus(filteredTasks), [filteredTasks]);

  const resetFilters = () => setFilters({ dateRange: "all", priorities: [], members: [] });

  const handleAuthErr = err => {
    if (err.response?.status === 401) { logout(); navigate("/", { replace: true }); }
  };

  const revalidate = async () => {
    await qc.invalidateQueries({ queryKey: ["tasks", id] });
    await qc.invalidateQueries({ queryKey: ["task-summary", id] });
    await qc.invalidateQueries({ queryKey: ["boards"] });
  };

  const createMutation = useMutation({
    mutationFn: async p => (await api.post("/tasks", { ...p, boardId: id })).data,
    onSuccess: async () => { await revalidate(); toast.success("Task created!"); },
    onError: err => { toast.error(err.response?.data?.message || "Error."); handleAuthErr(err); },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ taskId, payload }) => (await api.put(`/tasks/${taskId}`, payload)).data,
    onSuccess: async () => { await revalidate(); toast.success("Task updated!"); },
    onError: err => { toast.error(err.response?.data?.message || "Error."); handleAuthErr(err); },
  });

  const deleteMutation = useMutation({
    mutationFn: async taskId => { await api.delete(`/tasks/${taskId}`); },
    onSuccess: async () => {
      await revalidate();
      toast.success("Task deleted.");
      setModal({ open: false, task: null, status: "todo" });
    },
    onError: err => { toast.error(err.response?.data?.message || "Error."); handleAuthErr(err); },
  });

  const deleteBoardMutation = useMutation({
    mutationFn: async () => { await api.delete(`/boards/${id}`); },
    onSuccess: async () => {
      toast.success("Project deleted.");
      await qc.invalidateQueries({ queryKey: ["boards"] });
      await qc.invalidateQueries({ queryKey: ["tasks"] });
      await qc.invalidateQueries({ queryKey: ["task-summary"] });
      navigate("/dashboard", { replace: true });
    },
    onError: err => { toast.error(err.response?.data?.message || "Could not delete project."); handleAuthErr(err); },
  });

  const moveMutation = useMutation({
    mutationFn: async ({ taskId, status }) => (await api.put(`/tasks/${taskId}`, { status })).data,
    onSuccess: revalidate,
    onError: handleAuthErr,
  });

  const openCreate = (status = "todo") => setModal({ open: true, task: null, status });
  const openEdit = task => setModal({ open: true, task, status: task.status });
  const handleDelete = task => {
    if (window.confirm(`Delete "${task.title}"?`)) deleteMutation.mutate(task._id);
  };
  const handleDrop = status => {
    if (!draggingId) return;
    const task = tasks.find(t => t._id === draggingId);
    if (task && task.status !== status) moveMutation.mutate({ taskId: draggingId, status });
    setDraggingId(null);
  };
  const handleDeleteBoard = () => {
    const title = boardQ.data?.title || "this project";
    if (window.confirm(`Delete "${title}" and all its tasks? This cannot be undone.`)) {
      deleteBoardMutation.mutate();
    }
  };

  const handleSave = data => {
    if (modal.task) updateMutation.mutate({ taskId: modal.task._id, payload: data });
    else createMutation.mutate({ ...data, status: modal.status });
    setModal({ open: false, task: null, status: "todo" });
  };

  return (
    <div className="board-page">
      <BoardHeader
        boardTitle={boardQ.data?.title}
        onAddTask={() => openCreate()}
        tasks={tasks}
        filters={filters}
        onFiltersChange={setFilters}
        onResetFilters={resetFilters}
        onDeleteBoard={handleDeleteBoard}
      />

      <div className="kanban-board">
        {KANBAN_COLUMNS.map(status => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={groupedTasks[status] || []}
            loading={tasksQ.isLoading}
            draggingId={draggingId}
            onDragStart={setDraggingId}
            onDragEnd={() => setDraggingId(null)}
            onDrop={handleDrop}
            onAdd={() => openCreate(status)}
            onEdit={openEdit}
          />
        ))}
      </div>

      {modal.open && (
        <TaskModal
          task={modal.task}
          defaultStatus={modal.status}
          onClose={() => setModal({ open: false, task: null, status: "todo" })}
          onSave={handleSave}
          onDelete={modal.task ? () => handleDelete(modal.task) : undefined}
          saving={createMutation.isPending || updateMutation.isPending}
          deleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
