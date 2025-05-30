import { useAtomValue } from 'jotai';
import './App.css'
import Chat from './components/chat/Chat'
import { userAtom } from './atoms/userAtom';
import Login from './components/auth/Login';
import { useState } from 'react';
import Header from './components/Header';
import useAuth from './helpers/useAuth';
import { useIsMobile } from './helpers/useIsMobile';
import { Loading } from './components/Loading';
import ErrorHandlingProvider from './components/errors/ErrorHandlingProvider';
import { Friend } from './types/friend';
import FriendsList from './components/friends/FriendsList';

function App() {
  const user = useAtomValue(userAtom);
  const { isLoading } = useAuth(user);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const isLoggedIn = !!user;
  const mobileData = useIsMobile();

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget)
      setShowFriendsModal(prev => !prev);
  };

  const toggleFriendsListModal = () => {
    setShowFriendsModal(prev => !prev);
  }

  if(isLoading)
    return <Loading />;

  if (!user)
    return (
      <ErrorHandlingProvider>
        <Header isLoggedIn={isLoggedIn} mobileData={mobileData} setShowFriendsModal={setShowFriendsModal} />
        <Login />
      </ErrorHandlingProvider>
    )
    
  // Desktop layout - always show friends sidebar  
  if(!mobileData.isMobile)
    return (
      <ErrorHandlingProvider>
        <Header isLoggedIn={isLoggedIn} user={user} mobileData={mobileData} setShowFriendsModal={setShowFriendsModal} />
        <div className="main-content">
          <div className="friends-container">
            <FriendsList
              onSelectFriend={(friend) => {
                setSelectedFriend(friend);
                setShowFriendsModal(false);
              }}
              selectedFriend={selectedFriend}
              user={user}
              isMobile={mobileData.isMobile}
            />
          </div>
          <Chat selectedFriend={selectedFriend}/>
        </div>
      </ErrorHandlingProvider>
    );

  // Mobile layout
  return (
    <ErrorHandlingProvider>
      <Header isLoggedIn={isLoggedIn} user={user} mobileData={mobileData} setShowFriendsModal={setShowFriendsModal} selectedFriend={selectedFriend}/>
      <div className="main-content">
        <Chat selectedFriend={selectedFriend}/>
        
        {showFriendsModal && (
          <div className="modal-overlay" onClick={(e) => handleBackdropClick(e)}>
            <div className="modal-content friends-modal">
              <FriendsList 
                onSelectFriend={(friend) => {
                  setSelectedFriend(friend);
                  setShowFriendsModal(false);
                }}
                selectedFriend={selectedFriend}
                user={user}
                isMobile={mobileData.isMobile}
                toggleFriendsListModal={toggleFriendsListModal}
              />
            </div>
          </div>
        )}
      </div>
    </ErrorHandlingProvider>
  );
}

export default App;
