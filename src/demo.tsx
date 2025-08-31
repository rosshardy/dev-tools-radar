import React from 'react';
import { createRoot } from 'react-dom/client';
import { DevToolRadar } from './components/DevToolRadar';

const App: React.FC = () => {
  return (
    <div style={{ 
      padding: '20px', 
      background: '#f5f7fa',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ maxWidth: '1200px', width: '100%' }}>
        <DevToolRadar width={1000} height={600} />
      </div>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
