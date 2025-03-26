import {
  EventStatus,
  OrderStatus,
  PayoutFrequency,
  Prisma,
  PrismaClient,
  TicketStatus,
  type User,
  VerificationStatus,
} from '@prisma/client';
import { auth } from '@repo/auth/server';

const prisma = new PrismaClient();

const users = [
  {
    email: 'contact@soundwave.com',
    name: 'Soundwave Productions',
    emailVerified: true,
    role: 'organizer',
    organization: 'over-and-above',
  },
  {
    email: 'events@sportsmaster.com',
    name: 'SportsMaster Events',
    emailVerified: true,
    role: 'organizer',
    organization: 'city-stadium',
  },
  {
    email: 'john.doe@email.com',
    name: 'John Doe',
    emailVerified: true,
    role: 'customer',
  },
  {
    email: 'jane.smith@email.com',
    name: 'Jane Smith',
    emailVerified: true,
    role: 'customer',
  },
  {
    email: 'admin@ticketcare.com',
    name: 'Admin',
    emailVerified: true,
    role: 'super-admin',
    organization: 'ticket-care',
  },
];

// Define premium tiers for events
const premiumTiers = [
  {
    name: 'Basic Premium',
    description: 'Entry-level premium tier with increased ticket capacity',
    maxTicketsPerEvent: 50,
    price: 19.99,
    isActive: true,
  },
  {
    name: 'Standard Premium',
    description: 'Mid-level premium tier with higher ticket capacity',
    maxTicketsPerEvent: 100,
    price: 39.99,
    isActive: true,
  },
  {
    name: 'Pro Premium',
    description: 'Top-level premium tier with maximum ticket capacity',
    maxTicketsPerEvent: 200,
    price: 79.99,
    isActive: true,
  },
  {
    name: 'Enterprise',
    description: 'Enterprise-level tier for large events',
    maxTicketsPerEvent: 500,
    price: 149.99,
    isActive: false,
  },
];

async function main() {
  // Log start message without using process.stdout directly
  process.stdout.write('Starting database seed...\n');

  // Clean up existing data
  await prisma.$transaction([
    prisma.organization.deleteMany(),
    prisma.inventory.deleteMany(),
    prisma.timeSlot.deleteMany(),
    prisma.ticket.deleteMany(),
    prisma.ticketType.deleteMany(),
    prisma.eventDate.deleteMany(),
    prisma.order.deleteMany(),
    prisma.premiumTier.deleteMany(),
    prisma.event.deleteMany(),
    prisma.venue.deleteMany(),
    prisma.organizer.deleteMany(),
    prisma.account.deleteMany(),
    prisma.session.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // Create organization
  const ticketCareOrg = await prisma.organization.create({
    data: {
      name: 'TicketCare',
      slug: 'ticket-care',
    },
  });

  const overAndAboveOrg = await prisma.organization.create({
    data: {
      name: 'Over & Above',
      slug: 'over-and-above',
    },
  });

  const cityStadiumOrg = await prisma.organization.create({
    data: {
      name: 'City Stadium',
      slug: 'city-stadium',
    },
  });

  const usersCreated: User[] = [];

  // Create users
  for (const userData of users) {
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        emailVerified: userData.emailVerified,
        role: userData.role,
      },
    });

    // create account for password based login
    const ctx = await auth.$context;
    const hash = await ctx.password.hash('abcd1234');

    await prisma.account.create({
      data: {
        accountId: user.id,
        userId: user.id,
        providerId: 'credential',
        password: hash,
      },
    });

    // Assign users to organizations
    if (userData.organization) {
      await prisma.member.create({
        data: {
          organizationId:
            userData.organization === 'over-and-above'
              ? overAndAboveOrg.id
              : userData.organization === 'city-stadium'
                ? cityStadiumOrg.id
                : ticketCareOrg.id,
          userId: user.id,
          role: 'owner',
          createdAt: new Date(),
        },
      });
    }

    usersCreated.push(user);
  }

  // Create Organizers
  await prisma.organizer.create({
    data: {
      userId: usersCreated[4].id,
      name: 'TicketCare',
      slug: 'ticket-care',
      description: 'TicketCare',
      email: 'contact@ticketcare.com',
      phone: '+1234567890',
      verificationStatus: VerificationStatus.verified,
      payoutFrequency: PayoutFrequency.monthly,
      commissionRate: new Prisma.Decimal(10.0),
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true,
    },
  });

  const musicOrganizer = await prisma.organizer.create({
    data: {
      userId: usersCreated[0].id,
      name: 'Soundwave Productions',
      slug: 'soundwave-productions',
      description: 'Leading music event organizer',
      email: 'contact@soundwave.com',
      phone: '+1234567890',
      verificationStatus: VerificationStatus.verified,
      payoutFrequency: PayoutFrequency.monthly,
      commissionRate: new Prisma.Decimal(10.0),
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true,
    },
  });

  const sportsOrganizer = await prisma.organizer.create({
    data: {
      userId: usersCreated[1].id,
      name: 'SportsMaster Events',
      slug: 'sportsmaster-events',
      description: 'Professional sports event management',
      email: 'events@sportsmaster.com',
      phone: '+1987654321',
      verificationStatus: VerificationStatus.verified,
      payoutFrequency: PayoutFrequency.biweekly,
      commissionRate: new Prisma.Decimal(12.5),
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
    },
  });

  // Create Premium Tiers
  const premiumTiersCreated: { id: string; maxTicketsPerEvent: number }[] = [];

  for (const tierData of premiumTiers) {
    const tier = await prisma.premiumTier.create({
      data: {
        name: tierData.name,
        description: tierData.description,
        maxTicketsPerEvent: tierData.maxTicketsPerEvent,
        price: new Prisma.Decimal(tierData.price),
        isActive: tierData.isActive,
      },
    });
    premiumTiersCreated.push({
      id: tier.id,
      maxTicketsPerEvent: tier.maxTicketsPerEvent,
    });
  }

  // Create Venues
  const arena = await prisma.venue.create({
    data: {
      name: 'Over And Above Club',
      slug: 'over-and-above-club',
      description: 'State-of-the-art concert venue',
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      postalCode: '10001',
      totalCapacity: 5000,
      // amenities: ['Parking', 'VIP Lounges', 'Food Court'],
      // parking: true,
      // accessibility: true,
      // food: true,
      // drinks: true,
      // ageRestriction: 18,
      // dresscode: 'Smart Casual',
      // customRules: ['No cameras', 'No outside food'],
    },
  });

  const stadium = await prisma.venue.create({
    data: {
      name: 'City Stadium',
      slug: 'city-stadium',
      description: 'Multi-purpose sports facility',
      address: '456 Sports Avenue',
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      postalCode: '90001',
      totalCapacity: 15000,
      // amenities: ['Parking', 'Food Stalls', 'First Aid'],
      // parking: true,
      // accessibility: true,
      // food: true,
      // drinks: true,
      // ageRestriction: 0,
      // customRules: ['Clear bag policy'],
    },
  });

  // Create Events
  const musicEvent = await prisma.event.create({
    data: {
      organizerId: musicOrganizer.id,
      venueId: arena.id,
      venueName: arena.name,
      title: 'Summer Music Festival',
      slug: 'summer-music-festival-2024',
      description: 'A day of amazing music performances',
      category: ['music', 'festival'],
      startTime: new Date('2024-07-15T18:00:00Z'),
      endTime: new Date('2024-07-16T02:00:00Z'),
      doorsOpen: new Date('2024-07-15T16:00:00Z'),
      status: EventStatus.published,
      isPublic: true,
      requiresApproval: false,
      waitingListEnabled: true,
      refundPolicy: '48 hours before event',
      isPremiumEvent: true, // This is a premium event
      premiumTierId: premiumTiersCreated[1].id, // Using Standard Premium tier
      maxTicketsPerEvent: premiumTiersCreated[1].maxTicketsPerEvent, // Set max tickets based on the premium tier
    },
  });

  const sportsEvent = await prisma.event.create({
    data: {
      organizerId: sportsOrganizer.id,
      venueId: stadium.id,
      venueName: stadium.name,
      title: 'Championship Finals',
      slug: 'championship-finals-2024',
      description: 'The ultimate showdown',
      category: ['sports', 'championship'],
      startTime: new Date('2024-08-20T19:00:00Z'),
      endTime: new Date('2024-08-20T22:00:00Z'),
      doorsOpen: new Date('2024-08-20T17:00:00Z'),
      status: EventStatus.published,
      isPublic: true,
      requiresApproval: false,
      waitingListEnabled: false,
      refundPolicy: '72 hours before event',
      isPremiumEvent: false, // This is a free event
      maxTicketsPerEvent: 20, // Default limit for free events
    },
  });

  // Create another premium event with Pro tier
  const premiumConcertEvent = await prisma.event.create({
    data: {
      organizerId: musicOrganizer.id,
      venueId: arena.id,
      venueName: arena.name,
      title: 'Pro Premium Concert Series',
      slug: 'pro-premium-concert-series-2024',
      description: 'Exclusive concert series with top artists',
      category: ['music', 'concert', 'premium'],
      startTime: new Date('2024-09-10T19:00:00Z'),
      endTime: new Date('2024-09-10T23:00:00Z'),
      doorsOpen: new Date('2024-09-10T17:00:00Z'),
      status: EventStatus.published,
      isPublic: true,
      requiresApproval: false,
      waitingListEnabled: true,
      refundPolicy: '48 hours before event',
      isPremiumEvent: true, // This is a premium event
      premiumTierId: premiumTiersCreated[2].id, // Using Pro Premium tier
      maxTicketsPerEvent: premiumTiersCreated[2].maxTicketsPerEvent, // Set max tickets based on the premium tier
    },
  });

  // Create Event Dates and Time Slots for all events
  // Using the event dates in the inventory creation later
  const musicEventDate = await prisma.eventDate.create({
    data: {
      eventId: musicEvent.id,
      date: new Date('2024-07-15'),
      timeSlots: {
        create: [
          {
            startTime: new Date('2024-07-15T18:00:00Z'),
            endTime: new Date('2024-07-16T02:00:00Z'),
            doorsOpen: new Date('2024-07-15T16:00:00Z'),
          },
        ],
      },
    },
  });

  // Create event dates for sports event
  // Using the event dates in the inventory creation later
  const sportsEventDate = await prisma.eventDate.create({
    data: {
      eventId: sportsEvent.id,
      date: new Date('2024-08-20'),
      timeSlots: {
        create: [
          {
            startTime: new Date('2024-08-20T19:00:00Z'),
            endTime: new Date('2024-08-20T22:00:00Z'),
            doorsOpen: new Date('2024-08-20T17:00:00Z'),
          },
        ],
      },
    },
  });

  // Create event dates for premium concert event
  // Using the event dates in the inventory creation later
  const premiumConcertEventDate = await prisma.eventDate.create({
    data: {
      eventId: premiumConcertEvent.id,
      date: new Date('2024-09-15'),
      timeSlots: {
        create: [
          {
            startTime: new Date('2024-09-15T18:00:00Z'),
            endTime: new Date('2024-09-16T02:00:00Z'),
            doorsOpen: new Date('2024-09-15T16:00:00Z'),
          },
        ],
      },
    },
  });

  // Create Ticket Types with Inventory for all events
  const vipTicketType = await prisma.ticketType.create({
    data: {
      eventId: musicEvent.id,
      name: 'VIP Experience',
      description:
        'Premium access with exclusive backstage tour and meet & greet',
      price: new Prisma.Decimal(299.99),
      maxPerOrder: 4,
      minPerOrder: 1,
      saleStartTime: new Date(),
      saleEndTime: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    },
  });

  const frontRowTicketType = await prisma.ticketType.create({
    data: {
      eventId: musicEvent.id,
      name: 'Front Row Access',
      description: 'Best seats in the house with complimentary drinks',
      price: new Prisma.Decimal(199.99),
      maxPerOrder: 6,
      minPerOrder: 1,
      saleStartTime: new Date(),
      saleEndTime: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    },
  });

  const earlyBirdTicketType = await prisma.ticketType.create({
    data: {
      eventId: musicEvent.id,
      name: 'Early Bird Special',
      description: 'Limited time offer for early bookings',
      price: new Prisma.Decimal(79.99),
      maxPerOrder: 8,
      minPerOrder: 1,
      saleStartTime: new Date(),
      saleEndTime: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    },
  });

  const standardTicketType = await prisma.ticketType.create({
    data: {
      eventId: musicEvent.id,
      name: 'Standard Entry',
      description: 'Regular admission with great views',
      price: new Prisma.Decimal(129.99),
      maxPerOrder: 10,
      minPerOrder: 1,
      saleStartTime: new Date(),
      saleEndTime: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    },
  });

  const studentTicketType = await prisma.ticketType.create({
    data: {
      eventId: musicEvent.id,
      name: 'Student Pass',
      description: 'Special rate for students with valid ID',
      price: new Prisma.Decimal(59.99),
      maxPerOrder: 2,
      minPerOrder: 1,
      saleStartTime: new Date(),
      saleEndTime: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    },
  });

  const regularTicketType = await prisma.ticketType.create({
    data: {
      eventId: sportsEvent.id,
      name: 'Regular Admission',
      description: 'Standard seating with good views',
      price: new Prisma.Decimal(79.99),
      maxPerOrder: 8,
      minPerOrder: 1,
      saleStartTime: new Date(),
      saleEndTime: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    },
  });

  const premiumTicketType = await prisma.ticketType.create({
    data: {
      eventId: sportsEvent.id,
      name: 'Premium Box',
      description: 'Exclusive box seating with premium amenities',
      price: new Prisma.Decimal(249.99),
      maxPerOrder: 6,
      minPerOrder: 1,
      saleStartTime: new Date(),
      saleEndTime: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    },
  });

  const familyTicketType = await prisma.ticketType.create({
    data: {
      eventId: sportsEvent.id,
      name: 'Family Package',
      description: 'Special package for families, includes snacks',
      price: new Prisma.Decimal(199.99),
      maxPerOrder: 2,
      minPerOrder: 1,
      saleStartTime: new Date(),
      saleEndTime: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    },
  });

  const courtSideTicketType = await prisma.ticketType.create({
    data: {
      eventId: sportsEvent.id,
      name: 'Courtside VIP',
      description: 'Best seats in the house, closest to the action',
      price: new Prisma.Decimal(399.99),
      maxPerOrder: 4,
      minPerOrder: 1,
      saleStartTime: new Date(),
      saleEndTime: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    },
  });

  const studentSportTicketType = await prisma.ticketType.create({
    data: {
      eventId: sportsEvent.id,
      name: 'Student Special',
      description: 'Discounted rate for students with valid ID',
      price: new Prisma.Decimal(49.99),
      maxPerOrder: 1,
      minPerOrder: 1,
      saleStartTime: new Date(),
      saleEndTime: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    },
  });

  // Create ticket types for premium concert event
  const vipPremiumTicketType = await prisma.ticketType.create({
    data: {
      eventId: premiumConcertEvent.id,
      name: 'Pro VIP Experience',
      description: 'Ultimate VIP experience with exclusive perks',
      price: new Prisma.Decimal(399.99),
      maxPerOrder: 4,
      minPerOrder: 1,
      saleStartTime: new Date(),
      saleEndTime: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    },
  });

  const premiumStandardTicketType = await prisma.ticketType.create({
    data: {
      eventId: premiumConcertEvent.id,
      name: 'Premium Standard',
      description: 'Premium standard admission with great amenities',
      price: new Prisma.Decimal(199.99),
      maxPerOrder: 6,
      minPerOrder: 1,
      saleStartTime: new Date(),
      saleEndTime: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    },
  });

  // Create Inventory for each time slot
  const musicTimeSlots = await prisma.timeSlot.findMany({
    where: {
      eventDate: {
        eventId: musicEvent.id,
      },
    },
  });

  for (const timeSlot of musicTimeSlots) {
    await prisma.inventory.createMany({
      data: [
        {
          timeSlotId: timeSlot.id,
          ticketTypeId: vipTicketType.id,
          quantity: 50,
        },
        {
          timeSlotId: timeSlot.id,
          ticketTypeId: frontRowTicketType.id,
          quantity: 100,
        },
        {
          timeSlotId: timeSlot.id,
          ticketTypeId: earlyBirdTicketType.id,
          quantity: 200,
        },
        {
          timeSlotId: timeSlot.id,
          ticketTypeId: standardTicketType.id,
          quantity: 300,
        },
        {
          timeSlotId: timeSlot.id,
          ticketTypeId: studentTicketType.id,
          quantity: 150,
        },
      ],
    });
  }

  const sportsEventTimeSlots = await prisma.timeSlot.findMany({
    where: {
      eventDate: {
        eventId: sportsEvent.id,
      },
    },
  });

  // Get time slots for premium concert event
  const premiumConcertTimeSlots = await prisma.timeSlot.findMany({
    where: {
      eventDate: {
        eventId: premiumConcertEvent.id,
      },
    },
  });

  for (const timeSlot of sportsEventTimeSlots) {
    await prisma.inventory.createMany({
      data: [
        {
          timeSlotId: timeSlot.id,
          ticketTypeId: regularTicketType.id,
          quantity: 500,
        },
        {
          timeSlotId: timeSlot.id,
          ticketTypeId: premiumTicketType.id,
          quantity: 100,
        },
        {
          timeSlotId: timeSlot.id,
          ticketTypeId: familyTicketType.id,
          quantity: 200,
        },
        {
          timeSlotId: timeSlot.id,
          ticketTypeId: courtSideTicketType.id,
          quantity: 50,
        },
        {
          timeSlotId: timeSlot.id,
          ticketTypeId: studentSportTicketType.id,
          quantity: 300,
        },
      ],
    });
  }

  // Create inventory for premium concert event
  for (const timeSlot of premiumConcertTimeSlots) {
    await prisma.inventory.createMany({
      data: [
        {
          timeSlotId: timeSlot.id,
          ticketTypeId: vipPremiumTicketType.id,
          quantity: 75,
        },
        {
          timeSlotId: timeSlot.id,
          ticketTypeId: premiumStandardTicketType.id,
          quantity: 125,
        },
      ],
    });
  }

  // Create an order for the premium concert event
  await prisma.order.create({
    data: {
      userId: usersCreated[2].id,
      status: OrderStatus.completed,
      totalAmount: vipPremiumTicketType.price,
      paymentMethod: 'credit_card',
      transactionId: 'txn_premium_123',
      paymentStatus: 'paid',
      orderedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      tickets: {
        create: [
          {
            ticketTypeId: vipPremiumTicketType.id,
            timeSlotId: premiumConcertTimeSlots[0].id,
            status: TicketStatus.purchased,
            qrCode: 'qr_premium_1',
            ownerName: 'John Doe',
            ownerEmail: 'john.doe@email.com',
            purchaseDate: new Date(),
            eventId: premiumConcertEvent.id,
          },
        ],
      },
    },
  });

  // Create Orders
  await prisma.order.create({
    data: {
      userId: usersCreated[0].id,
      status: OrderStatus.completed,
      totalAmount: regularTicketType.price.add(premiumTicketType.price),
      paymentMethod: 'credit_card',
      transactionId: 'txn_123456',
      paymentStatus: 'paid',
      orderedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      tickets: {
        create: [
          {
            ticketTypeId: regularTicketType.id,
            timeSlotId: sportsEventTimeSlots[0].id,
            status: TicketStatus.purchased,
            qrCode: 'qr_code_2',
            ownerName: 'Jane Smith',
            ownerEmail: 'jane.smith@email.com',
            purchaseDate: new Date(),
            eventId: sportsEvent.id,
          },
          {
            ticketTypeId: premiumTicketType.id,
            timeSlotId: sportsEventTimeSlots[0].id,
            status: TicketStatus.purchased,
            qrCode: 'qr_code_3',
            ownerName: 'Jane Smith',
            ownerEmail: 'jane.smith@email.com',
            purchaseDate: new Date(),
            eventId: sportsEvent.id,
          },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      userId: usersCreated[0].id,
      status: OrderStatus.completed,
      totalAmount: frontRowTicketType.price.add(earlyBirdTicketType.price),
      paymentMethod: 'credit_card',
      transactionId: 'txn_123456',
      paymentStatus: 'paid',
      orderedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      tickets: {
        create: [
          {
            ticketTypeId: frontRowTicketType.id,
            timeSlotId: musicTimeSlots[0].id,
            status: TicketStatus.purchased,
            qrCode: 'qr_code_2',
            ownerName: 'Jane Smith',
            ownerEmail: 'jane.smith@email.com',
            purchaseDate: new Date(),
            eventId: musicEvent.id, // Fixed: this should be musicEvent, not sportsEvent
          },
          {
            ticketTypeId: earlyBirdTicketType.id,
            timeSlotId: musicTimeSlots[0].id,
            status: TicketStatus.purchased,
            qrCode: 'qr_code_3',
            ownerName: 'Jane Smith',
            ownerEmail: 'jane.smith@email.com',
            purchaseDate: new Date(),
            eventId: musicEvent.id, // Fixed: this should be musicEvent, not sportsEvent
          },
        ],
      },
    },
  });

  // Log completion message without using process.stdout directly
  process.stdout.write('Seeding complete!\n');
}

main()
  .catch((e) => {
    // Log error without using process.stderr directly
    process.stderr.write(`Error during seeding: ${e}\n`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
