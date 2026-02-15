import { HashRouter, Routes, Route } from 'react-router-dom';
import { FilterSelectPage } from './pages/FilterSelectPage';
import { ConfigurePage } from './pages/ConfigurePage';
import './index.css';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<FilterSelectPage />} />
        <Route path="/configure/:filterId" element={<ConfigurePage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
