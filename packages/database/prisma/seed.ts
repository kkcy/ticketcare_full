import { randomUUID } from 'node:crypto';
import {
  EventStatus,
  OrderStatus,
  PayoutFrequency,
  Prisma,
  PrismaClient,
  TicketStatus,
  VerificationStatus,
} from '@prisma/client';
import { auth } from '@repo/auth/server';

const prisma = new PrismaClient();

const users = [
  {
    id: randomUUID(),
    email: 'contact@soundwave.com',
    name: 'Soundwave Productions',
    emailVerified: true,
    role: 'organizer',
    organization: 'over-and-above',
  },
  {
    id: randomUUID(),
    email: 'events@sportsmaster.com',
    name: 'SportsMaster Events',
    emailVerified: true,
    role: 'organizer',
    organization: 'city-stadium',
  },
  {
    id: randomUUID(),
    email: 'john.doe@email.com',
    name: 'John Doe',
    emailVerified: true,
    role: 'customer',
  },
  {
    id: randomUUID(),
    email: 'jane.smith@email.com',
    name: 'Jane Smith',
    emailVerified: true,
    role: 'customer',
  },
  {
    id: randomUUID(),
    email: 'admin@ticketcare.com',
    name: 'Admin',
    emailVerified: true,
    role: 'super_admin',
    organization: 'ticket-care',
  },
];

async function main() {
  // eslint-disable-next-line no-console
  console.log('Starting database seed...');

  // Clean up existing data
  await prisma.$transaction([
    prisma.organization.deleteMany(),
    prisma.inventory.deleteMany(),
    prisma.timeSlot.deleteMany(),
    prisma.ticket.deleteMany(),
    prisma.ticketType.deleteMany(),
    prisma.eventDate.deleteMany(),
    prisma.order.deleteMany(),
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
      id: randomUUID(),
      name: 'TicketCare',
      slug: 'ticket-care',
    },
  });

  const overAndAboveOrg = await prisma.organization.create({
    data: {
      id: randomUUID(),
      name: 'Over & Above',
      slug: 'over-and-above',
    },
  });

  const cityStadiumOrg = await prisma.organization.create({
    data: {
      id: randomUUID(),
      name: 'City Stadium',
      slug: 'city-stadium',
    },
  });

  // Create users
  for (const userData of users) {
    const user = await prisma.user.create({
      data: {
        id: userData.id,
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
        id: randomUUID(),
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
          id: randomUUID(),
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
  }

  // Create Organizers
  await prisma.organizer.create({
    data: {
      id: randomUUID(),
      userId: users[4].id,
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
      id: randomUUID(),
      userId: users[0].id,
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
      id: randomUUID(),
      userId: users[1].id,
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
      amenities: ['Parking', 'VIP Lounges', 'Food Court'],
      parking: true,
      accessibility: true,
      food: true,
      drinks: true,
      ageRestriction: 18,
      dresscode: 'Smart Casual',
      customRules: ['No cameras', 'No outside food'],
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
      amenities: ['Parking', 'Food Stalls', 'First Aid'],
      parking: true,
      accessibility: true,
      food: true,
      drinks: true,
      ageRestriction: 0,
      customRules: ['Clear bag policy'],
    },
  });

  // Create Events
  const musicEvent = await prisma.event.create({
    data: {
      organizerId: musicOrganizer.id,
      venueId: arena.id,
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
    },
  });

  const sportsEvent = await prisma.event.create({
    data: {
      organizerId: sportsOrganizer.id,
      venueId: stadium.id,
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
    },
  });

  // Create Event Dates and Time Slots
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

  // Create Ticket Types with Inventory
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

  // Create Orders
  await prisma.order.create({
    data: {
      userId: users[0].id,
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
      userId: users[0].id,
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
            eventId: sportsEvent.id,
          },
          {
            ticketTypeId: earlyBirdTicketType.id,
            timeSlotId: musicTimeSlots[0].id,
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

  console.info('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
