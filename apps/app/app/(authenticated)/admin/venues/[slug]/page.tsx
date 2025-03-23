import type { SerializedVenueWithEvents } from '@/types'
import { auth } from '@repo/auth/server'
import {
  InfoIcon,
  MapPinIcon,
  MapPinnedIcon,
  UsersIcon
} from '@repo/design-system/components/icons'
import { Button } from '@repo/design-system/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@repo/design-system/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/design-system/components/ui/tabs'
import { headers } from 'next/headers'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { Header } from '../../../components/header'
import { getVenueBySlug } from '../actions'
import { VenueDelete } from '../components/VenueDelete'
import { VenueDialog } from '../components/VenueDialog'
import { VenueMedia } from '../components/VenueMedia'

type PageProps = {
  readonly params: Promise<{
    slug: string
  }>
}

export default async function VenueDetailPage({ params }: PageProps) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  // Check if user is a super admin
  if (!session?.user?.role || session.user.role !== 'super-admin') {
    redirect('/')
  }

  // Get venue by slug
  let venue: SerializedVenueWithEvents
  try {
    venue = await getVenueBySlug((await params).slug)
  } catch (_error) {
    notFound()
  }

  return (
    <>
      <Header pages={['Venues']} page={venue.name} />

      <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-start space-y-2">
          <h2 className="font-bold text-3xl tracking-tight">{venue.name}</h2>
        </div>

        <Tabs defaultValue="summary">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="events">Recent Events</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <VenueDelete venue={venue} />
              <VenueDialog mode="edit" venue={venue} />
            </div>
          </div>
          <TabsContent value="summary" className="mt-6">
            {/* <Card>
              <CardHeader>
                <CardTitle>{venue.name}</CardTitle>
                <CardDescription>Venue Details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm">Description</h3>
                  <p className="text-muted-foreground text-sm">
                    {venue.description || 'No description provided'}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-sm">Address</h3>
                  <div className="flex items-start gap-2">
                    <MapPinIcon className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <p className="text-muted-foreground text-sm">
                      {venue.address}, {venue.city}, {venue.state},{' '}
                      {venue.country} {venue.postalCode}
                    </p>
                  </div>
                </div>

                {venue.totalCapacity != null && (
                  <div>
                    <h3 className="font-medium text-sm">Capacity</h3>
                    <div className="flex items-center gap-2">
                      <UsersIcon className="h-4 w-4 text-muted-foreground" />
                      <p className="text-muted-foreground text-sm">
                        {venue.totalCapacity.toLocaleString()} people
                      </p>
                    </div>
                  </div>
                )}

                {venue.latitude && venue.longitude ? (
                  <div>
                    <h3 className="font-medium text-sm">Coordinates</h3>
                    <p className="text-muted-foreground text-sm">
                      Latitude: {venue.latitude}, Longitude: {venue.longitude}
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card> */}
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <InfoIcon className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold">Venue Details</h3>
                  </div>
                  <p className="mt-2 text-muted-foreground text-sm">{venue.description}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <UsersIcon className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold">Capacity</h3>
                  </div>
                  <p className="mt-2 text-muted-foreground text-sm">{venue.totalCapacity} people</p>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold">Address</h3>
                  </div>
                  <p className="mt-2 text-muted-foreground text-sm">
                    {venue.address}, {venue.city}, {venue.state}, {venue.country} {venue.postalCode}
                  </p>
                </div>
                {venue.latitude && venue.longitude && (
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2">
                      <MapPinnedIcon className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-semibold">Coordinates</h3>
                    </div>
                    <p className="mt-2 text-muted-foreground text-sm">
                      Latitude: {venue.latitude}, Longitude: {venue.longitude}
                    </p>
                  </div>
                )}
              </div>

              <VenueMedia venue={venue} />
            </div>
          </TabsContent>
          <TabsContent value="events" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Events</CardTitle>
                <CardDescription>Events hosted at this venue</CardDescription>
              </CardHeader>
              <CardContent>
                {venue.events && venue.events.length > 0 ? (
                  <div className="space-y-4">
                    {venue.events.map((event) => (
                      <div key={event.id} className="rounded-md border p-3">
                        <h3 className="font-medium">{event.title}</h3>
                        {event.startTime && (
                          <p className="text-muted-foreground text-sm">
                            {new Date(event.startTime).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No events found for this venue</p>
                )}
              </CardContent>
              {venue.events.length > 0 && (
                <CardFooter>
                  <Button variant="outline" asChild>
                    {/* TODO */}
                    <Link href="/events">View All Events</Link>
                  </Button>
                </CardFooter>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  )
}
