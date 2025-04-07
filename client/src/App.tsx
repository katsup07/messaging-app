import { useAtomValue } from 'jotai';
import './App.css'
import Chat from './components/Chat'
import { userAtom } from './atoms/userAtom';
import Login from './components/Login';

import FriendsList, { Friend } from './components/FriendsList';
import { useState } from 'react';
import Header from './components/Header';
import useAuth from './helpers/useAuth';

// TODO: Update isLoggedIn to use the jwt token
function App() {
  const { isLoading } = useAuth();
  const user = useAtomValue(userAtom);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const isLoggedIn = !!user;

  if(isLoading)
    return <div className="loading">Loading...</div>;

  if (!user)
    return (
      <div className="app-container">
        <Header isLoggedIn={isLoggedIn}/>
        <Login />;
      </div>
    )
    

  return (
    <div className="app-container">
      <Header isLoggedIn={isLoggedIn} user={user}/>
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
    </div>
  )
}

export default App
