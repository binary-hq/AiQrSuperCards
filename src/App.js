import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FeedbackPage from './Pages/FeedbackPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FeedbackPage />} />
        <Route path="/:id" element={<FeedbackPage />} />
      </Routes>
    </Router>
  );
}

export default App;
