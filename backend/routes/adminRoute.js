import express from 'express';
import { 
  getAdminStats,
  // getAllAppointments,
  updateAppointmentStatus,
  approveAgent,
  approveProperty,
  rejectAgent,
  getAgentRequests,
  rejectProperty,
  allAgents,
  assignPropertyToAgent,
  assignedProperties,
  removeAgent,
  // approveSeller,
} from '../controller/adminController.js';

import { protect, isAdmin } from '../middleware/authmiddleware.js';

const router = express.Router();

// All routes require user to be logged in and be admin
router.use(protect);
router.use(isAdmin);

router.get('/stats', getAdminStats);
// router.get('/appointments', getAllAppointments);
router.put('/appointments/status', updateAppointmentStatus);

router.get('/all-agents', allAgents);
router.get('/agent-requests', getAgentRequests);
router.post('/approve-agent/:userId', approveAgent);
router.post('/reject-agent/:userId', rejectAgent);
router.post('/remove-agent/:userId', removeAgent);

router.put('/approve-property/:propertyId', protect, isAdmin, approveProperty);
router.put('/reject-property/:propertyId', rejectProperty);

router.put('/assign-property', assignPropertyToAgent);
router.get('/assigned-properties', assignedProperties);

export default router;
