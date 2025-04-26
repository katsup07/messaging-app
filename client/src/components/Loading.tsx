export const Loading = () => {
  return (
    <div className="loading-container">
        <div className="loading-content">
          <div className="spinner-container">
            <div className="spinner"></div>
          </div>
          <h2 className="loading-title">Messenger</h2>
          <p className="loading-message">Loading your conversations...</p>
        </div>
      </div>
  );
}