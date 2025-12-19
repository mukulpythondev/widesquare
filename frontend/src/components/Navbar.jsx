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

/* ---------------- NAVBAR ---------------- */

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const { isLoggedIn, user, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  const getInitials = (name) =>
    name ? name.split(" ").map(w => w[0]).join("").toUpperCase() : "U";

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed inset-x-0 top-0 z-50 bg-white transition-all ${
        scrolled ? "shadow-md border-b" : "border-b"
      }`}
    >
      <div className="px-4 sm:px-6 lg:px-10">
        <div className="h-16 flex items-center justify-between">

          {/* LOGO */}
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Widesquare" className="h-12 w-auto" />
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-6">

            <NavLinks currentPath={location.pathname} />

            {/* Opportunities */}
            {(!user || !["admin", "agent", "seller"].includes(user.role)) && (
              <div className="relative group">
                <button className="px-4 py-2 border border-border text-foreground rounded-lg 
+            hover:bg-black hover:text-white transition flex items-center gap-2">
                  Opportunities <ChevronDown size={16} />
                </button>
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition">
                  <Link to="/apply-agent" className="block px-4 py-2 hover:bg-muted">Become an Agent</Link>
                  <Link to="/sell-property" className="block px-4 py-2 hover:bg-muted">Sell Property</Link>
                </div>
              </div>
            )}

            {/* AUTH */}
            {isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
                    {getInitials(user?.name)}
                  </div>
                  <ChevronDown size={16} />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-lg border overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b">
                        <p className="font-semibold">{user?.name}</p>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                      </div>

                      {user?.role === "admin" && <PanelLink to="/admin" label="Admin Panel" />}
                      {user?.role === "agent" && <PanelLink to="/agent-panel" label="Agent Panel" />}
                      {user?.role === "seller" && <PanelLink to="/seller-panel" label="Seller Panel" />}

                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
  to="/login"
  className="px-4 py-2 rounded-lg text-muted-foreground 
             hover:bg-muted transition flex items-center"
>
  Sign in
</Link>

                <Link to="/signup" className="bg-primary text-black px-5 py-2 rounded-lg">
                  Get started
                </Link>
              </div>
            )}
          </div>

          {/* MOBILE BUTTON */}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden">
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white border-t"
          >
            <MobileNavLinks
              currentPath={location.pathname}
              user={user}
              isLoggedIn={isLoggedIn}
              handleLogout={handleLogout}
              closeMenu={() => setIsMobileMenuOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

/* ---------------- NAV LINKS ---------------- */

const NavLinks = ({ currentPath }) => {
  const primary = [
    { name: "Home", path: "/", icon: Home },
    { name: "Properties", path: "/properties", icon: Search },
    { name: "Property News", path: "/blogs", icon: MessageCircle },
  ];

  const secondary = [
    { name: "About Us", path: "/about", icon: Users },
    { name: "Contact", path: "/contact", icon: MessageCircle },
    { name: "EMI Calculator", path: "/emi-calculator", icon: Calculator },
  ];

  return (
    <div className="flex items-center gap-5">
      {primary.map(({ name, path, icon: Icon }) => (
        <Link
          key={name}
          to={path}
          className={`flex items-center gap-2 px-2 py-1 rounded-md text-lg font-medium
            ${currentPath.startsWith(path) ? "bg-black text-white" : "text-muted-foreground"}
            hover:bg-black hover:text-white`}
        >
          <Icon size={16} /> {name}
        </Link>
      ))}

      <MoreDropdown links={secondary} currentPath={currentPath} />
    </div>
  );
};

/* ---------------- MORE DROPDOWN ---------------- */

const MoreDropdown = ({ links, currentPath }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-3 py-1 text-lg text-muted-foreground hover:bg-black hover:text-white rounded-md"
      >
        More <ChevronDown size={14} className={open ? "rotate-180" : ""} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border z-50"
          >
            {links.map(({ name, path, icon: Icon }) => (
              <Link
                key={name}
                to={path}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-2 text-lg
                  ${currentPath.startsWith(path) ? "bg-muted text-primary" : "hover:bg-muted"}`}
              >
                <Icon size={16} /> {name}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ---------------- HELPERS ---------------- */

const PanelLink = ({ to, label }) => (
  <Link to={to} className="block px-4 py-2 hover:bg-muted font-medium">
    {label}
  </Link>
);

const MobileNavLinks = ({ closeMenu, handleLogout, user, isLoggedIn, currentPath }) => {
  const links = [
    { name: "Home", path: "/" },
    { name: "Properties", path: "/properties" },
    { name: "Blog", path: "/blogs" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
    { name: "EMI Calculator", path: "/emi-calculator" },
  ];

  return (
    <div className="p-4 space-y-2">
      {links.map(l => (
        <Link
          key={l.name}
          to={l.path}
          onClick={closeMenu}
          className={`block px-4 py-3 rounded-lg ${
            currentPath.startsWith(l.path)
              ? "bg-muted font-medium"
              : "hover:bg-muted"
          }`}
        >
          {l.name}
        </Link>
      ))}

      {isLoggedIn && (
        <button
          onClick={() => {
            handleLogout();
            closeMenu();
          }}
          className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg"
        >
          Logout
        </button>
      )}
    </div>
  );
};

NavLinks.propTypes = { currentPath: PropTypes.string.isRequired };
MoreDropdown.propTypes = { links: PropTypes.array, currentPath: PropTypes.string };

export default Navbar;
