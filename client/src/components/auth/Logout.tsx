import React, { useState } from 'react';
import { useSetAtom } from 'jotai';
import { User, userAtom } from '../../atoms/userAtom';
import { MdLogout } from 'react-icons/md';
import useAuth from '../../helpers/useAuth';

interface Props{
  isMobile: boolean;
  user?: User;
}

const Logout: React.FC<Props> = ({ user, isMobile }: Props) => {
  const { logout }  = useAuth(user);
  const setUser = useSetAtom(userAtom);
  const [showModal, setShowModal] = useState(false);

  const handleLogout = async () => {
    if (user) {
      try {
        logout();
      } catch (error) {
        console.error('Error during logout:', error);
      }
    }
    setUser(undefined);
    setShowModal(false);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setShowModal(false);
    }
  };

  if(!user) 
    return null;

  return (
    <>
      <button className="icon-button" onClick={() => setShowModal(true)} aria-label="Logout">
        <MdLogout size={24} />
        {!isMobile && <span>Logout</span>}
      </button>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => handleBackdropClick(e)}>
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