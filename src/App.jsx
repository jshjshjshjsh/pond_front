import { useState, useEffect } from 'react'
import axios from 'axios';
import reactLogo from './assets/react.svg'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import './App.css'

function Home() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

function HelloPage() {
  const [data, setData] = useState('');

  useEffect(() => {
    axios.get('/api/hello')
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.error('Error fetching data: ', error);
      });
  }, []);

  return (
    <div>
      <h1>Hello from React!</h1>
      <p>Data from server: {data}</p>
      <Link to="/">Go to Home</Link>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hello" element={<HelloPage />} />
      </Routes>
    </Router>
  );
}

export default App