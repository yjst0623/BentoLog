export default function ScoreBar({ label, score, color = '#4CAF50' }: { label: string; score: number; color?: string }) {
  return (
    <div className="score-bar">
      <div className="label-row">{label}<span>{score}点</span></div>
      <div className="score-track">
        <div className="score-fill" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
