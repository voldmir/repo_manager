import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import TreeView from './components/TreeView';
import ReduxContainer from './components/redux'
import { Routes, Route, MemoryRouter } from "react-router-dom";
import SignInForm from './components/login/login';

const root = createRoot(document.getElementById("root"));

const App = () => {
  return (
    <React.StrictMode>
      <MemoryRouter>
        <Routes>
          <Route exact path={"*"} element={<TreeView />} />
          <Route path={"login"} element={<SignInForm />} />
        </Routes>
      </MemoryRouter>
    </React.StrictMode>
  )
}

root.render(
  <ReduxContainer>
    <App />
  </ReduxContainer>
);
