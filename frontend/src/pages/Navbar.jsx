import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/transcribe">Transcribe</Link></li>
        <li><Link to="/about">About</Link></li>
      </ul>
    </nav>
  );
}
