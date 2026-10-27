import React from 'react';
import { formatCurrency } from '../../utils/formatters';

const SeatGrid = ({
  seats = [],
  selectedSeats = [],
  pricing = {},
  onToggleSeat,
}) => {
  // Group seats by row
  const rowsMap = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) {
      acc[seat.row] = [];
    }
    acc[seat.row].push(seat);
    return acc;
  }, {});

  // Sort seats in each row by number
  Object.keys(rowsMap).forEach((r) => {
    rowsMap[r].sort((a, b) => a.number - b.number);
  });

  const getSeatClassName = (seat) => {
    const isSelected = selectedSeats.includes(seat.seatNumber);

    if (isSelected) {
      return 'seat seat-selected';
    }
    if (seat.status === 'booked') {
      return 'seat seat-booked';
    }
    if (seat.status === 'held') {
      return 'seat seat-held';
    }
    if (seat.category === 'recliner') {
      return 'seat seat-available-recliner';
    }
    if (seat.category === 'premium') {
      return 'seat seat-available-premium';
    }
    return 'seat seat-available-regular';
  };

  const handleSeatClick = (seat) => {
    if (seat.status === 'booked' || seat.status === 'held') {
      return;
    }
    onToggleSeat(seat.seatNumber);
  };

  return (
    <div className="py-3">
      {/* Curved Screen Graphics */}
      <div className="cinema-screen-container">
        <div className="cinema-screen"></div>
        <div className="cinema-screen-text">All eyes this way • Screen</div>
      </div>

      {/* Seat Rows */}
      <div className="d-flex flex-column align-items-center gap-2 overflow-x-auto py-2">
        {Object.keys(rowsMap).map((rowLetter) => (
          <div key={rowLetter} className="d-flex align-items-center gap-2">
            {/* Row Identifier */}
            <span
              className="fw-bold text-secondary small text-center"
              style={{ width: '22px' }}
            >
              {rowLetter}
            </span>

            {/* Seats */}
            <div className="d-flex gap-1">
              {rowsMap[rowLetter].map((seat, index) => {
                // Add aisle gap after seat 3 and 9 if appropriate
                const isAisleGap = index === 3 || index === 9;
                return (
                  <React.Fragment key={seat.seatNumber}>
                    <div
                      className={getSeatClassName(seat)}
                      onClick={() => handleSeatClick(seat)}
                      title={`${seat.seatNumber} (${seat.category.toUpperCase()}) - ${formatCurrency(seat.price)} - ${seat.status.toUpperCase()}`}
                    >
                      {seat.number}
                    </div>
                    {isAisleGap && <div style={{ width: '14px' }}></div>}
                  </React.Fragment>
                );
              })}
            </div>

            <span
              className="fw-bold text-secondary small text-center"
              style={{ width: '22px' }}
            >
              {rowLetter}
            </span>
          </div>
        ))}
      </div>

      {/* Seat Legend */}
      <div className="d-flex flex-wrap justify-content-center align-items-center gap-3 gap-md-4 mt-5 p-3 rounded bg-cinematic-card border border-secondary">
        <div className="d-flex align-items-center gap-2 small">
          <div className="seat seat-available-regular" style={{ cursor: 'default' }}></div>
          <span>Regular ({formatCurrency(pricing.regular || 14)})</span>
        </div>

        <div className="d-flex align-items-center gap-2 small">
          <div className="seat seat-available-premium" style={{ cursor: 'default' }}></div>
          <span>Premium ({formatCurrency(pricing.premium || 19.5)})</span>
        </div>

        <div className="d-flex align-items-center gap-2 small">
          <div className="seat seat-available-recliner" style={{ cursor: 'default' }}></div>
          <span>Recliner ({formatCurrency(pricing.recliner || 26)})</span>
        </div>

        <div className="d-flex align-items-center gap-2 small">
          <div className="seat seat-selected" style={{ cursor: 'default' }}></div>
          <span>Selected</span>
        </div>

        <div className="d-flex align-items-center gap-2 small">
          <div className="seat seat-held" style={{ cursor: 'default' }}></div>
          <span>On Hold</span>
        </div>

        <div className="d-flex align-items-center gap-2 small">
          <div className="seat seat-booked" style={{ cursor: 'default' }}></div>
          <span>Sold Out</span>
        </div>
      </div>
    </div>
  );
};

export default SeatGrid;
