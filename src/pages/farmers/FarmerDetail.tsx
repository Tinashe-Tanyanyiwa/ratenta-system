import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Edit,
  Trash2,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Calendar,
  Package,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFarmer, useDeleteFarmer } from '@/hooks/useFarmers';
import { useBales } from '@/hooks/useBales';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const FarmerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: farmer, isLoading } = useFarmer(id);
  const { data: allBales } = useBales();
  const deleteFarmer = useDeleteFarmer();

  const farmerBales = allBales?.filter(bale => {
    const growerId = typeof bale.grower_number === 'object' 
      ? bale.grower_number?.id 
      : bale.grower_number;
    return growerId === id;
  }) || [];

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteFarmer.mutateAsync(id);
      toast({
        title: 'Farmer Deleted',
        description: 'The farmer has been successfully removed.',
      });
      navigate('/farmers');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete farmer.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="text-center py-12">
        <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Farmer Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The farmer you're looking for doesn't exist.
        </p>
        <Button asChild>
          <Link to="/farmers">Back to Farmers</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link to="/farmers">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">
                {farmer.first_name?.[0]}{farmer.last_name?.[0]}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-display text-2xl font-bold">
                  {farmer.first_name} {farmer.last_name}
                </h1>
                <Badge variant={farmer.status === 'published' ? 'default' : 'secondary'}>
                  {farmer.status === 'published' ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm font-mono mt-1">
                {farmer.grower_number}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to={`/farmers/${farmer.id}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Farmer</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {farmer.first_name} {farmer.last_name}? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive">
                  {deleteFarmer.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Delete'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Farmer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Grower Number
                </p>
                <p className="font-mono font-medium mt-1">{farmer.grower_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">National ID</p>
                <p className="font-medium mt-1">{farmer.national_id || '—'}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-medium">Contact Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {farmer.phone_number && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="font-medium">{farmer.phone_number}</p>
                    </div>
                  </div>
                )}
                {farmer.email && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium">{farmer.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {farmer.farm_location && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4" />
                    Farm Location
                  </p>
                  <p className="text-sm">{farmer.farm_location}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Stats & Timeline */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-4xl font-bold text-primary">{farmerBales.length}</p>
                <p className="text-sm text-muted-foreground mt-1">Total Bales</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {farmer.date_created && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-success mt-2" />
                    <div>
                      <p className="text-sm font-medium">Registered</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(farmer.date_created).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
                {farmer.date_updated && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div>
                      <p className="text-sm font-medium">Last Updated</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(farmer.date_updated).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Bales */}
      {farmerBales.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Recent Bales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {farmerBales.slice(0, 6).map((bale) => (
                <Link
                  key={bale.id}
                  to={`/bales/${bale.id}`}
                  className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-medium">{bale.bar_code || bale.id.slice(0, 8)}</span>
                    {bale.has_fault && (
                      <Badge variant="outline" className="text-warning border-warning">Fault</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{bale.mass ? `${bale.mass} kg` : '—'}</span>
                    <span>{bale.classification || '—'}</span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FarmerDetail;
