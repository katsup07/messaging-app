import React, { useState } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { userAtom } from '../atoms/userAtom';
import { MdLogout } from 'react-icons/md';
import ApiService from '../services/ApiService';

const Logout: React.FC = () => {
  const setUser = useSetAtom(userAtom);
  const user = useAtomValue(userAtom);
  const [showModal, setShowModal] = useState(false);

  const handleLogout = async () => {
    if (user) {
      try {
        const apiService = new ApiService(user);
        await apiService.logout();
      } catch (error) {
        console.error('Error during logout:', error);
      }
    }
    localStorage.removeItem('user');
    setUser(undefined);
    setShowModal(false);
  };

  return (
    <>
      <button className="icon-button" onClick={() => setShowModal(true)} aria-label="Logout">
        <MdLogout size={24} />
        <span>Logout</span>
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