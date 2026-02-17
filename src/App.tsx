import { HashRouter, Routes, Route } from 'react-router-dom';
import { FilterSelectPage } from './pages/FilterSelectPage';
import { ConfigurePage } from './pages/ConfigurePage';
import { OkapiVersionProvider } from './components/OkapiVersionContext';
import './index.css';

function App() {
  return (
    <HashRouter>
      <OkapiVersionProvider>
        <Routes>
          <Route path="/" element={<FilterSelectPage />} />
          <Route path="/configure/:filterId" element={<ConfigurePage />} />
        </Routes>
      </OkapiVersionProvider>
    </HashRouter>
  );
}

export default App;
