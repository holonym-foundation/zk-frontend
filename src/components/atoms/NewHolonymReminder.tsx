export default function NewHolonymReminder({ onClick }: { onClick: () => void }) {
  return (
    <div className="toasty-bug-report-card-container" style={{ left: '2%' }}>
      <button
        style={{ fontSize: "1rem", backgroundColor: '#fdc094', borderColor: '#ffc296' }}
        className="toasty-bug-report-card-open-button"
        onClick={onClick}
      >
        Holonym has moved!
      </button>
    </div>
  );
}

