import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const Navbar = () => {
  const { state, logout } = useAuth();
  const { isAuthenticated, user } = state;
  const location = useLocation();

  const authLinks = (
    <div className="flex items-center space-x-4">
      <span className="text-white">Hello, {user?.name}</span>
      <Link to="/profile" className="text-white hover:text-gray-300">
        Profile
      </Link>
      <button
        onClick={logout}
        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
      >
        Logout
      </button>
    </div>
  );

  const guestLinks = (
    <div className="flex space-x-4">
      <Link
        to="/register"
        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
      >
        Register
      </Link>
      <Link
        to="/login"
        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
      >
        Login
      </Link>
    </div>
  );

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-xl font-bold">
          Recruitment Platform
        </Link>

        <div className="flex items-center space-x-4">
          {/* Show Home link if not on home page */}
          {location.pathname !== "/" && (
            <Link
              to="/"
              className="bg-gray-500 hover:bg-gray-600 text-white py-1 px-3 rounded"
            >
              Home
            </Link>
          )}
          {isAuthenticated ? authLinks : guestLinks}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
