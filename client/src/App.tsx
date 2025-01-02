import { useAtomValue } from 'jotai';
import './App.css'
import Chat from './components/Chat'
import { userAtom } from './atoms/userAtom';
import Login from './components/Login';
import Logout from './components/Logout';
import FriendsList from './components/FriendsList';
import { useState } from 'react';

function App() {
  const user = useAtomValue(userAtom);
    const [selectedFriend, setSelectedFriend] = useState<string | null>(null);

  if (!user)
    return <Login />;

  return (
   <div className="app-container">
     <Logout />
    <h1>Messenger</h1>
    <FriendsList 
    friends={[{id: 1, name:'Luke'}, {id: 2, name:'Lucy'}, {id: 3, name: 'John'}]} 
    onSelectFriend={setSelectedFriend}
    selectedFriend={selectedFriend}
    />
    <Chat selectedFriend={selectedFriend}/>
   </div>
  )
}

export default App
