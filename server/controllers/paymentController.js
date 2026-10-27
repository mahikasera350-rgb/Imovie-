const crypto = require('crypto');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const SeatInventory = require('../models/SeatInventory');
const Notification = require('../models/Notification');
const AppError = require('../utils/appError');
const { broadcastSeatsBooked, emitNotificationToUser } = require('../services/socketService');

// @desc    Create payment order / initiate payment
// @route   POST /api/payments/create-order
// @access  Private
const createOrder = async (req, res, next) => {
  try {
    const { bookingId, provider = 'demo' } = req.body;

    const booking = await Booking.findById(bookingId).populate('showId');
    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    if (booking.userId.toString() !== req.user.id) {
      return next(new AppError('You are not authorized for this booking', 403));
    }

    if (booking.bookingStatus === 'confirmed') {
      return next(new AppError('This booking is already confirmed', 400));
    }

    // Amount in integer cents or whole currency
    const amountInCents = Math.round(booking.totalAmount * 100);

    // If Razorpay requested and configured
    if (provider === 'razorpay' && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      try {
        // Construct Razorpay order
        const auth = Buffer.from(
          `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
        ).toString('base64');

        const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${auth}`,
          },
          body: JSON.stringify({
            amount: amountInCents,
            currency: 'USD',
            receipt: booking.bookingReference,
            notes: {
              bookingId: booking._id.toString(),
              userId: req.user.id,
            },
          }),
        });

        const rzpData = await rzpResponse.json();

        if (!rzpResponse.ok) {
          return next(new AppError(`Razorpay order creation failed: ${rzpData.error?.description || 'Unknown error'}`, 400));
        }

        const payment = await Payment.create({
          bookingId: booking._id,
          userId: req.user.id,
          provider: 'razorpay',
          providerOrderId: rzpData.id,
          amount: booking.totalAmount,
          currency: 'USD',
          status: 'pending',
          rawResponse: rzpData,
        });

        return res.status(200).json({
          status: 'success',
          provider: 'razorpay',
          data: {
            orderId: rzpData.id,
            amount: rzpData.amount,
            currency: rzpData.currency,
            key: process.env.RAZORPAY_KEY_ID,
            bookingReference: booking.bookingReference,
            paymentId: payment._id,
          },
        });
      } catch (rzpErr) {
        return next(new AppError(`Razorpay service error: ${rzpErr.message}`, 502));
      }
    }

    // Default: Development Demo Payment Mode
    const demoOrderId = `demo_ord_${crypto.randomBytes(8).toString('hex')}`;
    const payment = await Payment.create({
      bookingId: booking._id,
      userId: req.user.id,
      provider: 'demo',
      providerOrderId: demoOrderId,
      amount: booking.totalAmount,
      currency: 'USD',
      status: 'pending',
      rawResponse: { mode: 'SIMULATED_DEMO_PAYMENT' },
    });

    res.status(200).json({
      status: 'success',
      provider: 'demo',
      data: {
        orderId: demoOrderId,
        amount: booking.totalAmount,
        currency: 'USD',
        bookingReference: booking.bookingReference,
        paymentId: payment._id,
        isDemo: true,
        message: 'Development Demo Payment Mode: Simulation only, no real funds charged.',
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify payment and finalize booking confirmation
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res, next) => {
  try {
    const {
      bookingId,
      provider = 'demo',
      providerOrderId,
      providerPaymentId,
      signature,
      simulateFailure = false,
      failureReason,
    } = req.body;

    const booking = await Booking.findById(bookingId).populate('showId');
    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    if (booking.userId.toString() !== req.user.id) {
      return next(new AppError('Unauthorized', 403));
    }

    // Idempotency: If booking is already confirmed, return success immediately
    if (booking.bookingStatus === 'confirmed') {
      const confirmedPayment = await Payment.findOne({ bookingId: booking._id, status: 'success' });
      return res.status(200).json({
        status: 'success',
        message: 'Payment already verified and booking confirmed',
        data: {
          booking,
          payment: confirmedPayment,
        },
      });
    }

    // === Handle Demo Mode ===
    if (provider === 'demo') {
      // Check if user requested simulated failure test
      if (simulateFailure === true) {
        await Payment.findOneAndUpdate(
          { bookingId: booking._id },
          {
            status: 'failed',
            failureReason: failureReason || 'Simulated card decline in Demo Mode',
            verifiedAt: new Date(),
          },
          { new: true, upsert: true }
        );

        booking.paymentStatus = 'failed';
        await booking.save();

        const failNotification = await Notification.create({
          userId: booking.userId,
          title: 'Payment Failed',
          type: 'payment_failed',
          message: `Payment of $${booking.totalAmount} for booking ${booking.bookingReference} failed. Reason: ${failureReason || 'Simulated decline'}.`,
          data: { bookingId: booking._id, bookingReference: booking.bookingReference },
        });

        emitNotificationToUser(booking.userId.toString(), failNotification);

        return res.status(400).json({
          status: 'fail',
          message: failureReason || 'Simulated payment failure (Demo Mode)',
        });
      }

      // Successful Demo Payment
      const demoPaymentId = providerPaymentId || `demo_pay_${crypto.randomBytes(8).toString('hex')}`;
      const payment = await Payment.findOneAndUpdate(
        { bookingId: booking._id },
        {
          provider: 'demo',
          providerOrderId: providerOrderId || `demo_ord_${Date.now()}`,
          providerPaymentId: demoPaymentId,
          status: 'success',
          verifiedAt: new Date(),
        },
        { new: true, upsert: true }
      );

      // Confirm Booking
      booking.bookingStatus = 'confirmed';
      booking.paymentStatus = 'completed';
      await booking.save();

      // ATOMIC UPDATE: Mark seats as permanently booked
      await SeatInventory.updateMany(
        {
          showId: booking.showId._id,
          seatNumber: { $in: booking.seatNumbers },
        },
        {
          $set: {
            status: 'booked',
            bookingId: booking._id,
            holdToken: null,
            holdExpiresAt: null,
          },
        }
      );

      // Broadcast booked seats to all live users
      broadcastSeatsBooked(booking.showId._id.toString(), booking.seatNumbers);

      // Create Success Notification
      const successNotification = await Notification.create({
        userId: booking.userId,
        title: 'Booking Confirmed!',
        type: 'booking_confirmed',
        message: `Your booking (${booking.bookingReference}) for seats ${booking.seatNumbers.join(', ')} is confirmed! Total: $${booking.totalAmount}.`,
        data: { bookingId: booking._id, bookingReference: booking.bookingReference },
      });

      emitNotificationToUser(booking.userId.toString(), successNotification);

      return res.status(200).json({
        status: 'success',
        message: 'Payment verified and booking confirmed successfully',
        data: {
          booking,
          payment,
        },
      });
    }

    // === Handle Razorpay Verification ===
    if (provider === 'razorpay') {
      if (!process.env.RAZORPAY_KEY_SECRET) {
        return next(new AppError('Razorpay secret not configured on server', 500));
      }

      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${providerOrderId}|${providerPaymentId}`)
        .digest('hex');

      if (generatedSignature !== signature) {
        return next(new AppError('Invalid payment signature verification failed', 400));
      }

      const payment = await Payment.findOneAndUpdate(
        { bookingId: booking._id },
        {
          provider: 'razorpay',
          providerOrderId,
          providerPaymentId,
          signature,
          status: 'success',
          verifiedAt: new Date(),
        },
        { new: true, upsert: true }
      );

      booking.bookingStatus = 'confirmed';
      booking.paymentStatus = 'completed';
      await booking.save();

      await SeatInventory.updateMany(
        {
          showId: booking.showId._id,
          seatNumber: { $in: booking.seatNumbers },
        },
        {
          $set: {
            status: 'booked',
            bookingId: booking._id,
            holdToken: null,
            holdExpiresAt: null,
          },
        }
      );

      broadcastSeatsBooked(booking.showId._id.toString(), booking.seatNumbers);

      const successNotification = await Notification.create({
        userId: booking.userId,
        title: 'Booking Confirmed!',
        type: 'booking_confirmed',
        message: `Your booking (${booking.bookingReference}) for seats ${booking.seatNumbers.join(', ')} is confirmed! Total: $${booking.totalAmount}.`,
        data: { bookingId: booking._id, bookingReference: booking.bookingReference },
      });

      emitNotificationToUser(booking.userId.toString(), successNotification);

      return res.status(200).json({
        status: 'success',
        message: 'Razorpay payment verified and booking confirmed',
        data: { booking, payment },
      });
    }

    return next(new AppError('Unsupported payment provider', 400));
  } catch (err) {
    next(err);
  }
};

// @desc    Razorpay Webhook endpoint
// @route   POST /api/payments/webhook
// @access  Public (Webhook signature verified)
const handleWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const webhookSignature = req.headers['x-razorpay-signature'];

    if (webhookSecret && webhookSignature) {
      const shasum = crypto.createHmac('sha256', webhookSecret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest('hex');

      if (digest !== webhookSignature) {
        return res.status(400).json({ status: 'fail', message: 'Invalid webhook signature' });
      }
    }

    const event = req.body.event;
    const payload = req.body.payload?.payment?.entity;

    if (event === 'payment.captured' && payload) {
      const bookingRef = payload.notes?.bookingReference;
      if (bookingRef) {
        const booking = await Booking.findOne({ bookingReference: bookingRef });
        if (booking && booking.bookingStatus !== 'confirmed') {
          booking.bookingStatus = 'confirmed';
          booking.paymentStatus = 'completed';
          await booking.save();

          await SeatInventory.updateMany(
            {
              showId: booking.showId,
              seatNumber: { $in: booking.seatNumbers },
            },
            {
              $set: {
                status: 'booked',
                bookingId: booking._id,
                holdToken: null,
                holdExpiresAt: null,
              },
            }
          );

          broadcastSeatsBooked(booking.showId.toString(), booking.seatNumbers);
        }
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  handleWebhook,
};
