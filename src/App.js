import './App.css';
import { BrowserRouter as Router } from 'react-router-dom';
import Enhancer from './components/Enhancer';


function App() {
   return (
      <>
         <Router>
               <Enhancer />
         </Router>
      </>
   );
}

export default App;
