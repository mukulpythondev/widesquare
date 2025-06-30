import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ChevronDown,
  LogOut,
  Home,
  Search,
  Users,
  MessageCircle,
  UserRound,
  Calculator,
} from "lucide-react";
import logo from "../assets/widesquareLogo.jpeg";
import { useAuth } from "../context/AuthContext";
import PropTypes from "prop-types";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const { isLoggedIn, user, logout } = useAuth();
  const location = useLocation();

  // Handle click outside of dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 bg-white ${
        scrolled
          ? "bg-background/95 shadow-md backdrop-blur-lg border-b border-border"
          : "bg-background/80 backdrop-blur-md border-b border-border"
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <div className="w-full flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
              className="rounded-lg w-[136px] h-[48px] bg-card"
            >
              <img src={logo} alt="Widesquare logo" className="w-full h-full object-cover" />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLinks currentPath={location.pathname} user={user} />

            {/* Become an Agent Button (only if not agent or admin) */}
            {(!user || (user.role !== "admin" && user.role !== "agent" && user.role !== "seller")) && (
              <div className="relative group">
                <button
                  className="ml-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium shadow hover:bg-foreground hover:text-background transition-all flex items-center"
                  type="button"
                >
                  Opportunities
                  <ChevronDown className="ml-2 w-4 h-4" />
                </button>
                <div className="absolute left-0 mt-2 w-48 bg-card rounded-xl shadow-lg py-2 border border-border opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto transition-opacity z-50 bg-white">
                  <Link
                    to="/apply-agent"
                    className="block px-4 py-2 text-muted-foreground hover:bg-muted hover:text-primary transition-colors"
                  >
                    Become an Agent
                  </Link>
                  <Link
                    to="/sell-property"
                    className="block px-4 py-2 text-muted-foreground hover:bg-muted hover:text-primary transition-colors"
                  >
                    Sell Property
                  </Link>
                </div>
              </div>
            )}

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <div className="relative" ref={dropdownRef}>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={toggleDropdown}
                    className="flex items-center space-x-3 focus:outline-none"
                    aria-label="User menu"
                    aria-expanded={isDropdownOpen}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-sm shadow-md hover:shadow-lg transition-shadow">
                        {getInitials(user?.name)}
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-background rounded-full"></div>
                    </div>
                    <motion.div
                      animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </motion.div>
                  </motion.button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-64 bg-card rounded-xl shadow-lg py-2 border border-border overflow-hidden bg-white"
                      >
                        <div className="px-4 py-3 border-b border-border">
                          <p className="text-sm font-semibold text-foreground">
                            {user?.name}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {user?.email}
                          </p>
                        </div>
                        {isLoggedIn && user?.role === 'admin' && (
                          <div className="px-4 py-3 border-b border-border">
                            <Link to="/admin">
                              <motion.button
                                whileHover={{ x: 5 }}
                                className="w-full text-primary-foreground bg-primary px-4 py-2 rounded-lg font-semibold shadow hover:bg-foreground hover:text-background"
                              >
                                <span>Admin Panel</span>
                              </motion.button>
                            </Link>
                          </div>
                        )}
                        {isLoggedIn && user?.role === 'agent' && (
                          <div className="px-4 py-3 border-b border-border">
                            <Link to="/agent-panel">
                              <motion.button
                                whileHover={{ x: 5 }}
                                className="w-full text-primary-foreground bg-primary px-4 py-2 rounded-lg font-semibold shadow hover:bg-foreground hover:text-background"
                              >
                                <span>Agent Panel</span>
                              </motion.button>
                            </Link>
                          </div>
                        )}
                        {isLoggedIn && user?.role === 'seller' && (
                          <div className="px-4 py-3 border-b border-border">
                            <Link to="/seller-panel">
                              <motion.button
                                whileHover={{ x: 5 }}
                                className="w-full text-primary-foreground bg-primary px-4 py-2 rounded-lg font-semibold shadow hover:bg-foreground hover:text-background"
                              >
                                <span>Seller Panel</span>
                              </motion.button>
                            </Link>
                          </div>
                        )}
                        <motion.button
                          whileHover={{ x: 5 }}
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-left text-sm text-destructive hover:bg-destructive hover:text-destructive-foreground flex items-center space-x-2 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign out</span>
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-muted-foreground hover:text-primary font-medium transition-colors"
                  >
                    Sign in
                  </Link>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/signup"
                      className="bg-primary text-primary-foreground px-5 py-2 rounded-lg hover:bg-foreground hover:text-background transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                    >
                      Get started
                    </Link>
                  </motion.div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleMobileMenu}
            className="md:hidden rounded-lg p-2 hover:bg-muted transition-colors focus:outline-none"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-background border-t border-border overflow-hidden bg-white"
          >
            <div className="px-2 pt-3 pb-4">
              <MobileNavLinks
                setMobileMenuOpen={setIsMobileMenuOpen}
                isLoggedIn={isLoggedIn}
                user={user}
                handleLogout={handleLogout}
                currentPath={location.pathname}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

const NavLinks = ({ currentPath, user }) => {
  const navLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "Properties", path: "/properties", icon: Search },
    { name: "EMI Calculator", path: "/emi-calculator", icon: Calculator },
    { name: "Services", path: "/services", icon: Users },
  ];

  // Special animation for sparkles (for AI Property Hub if you want to use it)
  const [sparkleKey, setSparkleKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSparkleKey((prev) => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex space-x-6 items-center ">
      {navLinks.map(({ name, path, icon: Icon }) => {
        const isActive =
          path === "/" ? currentPath === path : currentPath.startsWith(path);

        return (
          <a
            key={name}
            href={path}
            className={`relative font-medium transition-colors duration-200 flex items-center gap-1.5 px-2 py-1
              rounded-md
              ${
                isActive
                  ? "bg-black text-white"
                  : "text-muted-foreground"
              }
              group
              md:hover:rounded-md
              md:hover:bg-black md:hover:text-white
            `}
          >
            <Icon className={`w-4 h-4 transition-colors duration-200 ${isActive ? "text-white" : "text-muted-foreground group-hover:text-white"}`} />
            <span
              className={`transition-colors duration-200 ${
                isActive ? "text-white" : "group-hover:text-white"
              }`}
            >
              {name}
            </span>
            {/* Underline on hover and active */}
            <span
              className={`
                absolute left-0 right-0 -bottom-1 h-0.5 rounded-full
                transition-all duration-200
                ${isActive ? "bg-white w-full" : "bg-white w-0 group-hover:w-full"}
              `}
            />
          </a>
        );
      })}
    </div>
  );
};

const MobileNavLinks = ({
  setMobileMenuOpen,
  isLoggedIn,
  user,
  handleLogout,
  currentPath,
}) => {
  const navLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "Properties", path: "/properties", icon: Search },
    { name: "About Us", path: "/about", icon: Users },
    { name: "Contact", path: "/contact", icon: MessageCircle },
    { name: "EMI Calculator", path: "/emi-calculator", icon: Calculator },
  ];

  const [showOpportunities, setShowOpportunities] = useState(false);
  const showOpportunitiesDropdown = !user || (user.role !== "admin" && user.role !== "agent" && user.role !== "seller");

  const showAgentPanel = user && user.role === "agent";
  const showAdminPanel = user && user.role === "admin";
  const showSellerPanel = user && user.role === "seller";

  return (
    <div className="flex flex-col space-y-1 pb-3 ">
      <div className="w-full px-3 py-1">
        <div className="border-t border-border"></div>
      </div>

      {/* Navigation Links */}
      {navLinks.map(({ name, path, icon: Icon }) => {
        const isActive =
          path === "/" ? currentPath === path : currentPath.startsWith(path);

        return (
          <motion.div key={name} whileTap={{ scale: 0.97 }}>
            <a
              href={path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${isActive
                  ? "bg-muted text-primary font-medium"
                  : "text-muted-foreground hover:bg-black hover:text-white"
                }
              `}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Icon className="w-5 h-5" />
              {name}
            </a>
          </motion.div>
        );
      })}

      {showOpportunitiesDropdown && (
        <div className="px-2">
          <button
            onClick={() => setShowOpportunities((prev) => !prev)}
            className="flex items-center w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium shadow hover:bg-foreground hover:text-background transition-all"
          >
            Opportunities
            <ChevronDown className={`ml-2 w-4 h-4 transform transition-transform ${showOpportunities ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {showOpportunities && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden bg-white"
              >
                <Link
                  to="/apply-agent"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-6 py-2 text-primary hover:underline"
                >
                  Become an Agent
                </Link>
                <Link
                  to="/sell-property"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-6 py-2 text-primary hover:underline"
                >
                  Sell Property
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Admin Panel for Admins */}
      {showAdminPanel && (
        <motion.div whileTap={{ scale: 0.97 }}>
          <Link
            to="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
              ${currentPath.startsWith("/admin")
                ? "bg-muted text-primary font-medium"
                : "text-muted-foreground hover:bg-black hover:text-white"
              }
            `}
          >
            <UserRound className="w-5 h-5" />
            Admin Panel
          </Link>
        </motion.div>
      )}

      {/* Agent Panel for Agents */}
      {showAgentPanel && (
        <motion.div whileTap={{ scale: 0.97 }}>
          <Link
            to="/agent-panel"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
              ${currentPath.startsWith("/agent-panel")
                ? "bg-muted text-primary font-medium"
                : "text-muted-foreground hover:bg-black hover:text-white"
              }
            `}
          >
            <UserRound className="w-5 h-5" />
            Agent Panel
          </Link>
        </motion.div>
      )}

      {/* Seller Panel for Sellers */}
      {showSellerPanel && (
        <motion.div whileTap={{ scale: 0.97 }}>
          <Link
            to="/seller-panel"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
              ${currentPath.startsWith("/seller-panel")
                ? "bg-muted text-primary font-medium"
                : "text-muted-foreground hover:bg-black hover:text-white"
              }
            `}
          >
            <UserRound className="w-5 h-5" />
            Seller Panel
          </Link>
        </motion.div>
      )}

      {/* Auth Buttons for Mobile */}
      <div className="pt-4 mt-2 border-t border-border">
        {isLoggedIn ? (
          <div className="space-y-3 px-3">
            <div className="flex items-center space-x-3 p-2 bg-muted rounded-lg">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-sm shadow-sm">
                {user?.name ? user.name[0].toUpperCase() : "U"}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {user?.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign out</span>
            </motion.button>
          </div>
        ) : (
          <div className="flex flex-col space-y-3 px-3">
            <motion.div whileTap={{ scale: 0.97 }}>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center px-4 py-3 border border-border text-muted-foreground rounded-lg hover:bg-black hover:text-white transition-all font-medium"
              >
                Sign in
              </Link>
            </motion.div>
            <motion.div whileTap={{ scale: 0.97 }}>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-foreground hover:text-background transition-all font-medium shadow-md shadow-primary/20"
              >
                Create account
              </Link>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

NavLinks.propTypes = {
  currentPath: PropTypes.string.isRequired,
  user: PropTypes.object,
};

MobileNavLinks.propTypes = {
  setMobileMenuOpen: PropTypes.func.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  user: PropTypes.object,
  handleLogout: PropTypes.func.isRequired,
  currentPath: PropTypes.string.isRequired,
};

export default Navbar;