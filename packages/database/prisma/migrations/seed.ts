import { PrismaClient, Prisma } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

const database = new PrismaClient()

const SUPABASE_URL = 'https://wopajcrhkkqusxsntacz.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvcGFqY3Joa2txdXN4c250YWN6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDkwODkwNCwiZXhwIjoyMDQ2NDg0OTA0fQ.NBLzyoiZi3nOyiLBgZz0ncus0QIqebKAOj5MiRt7EDc'

const supabaseUrl = SUPABASE_URL
const supabaseServiceKey = SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

let users: {
  email: string
  password: string
  user_metadata: {
    name: string
  }
  id?: string
}[] = [
    {
      email: 'contact@soundwave.com',
      password: 'password123', // Change this in production
      user_metadata: {
        name: 'Soundwave Productions',
      },
    },
    {
      email: 'events@sportsmaster.com',
      password: 'password123', // Change this in production
      user_metadata: {
        name: 'SportsMaster Events',
      },
    },
    {
      email: 'john.doe@email.com',
      password: 'password123', // Change this in production
      user_metadata: {
        name: 'John Doe',
      },
    },
    {
      email: 'jane.smith@email.com',
      password: 'password123', // Change this in production
      user_metadata: {
        name: 'Jane Smith',
      },
    },
  ]

async function main() {
  console.log('Creating Supabase users...')

  // Clean up existing data
  await database.$transaction([
    database.ticket.deleteMany(),
    database.order.deleteMany(),
    database.event.deleteMany(),
    database.venue.deleteMany(),
    database.organiser.deleteMany(),
    database.customer.deleteMany(),
    database.ticketType.deleteMany(),
  ])

  // Clean up supabase users
  const { data: supabaseUsers, error: supabaseError } = await supabase.auth.admin.listUsers()

  if (supabaseError) {
    console.error(supabaseError)
    return
  }

  if (supabaseUsers.users) {
    for (const user of supabaseUsers.users) {
      const deleteResponse = await supabase.auth.admin.deleteUser(user.id)
    }
  }

  for (const user of users) {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: user.user_metadata,
      })

      user.id = data.user?.id

      if (error) {
        console.error(`Failed to create user ${user.email}:`, error)
      } else {
        console.log(`Created user ${user.email} with ID ${data.user.id}`)
      }
    } catch (error) {
      console.error(`Error creating user ${user.email}:`, error)
    }
  }

  // Create Organisers with Supabase-style UUIDs
  const musicOrganizer = await database.organiser.create({
    data: {
      id: users[0].id!,
      name: 'Soundwave Productions',
      slug: 'soundwave-productions',
      type: 'company',
      description: 'Leading music event organizer',
      email: 'contact@soundwave.com',
      phone: '+1234567890',
      verificationStatus: 'verified',
      payoutFrequency: 'monthly',
      commissionRate: 10.0,
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true,
    },
  })

  const sportsOrganizer = await database.organiser.create({
    data: {
      id: users[1].id!,
      name: 'SportsMaster Events',
      slug: 'sportsmaster-events',
      type: 'organization',
      description: 'Professional sports event management',
      email: 'events@sportsmaster.com',
      phone: '+1987654321',
      verificationStatus: 'verified',
      payoutFrequency: 'biweekly',
      commissionRate: 12.5,
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
    },
  })

  // Create Venues
  const arena = await database.venue.create({
    data: {
      name: 'Metropolitan Arena',
      slug: 'metropolitan-arena',
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
  })

  const stadium = await database.venue.create({
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
  })

  // Create Customers with Supabase-style UUIDs
  const customer1 = await database.customer.create({
    data: {
      id: users[2].id!,
      type: 'premium',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@email.com',
      phone: '+1122334455',
      dateOfBirth: new Date('1990-01-15'),
      eventTypes: ['concert', 'festival'],
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true,
      balance: 500.0,
    },
  })

  const customer2 = await database.customer.create({
    data: {
      id: users[3].id!,
      type: 'regular',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@email.com',
      phone: '+1123456789',
      dateOfBirth: new Date('1995-06-20'),
      eventTypes: ['sports', 'concert'],
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      balance: 200.0,
    },
  })

  // Create Events with Dates, Time Slots, and Inventory
  const concert = await database.event.create({
    data: {
      organizerId: musicOrganizer.id,
      venueId: arena.id,
      title: 'Summer Music Festival',
      slug: 'summer-music-festival',
      description: 'Annual summer music festival featuring top artists',
      category: ['music', 'festival'],
      startTime: new Date('2024-07-15T18:00:00Z'),
      endTime: new Date('2024-07-15T23:00:00Z'),
      doorsOpen: new Date('2024-07-15T16:00:00Z'),
      status: 'published',
      isPublic: true,
      requiresApproval: false,
      waitingListEnabled: true,
      refundPolicy: 'Full refund available up to 48 hours before event',
      eventDates: {
        create: [
          {
            date: new Date('2024-07-15'),
            timeSlots: {
              create: [
                {
                  startTime: new Date('2024-07-15T14:00:00Z'),
                  endTime: new Date('2024-07-15T16:00:00Z'),
                  doorsOpen: new Date('2024-07-15T13:00:00Z'),
                },
                {
                  startTime: new Date('2024-07-15T17:00:00Z'),
                  endTime: new Date('2024-07-15T19:00:00Z'),
                  doorsOpen: new Date('2024-07-15T16:00:00Z'),
                },
                {
                  startTime: new Date('2024-07-15T20:00:00Z'),
                  endTime: new Date('2024-07-15T22:00:00Z'),
                  doorsOpen: new Date('2024-07-15T19:00:00Z'),
                },
              ],
            },
          },
          {
            date: new Date('2024-07-16'),
            timeSlots: {
              create: [
                {
                  startTime: new Date('2024-07-16T15:00:00Z'),
                  endTime: new Date('2024-07-16T17:00:00Z'),
                  doorsOpen: new Date('2024-07-16T14:00:00Z'),
                },
                {
                  startTime: new Date('2024-07-16T18:00:00Z'),
                  endTime: new Date('2024-07-16T20:00:00Z'),
                  doorsOpen: new Date('2024-07-16T17:00:00Z'),
                },
              ],
            },
          },
          {
            date: new Date('2024-07-17'),
            timeSlots: {
              create: [
                {
                  startTime: new Date('2024-07-17T16:00:00Z'),
                  endTime: new Date('2024-07-17T18:00:00Z'),
                  doorsOpen: new Date('2024-07-17T15:00:00Z'),
                },
                {
                  startTime: new Date('2024-07-17T19:00:00Z'),
                  endTime: new Date('2024-07-17T21:00:00Z'),
                  doorsOpen: new Date('2024-07-17T18:00:00Z'),
                },
              ],
            },
          },
          {
            date: new Date('2024-07-18'),
            timeSlots: {
              create: [
                {
                  startTime: new Date('2024-07-18T14:00:00Z'),
                  endTime: new Date('2024-07-18T16:00:00Z'),
                  doorsOpen: new Date('2024-07-18T13:00:00Z'),
                },
                {
                  startTime: new Date('2024-07-18T17:00:00Z'),
                  endTime: new Date('2024-07-18T19:00:00Z'),
                  doorsOpen: new Date('2024-07-18T16:00:00Z'),
                },
              ],
            },
          },
          {
            date: new Date('2024-07-19'),
            timeSlots: {
              create: [
                {
                  startTime: new Date('2024-07-19T15:00:00Z'),
                  endTime: new Date('2024-07-19T17:00:00Z'),
                  doorsOpen: new Date('2024-07-19T14:00:00Z'),
                },
                {
                  startTime: new Date('2024-07-19T18:00:00Z'),
                  endTime: new Date('2024-07-19T20:00:00Z'),
                  doorsOpen: new Date('2024-07-19T17:00:00Z'),
                },
              ],
            },
          },
        ],
      },
    },
  })

  const sportEvent = await database.event.create({
    data: {
      organizerId: sportsOrganizer.id,
      venueId: stadium.id,
      title: 'Championship Finals',
      slug: 'championship-finals',
      description: 'Annual championship game',
      category: ['sports', 'championship'],
      startTime: new Date('2024-08-20T19:00:00Z'),
      endTime: new Date('2024-08-20T22:00:00Z'),
      doorsOpen: new Date('2024-08-20T17:00:00Z'),
      status: 'published',
      isPublic: true,
      requiresApproval: false,
      waitingListEnabled: false,
      refundPolicy: 'No refunds available',
      eventDates: {
        create: [
          {
            date: new Date('2024-08-20'),
            timeSlots: {
              create: [
                {
                  startTime: new Date('2024-08-20T14:00:00Z'),
                  endTime: new Date('2024-08-20T17:00:00Z'),
                  doorsOpen: new Date('2024-08-20T13:00:00Z'),
                },
                {
                  startTime: new Date('2024-08-20T19:00:00Z'),
                  endTime: new Date('2024-08-20T22:00:00Z'),
                  doorsOpen: new Date('2024-08-20T18:00:00Z'),
                },
              ],
            },
          },
          {
            date: new Date('2024-08-21'),
            timeSlots: {
              create: [
                {
                  startTime: new Date('2024-08-21T15:00:00Z'),
                  endTime: new Date('2024-08-21T18:00:00Z'),
                  doorsOpen: new Date('2024-08-21T14:00:00Z'),
                },
                {
                  startTime: new Date('2024-08-21T20:00:00Z'),
                  endTime: new Date('2024-08-21T23:00:00Z'),
                  doorsOpen: new Date('2024-08-21T19:00:00Z'),
                },
              ],
            },
          },
          {
            date: new Date('2024-08-22'),
            timeSlots: {
              create: [
                {
                  startTime: new Date('2024-08-22T16:00:00Z'),
                  endTime: new Date('2024-08-22T19:00:00Z'),
                  doorsOpen: new Date('2024-08-22T15:00:00Z'),
                },
              ],
            },
          },
          {
            date: new Date('2024-08-23'),
            timeSlots: {
              create: [
                {
                  startTime: new Date('2024-08-23T14:00:00Z'),
                  endTime: new Date('2024-08-23T17:00:00Z'),
                  doorsOpen: new Date('2024-08-23T13:00:00Z'),
                },
                {
                  startTime: new Date('2024-08-23T19:00:00Z'),
                  endTime: new Date('2024-08-23T22:00:00Z'),
                  doorsOpen: new Date('2024-08-23T18:00:00Z'),
                },
              ],
            },
          },
          {
            date: new Date('2024-08-24'),
            timeSlots: {
              create: [
                {
                  startTime: new Date('2024-08-24T15:00:00Z'),
                  endTime: new Date('2024-08-24T18:00:00Z'),
                  doorsOpen: new Date('2024-08-24T14:00:00Z'),
                },
                {
                  startTime: new Date('2024-08-24T20:00:00Z'),
                  endTime: new Date('2024-08-24T23:00:00Z'),
                  doorsOpen: new Date('2024-08-24T19:00:00Z'),
                },
              ],
            },
          },
        ],
      },
    },
  })

  // Create Ticket Types with Inventory
  const vipTicketType = await database.ticketType.create({
    data: {
      eventId: concert.id,
      name: 'VIP Experience',
      description: 'Premium access with exclusive backstage tour and meet & greet',
      price: new Prisma.Decimal(299.99),
      maxPerOrder: 4,
      minPerOrder: 1,
      saleStartTime: new Date(),
      saleEndTime: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    },
  })

  const frontRowTicketType = await database.ticketType.create({
    data: {
      eventId: concert.id,
      name: 'Front Row Access',
      description: 'Best seats in the house with complimentary drinks',
      price: new Prisma.Decimal(199.99),
      maxPerOrder: 6,
      minPerOrder: 1,
      saleStartTime: new Date(),
      saleEndTime: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    },
  })

  const earlyBirdTicketType = await database.ticketType.create({
    data: {
      eventId: concert.id,
      name: 'Early Bird Special',
      description: 'Limited time offer for early bookings',
      price: new Prisma.Decimal(79.99),
      maxPerOrder: 8,
      minPerOrder: 1,
      saleStartTime: new Date(),
      saleEndTime: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    },
  })

  const standardTicketType = await database.ticketType.create({
    data: {
      eventId: concert.id,
      name: 'Standard Entry',
      description: 'Regular admission with great views',
      price: new Prisma.Decimal(129.99),
      maxPerOrder: 10,
      minPerOrder: 1,
      saleStartTime: new Date(),
      saleEndTime: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    },
  })

  const studentTicketType = await database.ticketType.create({
    data: {
      eventId: concert.id,
      name: 'Student Pass',
      description: 'Special rate for students with valid ID',
      price: new Prisma.Decimal(59.99),
      maxPerOrder: 2,
      minPerOrder: 1,
      saleStartTime: new Date(),
      saleEndTime: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    },
  })

  const regularTicketType = await database.ticketType.create({
    data: {
      eventId: sportEvent.id,
      name: 'Regular Admission',
      description: 'Standard seating with good views',
      price: new Prisma.Decimal(79.99),
      maxPerOrder: 8,
      minPerOrder: 1,
      saleStartTime: new Date(),
      saleEndTime: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    },
  })

  const premiumTicketType = await database.ticketType.create({
    data: {
      eventId: sportEvent.id,
      name: 'Premium Box',
      description: 'Exclusive box seating with premium amenities',
      price: new Prisma.Decimal(249.99),
      maxPerOrder: 6,
      minPerOrder: 1,
      saleStartTime: new Date(),
      saleEndTime: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    },
  })

  const familyTicketType = await database.ticketType.create({
    data: {
      eventId: sportEvent.id,
      name: 'Family Package',
      description: 'Special package for families, includes snacks',
      price: new Prisma.Decimal(199.99),
      maxPerOrder: 2,
      minPerOrder: 1,
      saleStartTime: new Date(),
      saleEndTime: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    },
  })

  const courtSideTicketType = await database.ticketType.create({
    data: {
      eventId: sportEvent.id,
      name: 'Courtside VIP',
      description: 'Best seats in the house, closest to the action',
      price: new Prisma.Decimal(399.99),
      maxPerOrder: 4,
      minPerOrder: 1,
      saleStartTime: new Date(),
      saleEndTime: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    },
  })

  const studentSportTicketType = await database.ticketType.create({
    data: {
      eventId: sportEvent.id,
      name: 'Student Special',
      description: 'Discounted rate for students with valid ID',
      price: new Prisma.Decimal(49.99),
      maxPerOrder: 1,
      minPerOrder: 1,
      saleStartTime: new Date(),
      saleEndTime: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    },
  })

  // Create Inventory for each time slot
  const concertTimeSlots = await database.timeSlot.findMany({
    where: {
      eventDate: {
        eventId: concert.id,
      },
    },
  })

  for (const timeSlot of concertTimeSlots) {
    await database.inventory.createMany({
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
    })
  }

  const sportEventTimeSlots = await database.timeSlot.findMany({
    where: {
      eventDate: {
        eventId: sportEvent.id,
      },
    },
  })

  for (const timeSlot of sportEventTimeSlots) {
    await database.inventory.createMany({
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
    })
  }

  // Create Orders
  const order1 = await database.order.create({
    data: {
      customerId: customer1.id,
      status: 'completed',
      totalAmount: 150.0,
      paymentMethod: 'credit_card',
      transactionId: 'txn_123456',
      paymentStatus: 'paid',
      orderedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })

  const order2 = await database.order.create({
    data: {
      customerId: customer2.id,
      status: 'completed',
      totalAmount: 200.0,
      paymentMethod: 'credit_card',
      transactionId: 'txn_789012',
      paymentStatus: 'paid',
      orderedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })

  // Create Tickets
  await database.ticket.create({
    data: {
      eventId: concert.id,
      ticketTypeId: vipTicketType.id,
      timeSlotId: concertTimeSlots[0].id, // Using first time slot
      orderId: order1.id,
      status: 'purchased',
      purchaseDate: new Date(),
      ownerName: 'John Doe',
      ownerEmail: 'john.doe@email.com',
      ownerPhone: '+1122334455',
      qrCode: 'qr_code_123',
    },
  })

  await database.ticket.create({
    data: {
      eventId: sportEvent.id,
      ticketTypeId: regularTicketType.id,
      timeSlotId: sportEventTimeSlots[0].id, // Using first time slot
      orderId: order2.id,
      status: 'purchased',
      purchaseDate: new Date(),
      ownerName: 'Jane Smith',
      ownerEmail: 'jane.smith@email.com',
      ownerPhone: '+1123456789',
      qrCode: 'qr_code_456',
    },
  })

  console.log('Seed data created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await database.$disconnect()
  })
