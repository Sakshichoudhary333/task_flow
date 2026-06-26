export default function SkeletonBoard() {
  return (
    <div className="dash-board-card" style={{ cursor: "default" }}>
      <div className="skeleton" style={{ height: 3, width: "100%" }} />
      <div className="dash-board-body">
        <div className="dash-board-top">
          <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ width: "75%", height: 12, borderRadius: 4, marginBottom: 6 }} />
            <div className="skeleton" style={{ width: "50%", height: 10, borderRadius: 4 }} />
          </div>
        </div>
        <div className="skeleton" style={{ width: "100%", height: 10, borderRadius: 4 }} />
      </div>
      <div className="dash-board-footer">
        <div className="skeleton" style={{ width: 56, height: 18, borderRadius: 99 }} />
        <div className="skeleton" style={{ width: 52, height: 24, borderRadius: 6 }} />
      </div>
    </div>
  );
}
