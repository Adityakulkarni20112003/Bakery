import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, Menu, X, User, Settings } from 'lucide-react';
import Button from '../ui/Button';

const Navbar: React.FC = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userMenuToggleRef = useRef<HTMLButtonElement>(null);
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false); // Close mobile menu
    setIsUserMenuOpen(false); // Close user dropdown if open
  };

  // Effect to handle clicks outside the user menu to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node) &&
        userMenuToggleRef.current &&
        !userMenuToggleRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);
  
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="font-sans text-3xl font-bold tracking-tight text-primary-600">Sweet Delights</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {isAuthenticated && (
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  `relative text-sm font-medium pb-1 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:bg-primary-500 after:transition-all after:duration-300 after:ease-in-out ${
                    isActive 
                      ? "text-primary-600 font-semibold after:w-full" 
                      : "text-gray-700 hover:text-primary-600 after:w-0 hover:after:w-full"
                  }`
                }
              >
                Home
              </NavLink>
            )}
            {isAuthenticated && (
              <>
                <NavLink 
                  to="/dashboard" 
                  className={({ isActive }) => 
                    `relative text-sm font-medium pb-1 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:bg-primary-500 after:transition-all after:duration-300 after:ease-in-out ${
                      isActive 
                        ? "text-primary-600 font-semibold after:w-full" 
                        : "text-gray-700 hover:text-primary-600 after:w-0 hover:after:w-full"
                    }`
                  }
                >
                  Dashboard
                </NavLink>
                <NavLink 
                  to="/products" 
                  className={({ isActive }) => 
                    `relative text-sm font-medium pb-1 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:bg-primary-500 after:transition-all after:duration-300 after:ease-in-out ${
                      isActive 
                        ? "text-primary-600 font-semibold after:w-full" 
                        : "text-gray-700 hover:text-primary-600 after:w-0 hover:after:w-full"
                    }`
                  }
                >
                  Products
                </NavLink>
                <NavLink 
                  to="/ai-recipe" 
                  className={({ isActive }) => 
                    `relative text-sm font-medium pb-1 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:bg-primary-500 after:transition-all after:duration-300 after:ease-in-out ${
                      isActive 
                        ? "text-primary-600 font-semibold after:w-full" 
                        : "text-gray-700 hover:text-primary-600 after:w-0 hover:after:w-full"
                    }`
                  }
                >
                  AI Recipes
                </NavLink>
                
                {isAdmin && (
                  <NavLink 
                    to="/admin" 
                    className={({ isActive }) => 
                      `relative text-sm font-medium flex items-center pb-1 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:bg-primary-500 after:transition-all after:duration-300 after:ease-in-out ${
                        isActive 
                          ? "text-primary-600 font-semibold after:w-full" 
                          : "text-gray-700 hover:text-primary-600 after:w-0 hover:after:w-full"
                      }`
                    }
                  >
                    <Settings size={16} className="mr-2" />
                    Admin Panel
                  </NavLink>
                )}
              </>
            )}
          </nav>
          
          {/* Authentication and Cart */}
          <div className="hidden md:flex items-center space-x-5">
            {isAuthenticated ? (
              <>
                {/* User Dropdown Menu */}
                <div className="relative">
                  <button 
                    ref={userMenuToggleRef} 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} 
                    className="flex items-center p-0.5 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white"
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                    id="user-menu-button"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center border-2 border-transparent group-hover:border-primary-200 transition-colors">
                      <User size={18} className="text-gray-600" />
                    </div>
                  </button>
                  {isUserMenuOpen && (
                    <div 
                      ref={userMenuRef} 
                      className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 z-60 origin-top-right ring-1 ring-black/5 focus:outline-none transform transition-all duration-150 ease-out opacity-100 scale-100"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="user-menu-button"
                    >
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-800 truncate">{user?.name || 'Valued Customer'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email || 'No email provided'}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/dashboard"
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-600 transition-colors"
                          role="menuitem"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          My Dashboard
                        </Link>
                        {isAdmin && (
                           <Link
                           to="/admin"
                           className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-600 transition-colors"
                           role="menuitem"
                           onClick={() => setIsUserMenuOpen(false)}
                         >
                           Admin Panel
                         </Link>
                        )}
                      </div>
                      <div className="py-1 border-t border-gray-200">
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                          role="menuitem"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Cart Icon */}
                <Link to="/cart" className="relative text-gray-600 hover:text-primary-600 transition-colors p-2 rounded-full hover:bg-gray-100">
                  <ShoppingCart size={22} />
                  {totalItems > 0 && (
                    <span className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-primary-600 text-white text-[10px] font-semibold rounded-full h-4.5 w-4.5 min-w-[18px] flex items-center justify-center p-0.5">
                      {totalItems}
                    </span>
                  )}
                </Link>
              </>
            ) : (
              <Link to="/login" className="inline-block">
                <div className="relative inline-block overflow-hidden group rounded-md"> {/* Shine effect wrapper */}
                  <Button variant="primary" size="sm" className="bg-primary-600 hover:bg-primary-700 focus-visible:ring-primary-500">
                    <User size={16} className="mr-2" />
                    Login
                  </Button>
                  <span className="absolute top-0 right-0 w-12 h-full bg-white/20 skew-x-[-20deg] transform translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out pointer-events-none"></span>
                </div>
              </Link>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button className="md:hidden text-gray-700" onClick={toggleMenu}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div 
        className={`md:hidden fixed inset-x-0 top-[calc(theme(spacing.16)+1px)] bg-white shadow-lg z-40 transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        {isMenuOpen && (
          <div className="px-4 pt-4 pb-6 space-y-3 border-t border-gray-200">
            {isAuthenticated ? (
              <>
                <div className="px-2 py-3 border-b border-gray-200 mb-2">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border-2 border-primary-200">
                      <User size={22} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{user?.name || 'Valued Customer'}</p>
                      <p className="text-xs text-gray-500">{user?.email || 'No email provided'}</p>
                    </div>
                  </div>
                </div>

                {[ 
                  { to: "/", label: "Home" },
                  { to: "/dashboard", label: "Dashboard" },
                  { to: "/products", label: "Products" },
                  { to: "/ai-recipe", label: "AI Recipes" },
                  ...(isAdmin ? [{ to: "/admin", label: "Admin Panel", icon: <Settings size={18} className="mr-2" /> }] : []),
                  { to: "/cart", label: `Cart (${totalItems})`, icon: <ShoppingCart size={18} className="mr-2" /> }
                ].map(item => (
                  <NavLink 
                    key={item.to}
                    to={item.to} 
                    className={({ isActive }) => 
                      `px-3 py-2.5 rounded-md text-base font-medium flex items-center transition-colors duration-150 ${
                        isActive 
                          ? "bg-primary-50 text-primary-700" 
                          : "text-gray-700 hover:bg-gray-100 hover:text-primary-600"
                      }`
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.icon}
                    {item.label}
                  </NavLink>
                ))}
                
                <Button 
                  variant="outline"
                  fullWidth 
                  onClick={handleLogout} 
                  className="mt-4 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block">
                <div className="relative block overflow-hidden group rounded-md"> {/* Shine effect wrapper - using block for fullWidth button */}
                  <Button variant="primary" fullWidth className="bg-primary-600 hover:bg-primary-700 focus-visible:ring-primary-500">
                    <User size={18} className="mr-2" />
                    Login
                  </Button>
                  <span className="absolute top-0 right-0 w-12 h-full bg-white/20 skew-x-[-20deg] transform translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out pointer-events-none"></span>
                </div>
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
