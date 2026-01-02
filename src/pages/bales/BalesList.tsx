import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useBales, useDeleteBale } from '@/hooks/useBales';
import { DirectusBale, DirectusFarmer, DirectusBox } from '@/lib/directus';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Printer,
  AlertTriangle,
  Package,
  Loader2,
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
} from '@/components/ui/alert-dialog';
import tobaccoWarehouse from '@/assets/tobacco-warehouse.jpg';

const BalesList: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: bales = [], isLoading, error } = useBales();
  const deleteBale = useDeleteBale();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [classificationFilter, setClassificationFilter] = useState<string>('all');
  const [faultFilter, setFaultFilter] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getFarmerName = (bale: DirectusBale): string => {
    if (typeof bale.grower_number === 'object' && bale.grower_number) {
      const farmer = bale.grower_number as DirectusFarmer;
      return `${farmer.first_name} ${farmer.last_name}`;
    }
    return 'Unknown';
  };

  const getFarmerId = (bale: DirectusBale): string | null => {
    if (typeof bale.grower_number === 'object' && bale.grower_number) {
      return (bale.grower_number as DirectusFarmer).id;
    }
    return null;
  };

  const getBoxNumber = (bale: DirectusBale): string | null => {
    if (typeof bale.box === 'object' && bale.box) {
      return (bale.box as DirectusBox).box_number;
    }
    return null;
  };

  const filteredBales = useMemo(() => {
    return bales.filter((bale) => {
      const farmerName = getFarmerName(bale);
      const matchesSearch =
        bale.bar_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bale.lot_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        farmerName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesClassification = classificationFilter === 'all' || bale.classification === classificationFilter;
      const matchesFault =
        faultFilter === 'all' ||
        (faultFilter === 'faulty' && bale.has_fault) ||
        (faultFilter === 'normal' && !bale.has_fault);

      return matchesSearch && matchesClassification && matchesFault;
    });
  }, [bales, searchQuery, classificationFilter, faultFilter]);

  const handleDelete = async (id: string) => {
    try {
      await deleteBale.mutateAsync(id);
      setDeleteId(null);
      toast({
        title: 'Bale Deleted',
        description: 'The bale has been successfully deleted.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete bale.',
      });
    }
  };

  const getClassificationBadge = (classification: string | undefined) => {
    if (!classification) return null;
    const colors: Record<string, string> = {
      A: 'bg-success/10 text-success border-success/30',
      B: 'bg-primary/10 text-primary border-primary/30',
      C: 'bg-warning/10 text-warning border-warning/30',
      D: 'bg-destructive/10 text-destructive border-destructive/30',
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${colors[classification] || 'bg-muted'}`}>
        {classification}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 mx-auto text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error Loading Bales</h2>
        <p className="text-muted-foreground">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative h-40 rounded-xl overflow-hidden">
        <img 
          src={tobaccoWarehouse} 
          alt="Tobacco warehouse" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
        <div className="absolute inset-0 flex items-center px-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Bales</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track all tobacco bales
            </p>
          </div>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2">
          <Button asChild className="btn-glow">
            <Link to="/bales/new">
              <Plus className="w-4 h-4 mr-2" />
              New Bale
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by barcode, lot number, or farmer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={classificationFilter} onValueChange={setClassificationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Classification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classifications</SelectItem>
                <SelectItem value="A">Class A</SelectItem>
                <SelectItem value="B">Class B</SelectItem>
                <SelectItem value="C">Class C</SelectItem>
                <SelectItem value="D">Class D</SelectItem>
              </SelectContent>
            </Select>
            <Select value={faultFilter} onValueChange={setFaultFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Faults" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Bales</SelectItem>
                <SelectItem value="faulty">With Faults</SelectItem>
                <SelectItem value="normal">No Faults</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Package className="w-4 h-4" />
        <span>
          Showing {filteredBales.length} of {bales.length} bales
        </span>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Barcode</TableHead>
                  <TableHead>Farmer</TableHead>
                  <TableHead className="text-center">Mass (kg)</TableHead>
                  <TableHead className="text-center">Classification</TableHead>
                  <TableHead className="text-center">Fault</TableHead>
                  <TableHead>Box</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      No bales found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBales.map((bale) => (
                    <TableRow key={bale.id} className="group">
                      <TableCell>
                        <Link
                          to={`/bales/${bale.id}`}
                          className="font-medium text-primary hover:underline font-mono"
                        >
                          {bale.bar_code || bale.id.slice(0, 8)}
                        </Link>
                        {bale.lot_number && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Lot: {bale.lot_number}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        {getFarmerId(bale) ? (
                          <Link
                            to={`/farmers/${getFarmerId(bale)}`}
                            className="hover:underline flex items-center gap-2"
                          >
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-medium text-primary">
                                {getFarmerName(bale).split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            {getFarmerName(bale)}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {bale.mass || '—'}
                      </TableCell>
                      <TableCell className="text-center">
                        {getClassificationBadge(bale.classification)}
                      </TableCell>
                      <TableCell className="text-center">
                        {bale.has_fault ? (
                          <AlertTriangle className="w-4 h-4 text-warning mx-auto" />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getBoxNumber(bale) || (
                          <span className="text-muted-foreground">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/bales/${bale.id}`)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/bales/${bale.id}/edit`)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.print()}>
                              <Printer className="w-4 h-4 mr-2" />
                              Print
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteId(bale.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bale</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this bale? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BalesList;
