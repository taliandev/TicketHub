import express from 'express';
import { createReservation, getReservationTTL, cancelReservation } from '../controllers/reservationController.js';

const router = express.Router();

// Create a reservation (hold)
router.post('/', createReservation);

// Get TTL of a reservation
router.get('/:reservationId/ttl', getReservationTTL);

// Cancel a reservation
router.delete('/:reservationId', cancelReservation);

export default router; 