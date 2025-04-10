import { useAtomValue } from 'jotai';
import './App.css'
import Chat from './components/Chat'
import { userAtom } from './atoms/userAtom';
import Login from './components/Login';

import FriendsList, { Friend } from './components/FriendsList';
import { useState } from 'react';
import Header from './components/Header';
import useAuth from './helpers/useAuth';
import ErrorBoundary from './components/ErrorBoundary';
import { ErrorProvider } from './services/ErrorService';
import ErrorToast from './components/ErrorToast';
import { useIsMobile } from './helpers/useIsMobile';

// TODO: Update isLoggedIn to use the jwt token
function App() {
  const { isLoading } = useAuth();
  const user = useAtomValue(userAtom);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const isLoggedIn = !!user;
  const { isMobile, isPortrait } = useIsMobile();


  const toggleFriendsModal = () => {
    setShowFriendsModal(prev => !prev);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget)
      toggleFriendsModal();
  };

  if(isLoading)
    return <div className="loading">Loading...</div>;

  if (!user)
    return (
      <ErrorBoundary>
        <ErrorProvider>
          <div className="app-container">
            <Header isLoggedIn={isLoggedIn} isMobile={isMobile}/>
            <Login />
            <ErrorToast />
          </div>
        </ErrorProvider>
      </ErrorBoundary>
    )
    
// Desktop layout - always show friends sidebar  
if(!isMobile)
  return (
    <ErrorBoundary>
      <ErrorProvider>
        <div className="app-container">
          <Header isLoggedIn={isLoggedIn} user={user} isMobile={isMobile}/>
          <div className="main-content">
            <div className="friends-container">
              <FriendsList 
                onSelectFriend={setSelectedFriend}
                selectedFriend={selectedFriend}
                user={user}
              />
            </div>
            <Chat selectedFriend={selectedFriend}/>
          </div>
          <ErrorToast />
        </div>
      </ErrorProvider>
    </ErrorBoundary>
  );

// Mobile portrait layout - use modal for friends list to maximize vertical space
if(isMobile && isPortrait)
  return (
    <ErrorBoundary>
      <ErrorProvider>
        <div className="app-container">
          <Header isLoggedIn={isLoggedIn} user={user} isMobile={isMobile}/>
          <div className="main-content">
            <button 
              className="friends-toggle-button"
              onClick={toggleFriendsModal}
            >
              {selectedFriend ? selectedFriend.username : "Select Friend"}
            </button>
            <Chat selectedFriend={selectedFriend}/>
            
            {showFriendsModal && (
              <div className="modal-overlay" onClick={(e) => handleBackdropClick(e)}>
                <div className="modal-content friends-modal">
                  <button 
                    className="close-modal-button"
                    onClick={toggleFriendsModal}
                  >
                    Close
                  </button>
                  <FriendsList 
                    onSelectFriend={(friend) => {
                      setSelectedFriend(friend);
                      setShowFriendsModal(false);
                    }}
                    selectedFriend={selectedFriend}
                    user={user}
                  />
                </div>
              </div>
            )}
          </div>
          <ErrorToast />
        </div>
      </ErrorProvider>
    </ErrorBoundary>
  );

// Mobile landscape layout - side-by-side layout with smaller friends list
return (
  <ErrorBoundary>
    <ErrorProvider>
      <div className="app-container">
        <Header isLoggedIn={isLoggedIn} user={user} isMobile={isMobile}/>
        <div className="main-content landscape">
          <div className="friends-container landscape">
            <FriendsList 
              onSelectFriend={setSelectedFriend}
              selectedFriend={selectedFriend}
              user={user}
            />
          </div>
          <Chat selectedFriend={selectedFriend}/>
        </div>
        <ErrorToast />
      </div>
    </ErrorProvider>
  </ErrorBoundary>
);
}

export default App;
