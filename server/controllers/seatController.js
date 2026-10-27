const crypto = require('crypto');
const SeatInventory = require('../models/SeatInventory');
const Show = require('../models/Show');
const AppError = require('../utils/appError');
const { broadcastSeatsHeld, broadcastSeatsReleased } = require('../services/socketService');

// Clean up expired holds helper
const releaseExpiredHolds = async (showId) => {
  const now = new Date();
  const expiredSeats = await SeatInventory.find({
    showId,
    status: 'held',
    holdExpiresAt: { $lt: now },
  });

  if (expiredSeats.length > 0) {
    const seatNumbers = expiredSeats.map((s) => s.seatNumber);
    await SeatInventory.updateMany(
      {
        showId,
        status: 'held',
        holdExpiresAt: { $lt: now },
      },
      {
        $set: {
          status: 'available',
          holdToken: null,
          holdExpiresAt: null,
          heldByUserId: null,
        },
      }
    );
    broadcastSeatsReleased(showId.toString(), seatNumbers);
  }
};

// @desc    Get seats for a show with live availability
// @route   GET /api/shows/:id/seats
// @access  Public
const getShowSeats = async (req, res, next) => {
  try {
    const showId = req.params.id;
    const { holdToken } = req.query;

    const show = await Show.findById(showId);
    if (!show) {
      return next(new AppError('Show not found', 404));
    }

    // Release any expired holds before querying
    await releaseExpiredHolds(showId);

    const seats = await SeatInventory.find({ showId }).sort('row number');

    // Format seat payload
    const formattedSeats = seats.map((seat) => {
      const isMyHold = holdToken && seat.status === 'held' && seat.holdToken === holdToken;
      return {
        _id: seat._id,
        seatNumber: seat.seatNumber,
        row: seat.row,
        number: seat.number,
        category: seat.category,
        price: seat.price,
        status: isMyHold ? 'selected_by_me' : seat.status,
        holdExpiresAt: seat.holdExpiresAt,
      };
    });

    res.status(200).json({
      status: 'success',
      data: {
        showId,
        pricing: show.seatPricing,
        seats: formattedSeats,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Place temporary expiring hold on selected seats
// @route   POST /api/bookings/hold-seats
// @access  Public / Authenticated
const holdSeats = async (req, res, next) => {
  try {
    const { showId, seatNumbers, holdToken: clientHoldToken } = req.body;

    if (!showId || !seatNumbers || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      return next(new AppError('Please specify showId and at least one seat number', 400));
    }

    if (seatNumbers.length > 10) {
      return next(new AppError('You cannot hold more than 10 seats at once', 400));
    }

    // Release any already expired holds
    await releaseExpiredHolds(showId);

    const now = new Date();
    const HOLD_DURATION_MS = 5 * 60 * 1000; // 5 minutes
    const holdExpiresAt = new Date(now.getTime() + HOLD_DURATION_MS);
    const holdToken = clientHoldToken || crypto.randomBytes(16).toString('hex');
    const userId = req.user ? req.user.id : null;

    // Atomically attempt to hold each seat
    const heldSeats = [];
    const failedSeats = [];

    for (const seatNumber of seatNumbers) {
      const updatedSeat = await SeatInventory.findOneAndUpdate(
        {
          showId,
          seatNumber,
          $or: [
            { status: 'available' },
            { status: 'held', holdExpiresAt: { $lt: now } },
            { status: 'held', holdToken: holdToken },
          ],
        },
        {
          $set: {
            status: 'held',
            holdToken,
            holdExpiresAt,
            heldByUserId: userId,
          },
        },
        { new: true }
      );

      if (updatedSeat) {
        heldSeats.push(updatedSeat);
      } else {
        failedSeats.push(seatNumber);
      }
    }

    // If any seat could not be held (conflict with another user or already booked)
    if (failedSeats.length > 0) {
      // Rollback any seats we managed to hold in this attempt
      if (heldSeats.length > 0) {
        const rollbackNumbers = heldSeats.map((s) => s.seatNumber);
        await SeatInventory.updateMany(
          {
            showId,
            seatNumber: { $in: rollbackNumbers },
            holdToken,
          },
          {
            $set: {
              status: 'available',
              holdToken: null,
              holdExpiresAt: null,
              heldByUserId: null,
            },
          }
        );
      }

      return next(
        new AppError(
          `Seat(s) ${failedSeats.join(', ')} are no longer available or currently held by another customer.`,
          409
        )
      );
    }

    // Broadcast hold event to other connected clients viewing this show
    broadcastSeatsHeld(showId.toString(), seatNumbers, holdExpiresAt);

    // Calculate verified prices from database
    const subtotal = heldSeats.reduce((sum, s) => sum + s.price, 0);
    const convenienceFee = parseFloat((heldSeats.length * 1.5).toFixed(2));
    const taxes = parseFloat(((subtotal + convenienceFee) * 0.1).toFixed(2)); // 10% tax
    const totalAmount = parseFloat((subtotal + convenienceFee + taxes).toFixed(2));

    res.status(200).json({
      status: 'success',
      data: {
        holdToken,
        holdExpiresAt,
        seats: heldSeats.map((s) => ({
          seatNumber: s.seatNumber,
          category: s.category,
          price: s.price,
        })),
        pricing: {
          subtotal,
          convenienceFee,
          taxes,
          totalAmount,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Explicitly release held seats (e.g. user changes mind or navigates away)
// @route   POST /api/bookings/release-hold
// @access  Public
const releaseHold = async (req, res, next) => {
  try {
    const { showId, holdToken, seatNumbers } = req.body;

    if (!showId || !holdToken) {
      return next(new AppError('showId and holdToken are required', 400));
    }

    const filter = {
      showId,
      holdToken,
      status: 'held',
    };

    if (seatNumbers && Array.isArray(seatNumbers) && seatNumbers.length > 0) {
      filter.seatNumber = { $in: seatNumbers };
    }

    const seatsToRelease = await SeatInventory.find(filter);
    const releasedNumbers = seatsToRelease.map((s) => s.seatNumber);

    if (releasedNumbers.length > 0) {
      await SeatInventory.updateMany(filter, {
        $set: {
          status: 'available',
          holdToken: null,
          holdExpiresAt: null,
          heldByUserId: null,
        },
      });

      broadcastSeatsReleased(showId.toString(), releasedNumbers);
    }

    res.status(200).json({
      status: 'success',
      message: 'Seats released successfully',
      data: { releasedSeats: releasedNumbers },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getShowSeats,
  holdSeats,
  releaseHold,
  releaseExpiredHolds,
};
