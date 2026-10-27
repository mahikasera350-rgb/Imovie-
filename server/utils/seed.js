const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Show = require('../models/Show');
const SeatInventory = require('../models/SeatInventory');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

const seedRecords = async () => {
  console.log('[SEED] Clearing existing records...');
  await Promise.all([
    User.deleteMany(),
    Movie.deleteMany(),
    Theatre.deleteMany(),
    Show.deleteMany(),
    SeatInventory.deleteMany(),
    Booking.deleteMany(),
    Payment.deleteMany(),
    Notification.deleteMany(),
    AuditLog.deleteMany(),
  ]);

  // 1. Seed Users
  console.log('[SEED] Seeding Users...');
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@imovies.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

  const adminUser = await User.create({
    name: 'System Administrator',
    email: adminEmail,
    passwordHash: adminPassword,
    role: 'admin',
    phone: '+91 98765-01990',
    city: 'Mumbai',
  });

  const demoCustomer = await User.create({
    name: 'Sarah Connor',
    email: 'user@imovies.com',
    passwordHash: 'User@123456',
    role: 'customer',
    phone: '+91 98765-01440',
    city: 'Mumbai',
  });

    // 2. Seed Movies
    console.log('[SEED] Seeding Movies...');
    const moviesData = [
      {
        title: 'Dune: Part Two',
        description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.',
        posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
        genres: ['Sci-Fi', 'Adventure', 'Action'],
        languages: ['English', 'Spanish'],
        duration: 166,
        releaseDate: new Date('2024-03-01'),
        cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem'],
        director: 'Denis Villeneuve',
        certification: 'PG-13',
        rating: 8.9,
        status: 'now_showing',
        featured: true,
      },
      {
        title: 'Oppenheimer',
        description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
        posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&auto=format&fit=crop&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&auto=format&fit=crop&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
        genres: ['Biography', 'Drama', 'History'],
        languages: ['English', 'German'],
        duration: 180,
        releaseDate: new Date('2023-07-21'),
        cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.'],
        director: 'Christopher Nolan',
        certification: 'R',
        rating: 8.9,
        status: 'now_showing',
        featured: true,
      },
      {
        title: 'Interstellar: 10th Anniversary',
        description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
        posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1600&auto=format&fit=crop&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
        genres: ['Sci-Fi', 'Drama', 'Adventure'],
        languages: ['English'],
        duration: 169,
        releaseDate: new Date('2024-11-07'),
        cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
        director: 'Christopher Nolan',
        certification: 'PG-13',
        rating: 8.7,
        status: 'now_showing',
        featured: true,
      },
      {
        title: 'Deadpool & Wolverine',
        description: 'Deadpool is offered a place in the Marvel Cinematic Universe by the Time Variance Authority, but instead recruits a variant of Wolverine to save his universe from extinction.',
        posterUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1600&auto=format&fit=crop&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=73_1biulkYk',
        genres: ['Action', 'Comedy', 'Sci-Fi'],
        languages: ['English', 'Spanish'],
        duration: 128,
        releaseDate: new Date('2024-07-26'),
        cast: ['Ryan Reynolds', 'Hugh Jackman', 'Emma Corrin', 'Morena Baccarin'],
        director: 'Shawn Levy',
        certification: 'R',
        rating: 7.9,
        status: 'now_showing',
        featured: false,
      },
      {
        title: 'Cyberpunk: Neon Genesis',
        description: 'In a dystopian mega-city controlled by rival megacorporations, a rebellious cyber-enhanced operative discovers a classified neural network weapon that could shatter the balance of power.',
        posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        genres: ['Sci-Fi', 'Thriller', 'Action'],
        languages: ['English', 'Japanese'],
        duration: 142,
        releaseDate: new Date('2025-01-15'),
        cast: ['Keanu Vance', 'Elena Rostova', 'Kenji Sato'],
        director: 'Alex Garland',
        certification: 'R',
        rating: 8.4,
        status: 'now_showing',
        featured: false,
      },
      {
        title: 'The Batman: Part II',
        description: 'Bruce Wayne delves deeper into Gotham City corruption as new enigmatic villains rise from the flooded underground underworld.',
        posterUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800&auto=format&fit=crop&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=1600&auto=format&fit=crop&q=80',
        trailerUrl: '',
        genres: ['Action', 'Crime', 'Drama'],
        languages: ['English'],
        duration: 175,
        releaseDate: new Date('2026-10-02'),
        cast: ['Robert Pattinson', 'Zoë Kravitz', 'Colin Farrell', 'Jeffrey Wright'],
        director: 'Matt Reeves',
        certification: 'PG-13',
        rating: 8.8,
        status: 'coming_soon',
        featured: false,
      },
      {
        title: 'Avatar: Fire and Ash',
        description: 'Jake Sully and Neytiri encounter the Ash People, a more aggressive volcanic clan of Na\'vi led by Varang, testing their bond and loyalty to Pandora.',
        posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&auto=format&fit=crop&q=80',
        trailerUrl: '',
        genres: ['Sci-Fi', 'Adventure', 'Fantasy'],
        languages: ['English', 'French'],
        duration: 192,
        releaseDate: new Date('2025-12-19'),
        cast: ['Sam Worthington', 'Zoe Saldana', 'Sigourney Weaver', 'Stephen Lang'],
        director: 'James Cameron',
        certification: 'PG-13',
        rating: 8.5,
        status: 'coming_soon',
        featured: false,
      },
      {
        title: 'Gladiator II',
        description: 'Years after witnessing the death of Maximus at the hands of his uncle, Lucius must enter the Colosseum after the emperors of Rome conquer his home.',
        posterUrl: 'https://images.unsplash.com/photo-1460881680858-30d870d7b53c?w=800&auto=format&fit=crop&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=1600&auto=format&fit=crop&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=4rgYUipGJNo',
        genres: ['Action', 'Adventure', 'Drama'],
        languages: ['English'],
        duration: 148,
        releaseDate: new Date('2024-11-22'),
        cast: ['Paul Mescal', 'Pedro Pascal', 'Denzel Washington', 'Connie Nielsen'],
        director: 'Ridley Scott',
        certification: 'R',
        rating: 7.7,
        status: 'now_showing',
        featured: false,
      },
    ];

    const movies = await Movie.insertMany(moviesData);

    // 3. Seed Theatres
    console.log('[SEED] Seeding Theatres...');
    const theatresData = [
      // --- Indian Theatres ---
      {
        name: 'PVR INOX Treasure Island',
        address: 'MG Road, South Tukoganj',
        city: 'Indore',
        phone: '+91 731-4040100',
        facilities: ['Dolby Atmos', '4K Laser Projection', 'Recliner Seats', 'Gourmet Food Court', 'Parking'],
        screens: [
          {
            screenNumber: 1,
            name: 'Audi 1 (Dolby Atmos)',
            format: 'Standard 2D',
            soundSystem: 'Dolby Atmos 7.1',
            seatLayout: {
              rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
              seatsPerRow: 12,
              categoryMap: {
                recliner: ['A'],
                premium: ['B', 'C', 'D'],
                regular: ['E', 'F', 'G', 'H'],
              },
              aisleIndices: [3, 9],
            },
          },
          {
            screenNumber: 2,
            name: 'Audi 2 (3D Laser)',
            format: '3D',
            soundSystem: 'Dolby Atmos Surround',
            seatLayout: {
              rows: ['A', 'B', 'C', 'D', 'E', 'F'],
              seatsPerRow: 12,
              categoryMap: {
                recliner: ['A'],
                premium: ['B', 'C'],
                regular: ['D', 'E', 'F'],
              },
              aisleIndices: [3, 9],
            },
          },
        ],
      },
      {
        name: 'Cinepolis C21 Mall',
        address: 'AB Road, Scheme 54 PU4',
        city: 'Indore',
        phone: '+91 731-4200500',
        facilities: ['Macro XE Large Screen', 'VIP Recliners', 'Café', 'Valet Parking'],
        screens: [
          {
            screenNumber: 1,
            name: 'Audi 1 Macro XE',
            format: 'Dolby Cinema',
            soundSystem: 'Dolby Atmos 12-Channel',
            seatLayout: {
              rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
              seatsPerRow: 14,
              categoryMap: {
                recliner: ['A'],
                premium: ['B', 'C', 'D'],
                regular: ['E', 'F', 'G'],
              },
              aisleIndices: [4, 10],
            },
          },
        ],
      },
      {
        name: 'PVR ICON Phoenix Palladium',
        address: 'High Street Phoenix, Lower Parel',
        city: 'Mumbai',
        phone: '+91 22-66660100',
        facilities: ['IMAX with Laser', 'Dolby Atmos', 'Gold Class Recliners', 'Gourmet Lounge', 'Valet Parking'],
        screens: [
          {
            screenNumber: 1,
            name: 'IMAX Laser Experience',
            format: 'IMAX',
            soundSystem: 'Dolby Atmos 12-Channel',
            seatLayout: {
              rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
              seatsPerRow: 14,
              categoryMap: {
                recliner: ['A'],
                premium: ['B', 'C', 'D'],
                regular: ['E', 'F', 'G', 'H'],
              },
              aisleIndices: [4, 10],
            },
          },
          {
            screenNumber: 2,
            name: 'Screen 2 4DX',
            format: '4DX',
            soundSystem: 'Dolby Atmos',
            seatLayout: {
              rows: ['A', 'B', 'C', 'D', 'E', 'F'],
              seatsPerRow: 12,
              categoryMap: {
                recliner: ['A'],
                premium: ['B', 'C'],
                regular: ['D', 'E', 'F'],
              },
              aisleIndices: [3, 9],
            },
          },
        ],
      },
      {
        name: 'INOX Megaplex Inorbit Mall',
        address: 'Link Road, Malad West',
        city: 'Mumbai',
        phone: '+91 22-40001200',
        facilities: ['ScreenX 270°', 'Dolby Atmos', 'INSIGNIA Lounge', 'Kids Cinema'],
        screens: [
          {
            screenNumber: 1,
            name: 'Audi 1 ScreenX',
            format: 'Dolby Cinema',
            soundSystem: 'Dolby Atmos Surround',
            seatLayout: {
              rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
              seatsPerRow: 12,
              categoryMap: {
                recliner: ['A'],
                premium: ['B', 'C'],
                regular: ['D', 'E', 'F', 'G'],
              },
              aisleIndices: [3, 9],
            },
          },
        ],
      },
      {
        name: 'PVR Plaza Cinema',
        address: 'H-Block, Connaught Place',
        city: 'Delhi',
        phone: '+91 11-23320100',
        facilities: ['Heritage Cinema Hall', '4K Projection', 'Dolby Atmos', 'Executive Seating'],
        screens: [
          {
            screenNumber: 1,
            name: 'Grand Heritage Auditorium',
            format: 'Standard 2D',
            soundSystem: 'Dolby Atmos',
            seatLayout: {
              rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
              seatsPerRow: 14,
              categoryMap: {
                recliner: ['A'],
                premium: ['B', 'C', 'D'],
                regular: ['E', 'F', 'G', 'H'],
              },
              aisleIndices: [4, 10],
            },
          },
        ],
      },
      {
        name: 'PVR Forum Mall IMAX',
        address: 'Hosur Road, Koramangala',
        city: 'Bengaluru',
        phone: '+91 80-22067800',
        facilities: ['IMAX with Laser', 'Dolby Atmos', 'VIP Recliners', 'Café'],
        screens: [
          {
            screenNumber: 1,
            name: 'IMAX Auditorium',
            format: 'IMAX',
            soundSystem: 'Dolby Atmos 12-Channel',
            seatLayout: {
              rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
              seatsPerRow: 14,
              categoryMap: {
                recliner: ['A'],
                premium: ['B', 'C', 'D'],
                regular: ['E', 'F', 'G', 'H'],
              },
              aisleIndices: [4, 10],
            },
          },
        ],
      },
      {
        name: 'PVR Phoenix Marketcity',
        address: 'Viman Nagar, Nagar Road',
        city: 'Pune',
        phone: '+91 20-66890100',
        facilities: ['4DX Experience', 'Dolby Atmos', 'Gold Class', 'Food Court'],
        screens: [
          {
            screenNumber: 1,
            name: 'Audi 1 4DX Motion',
            format: '4DX',
            soundSystem: 'Dolby Atmos',
            seatLayout: {
              rows: ['A', 'B', 'C', 'D', 'E', 'F'],
              seatsPerRow: 12,
              categoryMap: {
                recliner: ['A'],
                premium: ['B', 'C'],
                regular: ['D', 'E', 'F'],
              },
              aisleIndices: [3, 9],
            },
          },
        ],
      },
      // --- International Theatres ---
      {
        name: 'IMovies Grand Cinema & IMAX',
        address: '1540 Broadway, Times Square',
        city: 'New York',
        phone: '+1 212-555-0100',
        facilities: ['IMAX with Laser', 'Dolby Atmos', 'VIP Recliners', 'Gourmet Dining', 'Valet Parking'],
        screens: [
          {
            screenNumber: 1,
            name: 'IMAX Laser Hall 1',
            format: 'IMAX',
            soundSystem: 'Dolby Atmos 12-Channel',
            seatLayout: {
              rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
              seatsPerRow: 14,
              categoryMap: {
                recliner: ['A'],
                premium: ['B', 'C', 'D'],
                regular: ['E', 'F', 'G', 'H'],
              },
              aisleIndices: [4, 10],
            },
          },
          {
            screenNumber: 2,
            name: 'Dolby Cinema Screen 2',
            format: 'Dolby Cinema',
            soundSystem: 'Dolby Atmos Surround',
            seatLayout: {
              rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
              seatsPerRow: 12,
              categoryMap: {
                recliner: ['A'],
                premium: ['B', 'C'],
                regular: ['D', 'E', 'F', 'G'],
              },
              aisleIndices: [3, 9],
            },
          },
        ],
      },
      {
        name: 'IMovies Downtown Multiplex',
        address: '450 Lexington Avenue',
        city: 'New York',
        phone: '+1 212-555-0211',
        facilities: ['Dolby Atmos', '4DX Motion', 'Food Court', 'Wheelchair Accessible'],
        screens: [
          {
            screenNumber: 1,
            name: 'Screen 1 (4DX Experience)',
            format: '4DX',
            soundSystem: 'Dolby Atmos 7.1',
            seatLayout: {
              rows: ['A', 'B', 'C', 'D', 'E', 'F'],
              seatsPerRow: 12,
              categoryMap: {
                recliner: ['A'],
                premium: ['B', 'C'],
                regular: ['D', 'E', 'F'],
              },
              aisleIndices: [3, 9],
            },
          },
        ],
      },
      {
        name: 'IMovies Hollywood Dome',
        address: '6801 Hollywood Blvd',
        city: 'Los Angeles',
        phone: '+1 323-555-0177',
        facilities: ['IMAX', 'VIP Lounge', 'Cocktail Bar', 'Recliner Seats'],
        screens: [
          {
            screenNumber: 1,
            name: 'Grand Auditorium',
            format: 'IMAX',
            soundSystem: 'Dolby Atmos 12-Channel',
            seatLayout: {
              rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
              seatsPerRow: 14,
              categoryMap: {
                recliner: ['A'],
                premium: ['B', 'C', 'D'],
                regular: ['E', 'F', 'G', 'H'],
              },
              aisleIndices: [4, 10],
            },
          },
        ],
      },
      {
        name: 'IMovies Millennium Park',
        address: '201 E Randolph St',
        city: 'Chicago',
        phone: '+1 312-555-0188',
        facilities: ['Dolby Cinema', 'Laser Projection', 'Parking', 'Café'],
        screens: [
          {
            screenNumber: 1,
            name: 'Screen 1',
            format: 'Dolby Cinema',
            soundSystem: 'Dolby Atmos',
            seatLayout: {
              rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
              seatsPerRow: 12,
              categoryMap: {
                recliner: ['A'],
                premium: ['B', 'C'],
                regular: ['D', 'E', 'F', 'G'],
              },
              aisleIndices: [3, 9],
            },
          },
        ],
      },
    ];

    const theatres = await Theatre.insertMany(theatresData);

    // 4. Seed Shows & Seat Inventories
    console.log('[SEED] Seeding Shows & Seat Inventories...');
    const today = new Date();
    const formatDate = (date) => date.toISOString().split('T')[0];

    // Dates: Today, Tomorrow, Day after
    const dates = [0, 1, 2].map((offset) => {
      const d = new Date(today);
      d.setDate(d.getDate() + offset);
      return formatDate(d);
    });

    const nowShowingMovies = movies.filter((m) => m.status === 'now_showing');

    for (const theatre of theatres) {
      for (const screen of theatre.screens) {
        for (const showDate of dates) {
          // Schedule 2 shows per day per screen
          const showSlots = [
            { startHour: 14, startMinute: 30, duration: 150 }, // 2:30 PM
            { startHour: 19, startMinute: 0, duration: 160 },  // 7:00 PM
          ];

          for (let i = 0; i < showSlots.length; i++) {
            const slot = showSlots[i];
            const movie = nowShowingMovies[(theatre.screens.indexOf(screen) + i) % nowShowingMovies.length];

            const startTime = new Date(`${showDate}T${String(slot.startHour).padStart(2, '0')}:${String(slot.startMinute).padStart(2, '0')}:00.000Z`);
            const endTime = new Date(startTime.getTime() + slot.duration * 60 * 1000);

            const show = await Show.create({
              movieId: movie._id,
              theatreId: theatre._id,
              screenNumber: screen.screenNumber,
              screenName: screen.name,
              showDate,
              startTime,
              endTime,
              format: screen.format,
              language: movie.languages[0] || 'English',
              seatPricing: {
                regular: screen.format === 'IMAX' ? 18.0 : 14.0,
                premium: screen.format === 'IMAX' ? 24.0 : 19.5,
                recliner: screen.format === 'IMAX' ? 32.0 : 26.0,
              },
              status: 'active',
            });

            // Populate seat inventory
            const layout = screen.seatLayout;
            const seats = [];

            for (const row of layout.rows) {
              let category = 'regular';
              if (layout.categoryMap.recliner && layout.categoryMap.recliner.includes(row)) {
                category = 'recliner';
              } else if (layout.categoryMap.premium && layout.categoryMap.premium.includes(row)) {
                category = 'premium';
              }

              const price = show.seatPricing[category] || show.seatPricing.regular;

              for (let num = 1; num <= layout.seatsPerRow; num++) {
                // Simulate a few seats booked for realism
                const isPreBooked = (row === 'C' && (num === 4 || num === 5));
                seats.push({
                  showId: show._id,
                  seatNumber: `${row}${num}`,
                  row,
                  number: num,
                  category,
                  price,
                  status: isPreBooked ? 'booked' : 'available',
                });
              }
            }

            await SeatInventory.insertMany(seats, { ordered: false });
          }
        }
      }
    }

    // 5. Seed Welcome Notification for user
    console.log('[SEED] Seeding Sample Notifications...');
    await Notification.create({
      userId: demoCustomer._id,
      title: 'Welcome to IMovies! 🍿',
      type: 'system',
      message: 'Explore the latest blockbusters in IMAX & Dolby Cinema. Use code IMOVIE10 for 10% off your first ticket booking!',
    });

    console.log('[SEED] ✅ Database seeded successfully!');
    console.log('----------------------------------------------------');
    console.log(`🔑 Demo Admin Account:`);
    console.log(`   Email:    ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('🔑 Demo Customer Account:');
    console.log('   Email:    user@imovies.com');
    console.log('   Password: User@123456');
    console.log('----------------------------------------------------');
};

const seedData = async () => {
  try {
    console.log('[SEED] Connecting to database...');
    await connectDB();
    await seedRecords();
    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('[SEED FATAL ERROR]', err);
    await disconnectDB();
    process.exit(1);
  }
};

const ensureDatabaseSeeded = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[AUTO-SEED] Empty database detected. Auto-seeding initial users, movies & theatres...');
      await seedRecords();
      console.log('[AUTO-SEED] ✅ Initial data auto-seeded successfully.');
    }
  } catch (err) {
    console.error('[AUTO-SEED ERROR]', err.message);
  }
};

if (require.main === module) {
  seedData();
}

module.exports = {
  seedData,
  seedRecords,
  ensureDatabaseSeeded,
};
