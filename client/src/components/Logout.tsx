import React, { useState } from 'react';
import { useSetAtom } from 'jotai';
import { userAtom } from '../atoms/userAtom';
import { MdLogout } from 'react-icons/md';

const Logout: React.FC = () => {
  const setUser = useSetAtom(userAtom);
  const [showModal, setShowModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(undefined);
    setShowModal(false);
  };

  return (
    <>
      <button className="icon-button" onClick={() => setShowModal(true)} aria-label="Logout">
        <MdLogout size={24} />
        <span>Logout</span>
        <span className="tooltip">Logout</span>
      </button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className="modal-buttons">
              <button className="modal-button cancel" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="modal-button confirm" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Logout;