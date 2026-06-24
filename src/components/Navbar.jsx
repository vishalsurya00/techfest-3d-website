import React from 'react';
import './Navbar.css';

const Navbar = () => {
  const menuItems = ['Home', 'AI', 'Robotics', 'Space', 'Innovation', 'Contact'];

  const handleLinkClick = (e, item) => {
    e.preventDefault();
  };

  return (
    <nav className="navbar-container">
      {/* Brand Logo */}
      <a href="/" className="nav-logo" onClick={(e) => e.preventDefault()}>
        TECH<span>VERSE</span>
      </a>

      {/* Menu Links */}
      <ul className="nav-links">
        {menuItems.map((item) => (
          <li key={item} className="nav-item">
            <a
              href={`#${item.toLowerCase()}`}
              className="nav-link"
              onClick={(e) => handleLinkClick(e, item)}
            >
              {item}
              <div className="nav-link-indicator" />
            </a>
          </li>
        ))}
      </ul>

      {/* Access console status button */}
      <div className="nav-cta">
        <button className="nav-console-btn" onClick={(e) => e.preventDefault()}>
          <span className="status-dot" />
          SYS ACTIVE
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
