import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import StatCards from "../components/dashboard/StatCards";
import ProductivityChart from "../components/dashboard/ProductivityChart";
import BoardCard from "../components/dashboard/BoardCard";
import RecentTasks from "../components/dashboard/RecentTasks";
import BoardModal from "../components/dashboard/BoardModal";
import SkeletonBoard from "../components/dashboard/SkeletonBoard";

const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function Dashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user, logout } = useAuth();
  const [boardModal, setBoardModal] = useState({ open: false, board: null });

  const boardsQ = useQuery({ queryKey: ["boards"], queryFn: async () => (await api.get("/boards")).data });
  const summaryQ = useQuery({ queryKey: ["task-summary"], queryFn: async () => (await api.get("/tasks/summary")).data });
  const recentQ = useQuery({
    queryKey: ["tasks", "recent"],
    queryFn: async () => (await api.get("/tasks", { params: { sortBy: "updatedAt", order: "desc" } })).data,
  });

  const boards = boardsQ.data || [];
  const summary = summaryQ.data;
  const recentTasks = (recentQ.data || []).slice(0, 8);

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (payload._id) return (await api.put(`/boards/${payload._id}`, payload)).data;
      return (await api.post("/boards", payload)).data;
    },
    onSuccess: async (_, vars) => {
      setBoardModal({ open: false, board: null });
      toast.success(vars._id ? "Board updated!" : "Board created!");
      await qc.invalidateQueries({ queryKey: ["boards"] });
      await qc.invalidateQueries({ queryKey: ["task-summary"] });
    },
    onError: err => {
      toast.error(err.response?.data?.message || "Could not save board.");
      if (err.response?.status === 401) { logout(); navigate("/", { replace: true }); }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async id => { await api.delete(`/boards/${id}`); },
    onSuccess: async () => {
      setBoardModal({ open: false, board: null });
      toast.success("Project deleted.");
      await qc.invalidateQueries({ queryKey: ["boards"] });
      await qc.invalidateQueries({ queryKey: ["tasks"] });
      await qc.invalidateQueries({ queryKey: ["task-summary"] });
    },
    onError: err => {
      toast.error(err.response?.data?.message || "Could not delete.");
      if (err.response?.status === 401) { logout(); navigate("/", { replace: true }); }
    },
  });

  const handleDeleteBoard = board => {
    if (window.confirm(`Delete "${board.title}" and all its tasks? This cannot be undone.`)) {
      deleteMutation.mutate(board._id);
    }
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <motion.div className="dashboard-page" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.06 } } }}>

      <motion.div variants={fadeUp} className="dashboard-header">
        <div>
          <h1>{greeting()}, {user?.name?.split(" ")[0] || "there"} 👋</h1>
          <p>Here's what's happening with your projects today.</p>
        </div>
        <button type="button" onClick={() => setBoardModal({ open: true, board: null })} className="btn-teal">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Board
        </button>
      </motion.div>

      <motion.div variants={fadeUp}>
        <StatCards summary={summary} loading={summaryQ.isLoading} />
      </motion.div>

      <motion.div variants={fadeUp} className="dashboard-grid">
        <ProductivityChart summary={summary} loading={summaryQ.isLoading} />
        <RecentTasks tasks={recentTasks} loading={recentQ.isLoading} />
      </motion.div>

      <motion.div variants={fadeUp}>
        <div className="dashboard-section-header">
          <div>
            <h2>Project Boards</h2>
            <span>{boards.length} board{boards.length !== 1 ? "s" : ""}</span>
          </div>
          <button type="button" onClick={() => setBoardModal({ open: true, board: null })} className="btn-ghost-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New
          </button>
        </div>

        {boardsQ.isLoading ? (
          <div className="dashboard-boards">
            {[1, 2, 3, 4].map(i => <SkeletonBoard key={i} />)}
          </div>
        ) : boards.length === 0 ? (
          <EmptyBoards onCreate={() => setBoardModal({ open: true, board: null })} />
        ) : (
          <div className="dashboard-boards">
            {boards.map((b, i) => (
              <motion.div key={b._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}>
                <BoardCard
                  board={b}
                  onEdit={() => setBoardModal({ open: true, board: b })}
                  onDelete={() => handleDeleteBoard(b)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {boardModal.open && (
        <BoardModal
          board={boardModal.board}
          onClose={() => setBoardModal({ open: false, board: null })}
          onSave={data => saveMutation.mutate(data)}
          onDelete={boardModal.board ? () => handleDeleteBoard(boardModal.board) : undefined}
          saving={saveMutation.isPending}
          deleting={deleteMutation.isPending}
        />
      )}
    </motion.div>
  );
}

function EmptyBoards({ onCreate }) {
  return (
    <div className="dash-empty">
      <div className="dash-empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
          <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
        </svg>
      </div>
      <h3>No boards yet</h3>
      <p>Create your first board to start organizing tasks and tracking progress.</p>
      <button type="button" onClick={onCreate} className="btn-teal">Create your first board</button>
    </div>
  );
}
