import logo from './logo.svg';
import './App.css';
import FeedbackPage from './Pages/FeedbackPage';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/:id" element={<FeedbackPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;

