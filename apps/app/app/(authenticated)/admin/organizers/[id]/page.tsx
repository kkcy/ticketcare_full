import { auth } from '@repo/auth/server';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import { formatDate } from '@repo/design-system/lib/format';
import {
  ArrowLeft,
  Bell,
  ClipboardCheck,
  Clock,
  Phone,
  StarIcon,
  User,
} from 'lucide-react';
import { headers } from 'next/headers';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Header } from '../../../components/header';
import { getOrganizer } from '../actions';
import { OrganizerDialog } from '../components/OrganizerDialog';
import { OrganizerNotification } from '../components/OrganizerNotification';

type PageProps = {
  readonly params: Promise<{
    id: string;
  }>;
};

// Helper function to determine badge variant based on verification status
function getVerificationBadgeVariant(
  status: string
): 'outline' | 'pending' | 'success' | 'destructive' {
  switch (status) {
    case 'VERIFIED':
      return 'success';
    case 'PENDING':
      return 'pending';
    case 'REJECTED':
      return 'destructive';
    default:
      return 'outline';
  }
}

export default async function OrganizerDetailPage({ params }: PageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Check if user is a super admin
  if (!session?.user?.role || session.user.role !== 'super-admin') {
    redirect('/');
  }

  try {
    const organizer = await getOrganizer((await params).id);

    return (
      <>
        <Header
          pages={['Organizers']}
          page={organizer.name}
          title="Organizer Details"
          description="View and manage organizer information"
        />

        <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
          <div className="flex items-center justify-between space-y-2">
            <div>
              <h2 className="font-bold text-3xl tracking-tight">
                {organizer.name}
              </h2>
              {organizer.isPremiumEvent && (
                <Badge
                  variant="secondary"
                  className="premium-badge"
                  style={{
                    backgroundColor: '#fef3c7',
                    marginLeft: '0.75rem',
                    color: '#92400e',
                    display: 'flex',
                    gap: '0.25rem',
                    alignItems: 'center',
                  }}
                >
                  <StarIcon className="h-3 w-3" />
                  Premium Event
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/organizers">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Link>
              </Button>
              <OrganizerDialog mode="edit" organizer={organizer} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card shadow={false}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div>
                    <dt className="font-medium text-muted-foreground text-sm">
                      Name
                    </dt>
                    <dd>{organizer.name}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground text-sm">
                      Slug
                    </dt>
                    <dd>{organizer.slug}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground text-sm">
                      Description
                    </dt>
                    <dd>{organizer.description || 'No description'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground text-sm">
                      Status
                    </dt>
                    <dd>
                      <Badge
                        variant={
                          organizer.verificationStatus === 'VERIFIED'
                            ? 'success'
                            : 'outline'
                        }
                      >
                        {organizer.verificationStatus === 'VERIFIED'
                          ? 'Verified'
                          : 'Pending'}
                      </Badge>
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card shadow={false}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div>
                    <dt className="font-medium text-muted-foreground text-sm">
                      Email
                    </dt>
                    <dd>{organizer.email || 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground text-sm">
                      Phone
                    </dt>
                    <dd>{organizer.phone || 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground text-sm">
                      Website
                    </dt>
                    <dd>{organizer.website || 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground text-sm">
                      Address
                    </dt>
                    <dd>{organizer.address || 'Not provided'}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card shadow={false}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5" />
                  Verification & Payment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div>
                    <dt className="font-medium text-muted-foreground text-sm">
                      Verification Status
                    </dt>
                    <dd>
                      <Badge
                        variant={getVerificationBadgeVariant(
                          organizer.verificationStatus
                        )}
                      >
                        {organizer.verificationStatus}
                      </Badge>
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground text-sm">
                      Payout Frequency
                    </dt>
                    <dd>
                      {organizer.payoutFrequency
                        ? organizer.payoutFrequency.charAt(0) +
                          organizer.payoutFrequency.slice(1).toLowerCase()
                        : 'Not set'}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground text-sm">
                      Commission Rate
                    </dt>
                    <dd>
                      {organizer.commissionRate
                        ? `${organizer.commissionRate}%`
                        : 'Not set'}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>

          <Card shadow={false}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <OrganizerNotification organizer={organizer} />
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <dt className="font-medium text-muted-foreground text-sm">
                    Email Notifications
                  </dt>
                  <dd>
                    <Badge
                      variant={
                        organizer.emailNotifications ? 'success' : 'outline'
                      }
                    >
                      {organizer.emailNotifications ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground text-sm">
                    SMS Notifications
                  </dt>
                  <dd>
                    <Badge
                      variant={
                        organizer.smsNotifications ? 'success' : 'outline'
                      }
                    >
                      {organizer.smsNotifications ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground text-sm">
                    Push Notifications
                  </dt>
                  <dd>
                    <Badge
                      variant={
                        organizer.pushNotifications ? 'success' : 'outline'
                      }
                    >
                      {organizer.pushNotifications ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card shadow={false}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Metadata
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <dt className="font-medium text-muted-foreground text-sm">
                    Created
                  </dt>
                  <dd>{formatDate(new Date(organizer.createdAt), 'PPP')}</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground text-sm">
                    Last Updated
                  </dt>
                  <dd>{formatDate(new Date(organizer.updatedAt), 'PPP')}</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground text-sm">
                    User ID
                  </dt>
                  <dd>{organizer.userId || 'Not linked'}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </main>
      </>
    );
  } catch (error) {
    console.error(error);
    return notFound();
  }
}
