import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useBale, useDeleteBale } from '@/hooks/useBales';
import { DirectusFarmer, DirectusBox } from '@/lib/directus';
import {
  ArrowLeft,
  Edit,
  Printer,
  Trash2,
  Package,
  User,
  Box,
  Calendar,
  Scale,
  AlertTriangle,
  Barcode,
  Loader2,
  DollarSign,
  Hash,
  Tag,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
import tobaccoHandling from '@/assets/tobacco-handling.jpg';

const BaleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: bale, isLoading, error } = useBale(id);
  const deleteBale = useDeleteBale();

  const getFarmer = (): DirectusFarmer | null => {
    if (typeof bale?.grower_number === 'object' && bale.grower_number) {
      return bale.grower_number as DirectusFarmer;
    }
    return null;
  };

  const getBox = (): DirectusBox | null => {
    if (typeof bale?.box === 'object' && bale.box) {
      return bale.box as DirectusBox;
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !bale) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Bale Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The bale you're looking for doesn't exist.
        </p>
        <Button asChild>
          <Link to="/bales">Back to Bales</Link>
        </Button>
      </div>
    );
  }

  const handleDelete = async () => {
    try {
      await deleteBale.mutateAsync(bale.id);
      toast({
        title: 'Bale Deleted',
        description: 'The bale has been successfully deleted.',
      });
      navigate('/bales');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete bale.',
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const farmer = getFarmer();
  const box = getBox();

  const getClassificationColor = (classification: string | undefined) => {
    if (!classification) return 'text-muted-foreground';
    const colors: Record<string, string> = {
      A: 'text-success',
      B: 'text-primary',
      C: 'text-warning',
      D: 'text-destructive',
    };
    return colors[classification] || 'text-muted-foreground';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Header */}
      <div className="relative h-48 rounded-xl overflow-hidden">
        <img 
          src={tobaccoHandling} 
          alt="Tobacco handling" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/50" />
        <div className="absolute inset-0 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon" className="bg-background/50 hover:bg-background/80">
              <Link to="/bales">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-display text-2xl font-bold">{bale.bar_code || `Bale #${bale.id.slice(0, 8)}`}</h1>
                <Badge variant={bale.status === 'published' ? 'default' : 'secondary'}>
                  {bale.status}
                </Badge>
                {bale.has_fault && (
                  <Badge variant="outline" className="border-warning text-warning">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Fault
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                Created {bale.date_created ? new Date(bale.date_created).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} className="bg-background/50">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button asChild variant="outline" size="sm" className="bg-background/50">
              <Link to={`/bales/${bale.id}/edit`}>
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
                  <AlertDialogTitle>Delete Bale</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this bale? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Bale Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Barcode className="w-4 h-4" />
                  <span className="text-xs">Barcode</span>
                </div>
                <p className="font-mono font-medium">{bale.bar_code || '—'}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Scale className="w-4 h-4" />
                  <span className="text-xs">Mass</span>
                </div>
                <p className="font-medium text-lg">{bale.mass ? `${bale.mass} kg` : '—'}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="text-xs text-muted-foreground mb-1">Classification</div>
                <p className={`text-2xl font-bold ${getClassificationColor(bale.classification)}`}>
                  {bale.classification || '—'}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs">Price</span>
                </div>
                <p className="font-medium text-lg">{bale.price ? `$${bale.price}` : '—'}</p>
              </div>
            </div>

            <Separator />

            {/* Additional Details */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Lot Number</p>
                <p className="font-medium">{bale.lot_number || '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">SEQ</p>
                <p className="font-medium">{bale.SEQ || '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Group Number</p>
                <p className="font-medium">{bale.group_number || '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Trade</p>
                <p className="font-medium">{bale.trade || '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Buyer</p>
                <p className="font-medium">{bale.buyer || '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Buyer's Mark</p>
                <p className="font-medium">{bale.buyers_mark || '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Appeal</p>
                <p className="font-medium">{bale.appeal || '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Date</p>
                <p className="font-medium">{bale.date ? new Date(bale.date).toLocaleDateString() : '—'}</p>
              </div>
            </div>

            <Separator />

            {/* Farmer Info */}
            <div>
              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Farmer / Grower
              </p>
              {farmer ? (
                <Link
                  to={`/farmers/${farmer.id}`}
                  className="inline-flex items-center gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-lg font-medium text-primary-foreground">
                      {farmer.first_name?.[0]}{farmer.last_name?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{farmer.first_name} {farmer.last_name}</p>
                    <p className="text-sm text-muted-foreground">Grower #: {farmer.grower_number}</p>
                    <p className="text-xs text-primary">View farmer details →</p>
                  </div>
                </Link>
              ) : (
                <p className="text-muted-foreground italic">No farmer assigned</p>
              )}
            </div>

            <Separator />

            {/* Box Info */}
            <div>
              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <Box className="w-4 h-4" />
                Box Assignment
              </p>
              {box ? (
                <Link
                  to={`/boxes/${box.id}`}
                  className="inline-flex items-center gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <Box className="w-10 h-10 text-accent" />
                  <div>
                    <p className="font-medium">{box.box_number}</p>
                    <p className="text-xs text-primary">View box details →</p>
                  </div>
                </Link>
              ) : (
                <p className="text-muted-foreground italic">Not assigned to any box</p>
              )}
            </div>

            {/* Fault Information */}
            {bale.has_fault && (
              <>
                <Separator />
                <div className="p-4 rounded-lg bg-warning/10 border border-warning/30">
                  <p className="text-sm font-medium text-warning flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    Fault Reported
                  </p>
                  <p className="text-sm">{bale.fault_description || 'No description provided'}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline / Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-success mt-2" />
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-xs text-muted-foreground">
                      {bale.date_created ? new Date(bale.date_created).toLocaleString() : 'Unknown'}
                    </p>
                  </div>
                </div>
                {bale.date_updated && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div>
                      <p className="text-sm font-medium">Last Updated</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(bale.date_updated).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="w-5 h-5" />
                Technical Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">FRLSLE</span>
                  <span className="font-mono">{bale.frlsle || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">VAR</span>
                  <span className="font-mono">{bale.var || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">RO</span>
                  <span className="font-mono">{bale.ro || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">RB</span>
                  <span className="font-mono">{bale.rb || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">XX</span>
                  <span className="font-mono">{bale.xx || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CO</span>
                  <span className="font-mono">{bale.co || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">REP</span>
                  <span className="font-mono">{bale.rep || '—'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Print-specific styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
        }
      `}</style>
    </div>
  );
};

export default BaleDetail;
