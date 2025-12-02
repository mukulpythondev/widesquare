import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "react-error-boundary";
import { motion, AnimatePresence } from "framer-motion";

// User Components
import Navbar from "./components/Navbar";
import Footer from "./components/footer";
import Home from "./pages/Home";
import Properties from "./pages/Properties";
import Aboutus from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./components/login";
import Signup from "./components/signup";
import ForgotPassword from "./components/forgetpassword";
import ResetPassword from "./components/resetpassword";
import NotFoundPage from "./components/Notfound";
import { AuthProvider } from "./context/AuthContext";
import AIPropertyHub from "./pages/Aiagent";
import StructuredData from "./components/SEO/StructuredData";

// Admin Components & Pages
import AdminNavbar from "./components/admin/Navbar";
import AdminProtectedRoute from "./components/admin/ProtectedRoute";
import AdminErrorFallback from "./components/admin/ErrorFallback";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminList from "./pages/admin/List";
import AdminAdd from "./pages/admin/Add";
import AdminUpdate from "./pages/admin/Update";
import AdminAppointments from "./pages/admin/Appointments";
import PropertyDetails from "./components/properties/propertydetail";
import Agent from "./pages/Agent/Agent";
import AgentRequests from "./pages/admin/AgentRequests";
import AgentPanel from "./pages/Agent/AgentPanel";
import AgentAdd from "./pages/Agent/AgentAdd";
import AgentPropertyRequests from "./pages/admin/AgentPropertyRequests";
import ApprovedAgentProperties from "./pages/admin/ApprovedAgentProperties";
import EmiCalculator from "./pages/EmiCalculator";
import SellRentPropertyForm from "./pages/SellRentPropertyForm";
import PropertyRequests from "./pages/admin/PropertyRequests";
import AssignProperty from "./pages/admin/AssignProperty";
import SellerPanel from "./pages/seller/SellerPanel";
import SellerProtectedRoute from './components/seller/SellerProtectedRoute';
import AgentProtectedRoute from "./components/agent/AgentProtectedRoute";
import AssignedProperties from "./pages/admin/AssignedProperties";
import SellerPropertyEdit from "./pages/seller/SellerPropertyEdit";
import AllAgents from "./pages/admin/AllAgents";
import Services from "./pages/admin/Services";
import ServiceEnquiries from "./pages/admin/ServiceEnquiries";
import HomeServices from "./pages/HomeServices";
import AdminBlogs from "./pages/admin/AdminBlogs";
import AdminBlogAdd from "./pages/admin/AdminBlogAdd";
import AdminBlogEdit from "./pages/admin/AdminBlogEdit";
import AdminBlogComments from "./pages/admin/AdminBlogComments";
import BlogList from "./pages/BlogList";
import BlogSingle from "./pages/BlogSingle";
// Page transition variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const App = () => (
  <AuthProvider>
    <ErrorBoundary
      FallbackComponent={AdminErrorFallback}
      onReset={() => window.location.reload()}
    >
      <Router>
        <StructuredData type="website" />
        <StructuredData type="organization" />
        <Navbar />
        <AnimatePresence mode="wait">
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{ duration: 0.3 }}
          >
            <Routes>
              {/* User routes */}
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset/:token" element={<ResetPassword />} />
              <Route path="/" element={<Home />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/properties/single/:id" element={<PropertyDetails />} />
              <Route path="/about" element={<Aboutus />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/apply-agent" element={<Agent />} />
              <Route path="/emi-calculator" element={<EmiCalculator />} />
              <Route path="/ai-property-hub" element={<AIPropertyHub />} />
              <Route path="/sell-property" element={<SellRentPropertyForm />} />
              <Route path="/services" element={<HomeServices />} />





              <Route path="/agent-panel" element={<AgentProtectedRoute />}>
                <Route index element={<AgentPanel />} />
                <Route path="add" element={<AgentAdd />} />
              </Route>
              <Route path="/seller-panel" element={<SellerProtectedRoute />}>
                <Route index element={<SellerPanel />} />
                <Route path="edit/:id" element={<SellerPropertyEdit />} />
              </Route>

              <Route path="/agent-panel/add" element={<AgentAdd />} />
               <Route path="/blogs" element={<BlogList />} />
              <Route path="/blogs/:slug" element={<BlogSingle />} />
              {/* Admin panel routes */}
              <Route path="/admin" element={<AdminProtectedRoute />}>
                <Route element={<AdminNavbar />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="list" element={<AdminList />} />
                  <Route path="add" element={<AdminAdd />} />
                  <Route path="update/:id" element={<AdminUpdate />} />
                  <Route path="appointments" element={<AdminAppointments />} />
                  <Route path="/admin/agent-requests" element={<AgentRequests />} />
                  <Route path="/admin/all-agents" element={<AllAgents />} />
                  <Route path="/admin/agent-property-requests" element={<AgentPropertyRequests />} />
                  <Route path="/admin/agent-approved" element={<ApprovedAgentProperties />} />
                  <Route path="/admin/property-requests" element={<PropertyRequests />} />
                  <Route path="/admin/assign-property" element={<AssignProperty />} />
                  <Route path="/admin/assigned-properties" element={<AssignedProperties />} />
                  <Route path="/admin/add-services" element={<Services />} />
                  <Route path="/admin/service-enquery" element={<ServiceEnquiries />} />
                  <Route path="/admin/blogs" element={<AdminBlogs />} />
                  <Route path="/admin/blogs/add" element={<AdminBlogAdd />} />
                  <Route path="/admin/blogs/edit/:id" element={<AdminBlogEdit />} />
                  <Route path="/admin/blogs/:id/comments" element={<AdminBlogComments />} />
                </Route>
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
        <Footer />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />
      </Router>
    </ErrorBoundary>
  </AuthProvider>
);

export default App;