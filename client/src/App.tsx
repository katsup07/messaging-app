import { useAtomValue } from 'jotai';
import './App.css'
import Chat from './components/Chat'
import { userAtom } from './atoms/userAtom';
import Login from './components/Login';
import Logout from './components/Logout';

function App() {
  const user = useAtomValue(userAtom);

  if (!user)
    return <Login />;

  return (
   <div className="app-container">
     <Logout />
    <h1>Messenger</h1>
    <Chat />
   </div>
  )
}

export default App
