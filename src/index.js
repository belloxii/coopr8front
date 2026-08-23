import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './Store/store.';
import { ThemeProvider as AppThemeProvider, useTheme } from './theme/ThemeContext';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { buildMuiTheme } from './theme/mui';

// Bridges our light/dark context into MUI so both styling systems flip together.
const MuiBridge = ({ children }) => {
  const { mode } = useTheme();
  return (
    <MuiThemeProvider theme={buildMuiTheme(mode)}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
    <Provider store={store}>
      <AppThemeProvider>
        <MuiBridge>
          <App />
        </MuiBridge>
      </AppThemeProvider>
    </Provider>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
