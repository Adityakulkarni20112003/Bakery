import React, { useState } from 'react';
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
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };
  
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="font-serif text-2xl font-bold text-primary-600">Sweet Delights</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {/* Only show Home link when user is authenticated */}
            {isAuthenticated && (
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  isActive 
                    ? "text-primary-600 font-medium" 
                    : "text-gray-700 hover:text-primary-600 transition-colors"
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
                    isActive 
                      ? "text-primary-600 font-medium" 
                      : "text-gray-700 hover:text-primary-600 transition-colors"
                  }
                >
                  Dashboard
                </NavLink>
                <NavLink 
                  to="/products" 
                  className={({ isActive }) => 
                    isActive 
                      ? "text-primary-600 font-medium" 
                      : "text-gray-700 hover:text-primary-600 transition-colors"
                  }
                >
                  Products
                </NavLink>
                <NavLink 
                  to="/ai-recipe" 
                  className={({ isActive }) => 
                    isActive 
                      ? "text-primary-600 font-medium" 
                      : "text-gray-700 hover:text-primary-600 transition-colors"
                  }
                >
                  AI Recipes
                </NavLink>
                
                {isAdmin && (
                  <NavLink 
                    to="/admin" 
                    className={({ isActive }) => 
                      isActive 
                        ? "text-primary-600 font-medium flex items-center" 
                        : "text-gray-700 hover:text-primary-600 transition-colors flex items-center"
                    }
                  >
                    <Settings size={16} className="mr-1" />
                    Admin Panel
                  </NavLink>
                )}
              </>
            )}
          </nav>
          
          {/* Authentication and Cart */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center">
                  <img 
                    src={user?.avatar} 
                    alt={user?.name} 
                    className="w-8 h-8 rounded-full object-cover mr-2"
                  />
                  <span className="text-gray-700">{user?.name}</span>
                </div>
                
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
                
                <Link to="/cart" className="relative">
                  <ShoppingCart className="text-gray-700 hover:text-primary-600 transition-colors" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Link>
              </>
            ) : (
              <Link to="/login">
                <Button variant="primary" size="sm">
                  Login
                </Button>
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
      {isMenuOpen && (
        <div className="md:hidden bg-white py-4 px-4 shadow-inner">
          <div className="flex flex-col space-y-4">
            {/* Only show Home link when user is authenticated */}
            {isAuthenticated ? (
              <>
                <NavLink 
                  to="/" 
                  className={({ isActive }) => 
                    isActive 
                      ? "text-primary-600 font-medium" 
                      : "text-gray-700"
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </NavLink>
                
                <NavLink 
                  to="/dashboard" 
                  className={({ isActive }) => 
                    isActive 
                      ? "text-primary-600 font-medium" 
                      : "text-gray-700"
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </NavLink>
                
                <NavLink 
                  to="/products" 
                  className={({ isActive }) => 
                    isActive 
                      ? "text-primary-600 font-medium" 
                      : "text-gray-700"
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Products
                </NavLink>
                
                <NavLink 
                  to="/ai-recipe" 
                  className={({ isActive }) => 
                    isActive 
                      ? "text-primary-600 font-medium" 
                      : "text-gray-700"
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  AI Recipes
                </NavLink>
                
                {isAdmin && (
                  <NavLink 
                    to="/admin" 
                    className={({ isActive }) => 
                      isActive 
                        ? "text-primary-600 font-medium flex items-center" 
                        : "text-gray-700 flex items-center"
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings size={16} className="mr-1" />
                    Admin Panel
                  </NavLink>
                )}
                
                <NavLink 
                  to="/cart" 
                  className={({ isActive }) => 
                    isActive 
                      ? "text-primary-600 font-medium" 
                      : "text-gray-700"
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Cart ({totalItems})
                </NavLink>
                
                <div className="flex items-center py-2">
                  <img 
                    src={user?.avatar} 
                    alt={user?.name} 
                    className="w-8 h-8 rounded-full object-cover mr-2"
                  />
                  <span className="text-gray-700">{user?.name}</span>
                </div>
                
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                <Button variant="primary" fullWidth>
                  <User size={16} className="mr-2" />
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
