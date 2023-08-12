const ConfirmReverify = ({ confirmReverify }) => {
  return (
    <div style={{ textAlign: 'center' }}>
      <p>It looks like you already have govnerment ID credentials.</p>
      <p>Are you sure you want to reverify?</p>
      <div style={{ 
        marginTop: '20px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <button
          className="export-private-info-button"
          style={{
            lineHeight: "1",
            fontSize: "16px"
          }}
          onClick={() => confirmReverify()}
        >
          Reverify
        </button>
      </div>
    </div>
  );
};

export default ConfirmReverify;
