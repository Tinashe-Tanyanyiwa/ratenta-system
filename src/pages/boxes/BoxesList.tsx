import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useBoxes, useDeleteBox } from '@/hooks/useBoxes';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Box as BoxIcon,
  Loader2,
  Package,
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
import tobaccoStorage from '@/assets/boxes.jpg';

const BoxesList: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: boxes = [], isLoading, error } = useBoxes();
  const deleteBox = useDeleteBox();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [boxStatusFilter, setBoxStatusFilter] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredBoxes = useMemo(() => {
    return boxes.filter((box) => {
      const matchesSearch =
        box.box_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        box.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBoxStatus = boxStatusFilter === 'all' || box.box_status === boxStatusFilter;

      return matchesSearch && matchesBoxStatus;
    });
  }, [boxes, searchQuery, boxStatusFilter]);

  const handleDelete = async (id: string) => {
    try {
      await deleteBox.mutateAsync(id);
      setDeleteId(null);
      toast({
        title: 'Box Deleted',
        description: 'The box has been successfully removed.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete box.',
      });
    }
  };

  const getBoxStatusBadge = (boxStatus: string | undefined) => {
    if (!boxStatus) return null;
    const variants: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive'; label: string }> = {
      available: { variant: 'default', label: 'Available' },
      full: { variant: 'secondary', label: 'Full' },
      in_transit: { variant: 'outline', label: 'In Transit' },
      closed: { variant: 'destructive', label: 'Closed' },
    };
    const { variant, label } = variants[boxStatus] || { variant: 'secondary', label: boxStatus };
    return <Badge variant={variant}>{label}</Badge>;
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
        <BoxIcon className="w-12 h-12 mx-auto text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error Loading Boxes</h2>
        <p className="text-muted-foreground">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative h-40 rounded-xl overflow-hidden">
        <img 
          src={tobaccoStorage} 
          alt="Tobacco storage" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
        <div className="absolute inset-0 flex items-center px-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Boxes</h1>
            <p className="text-muted-foreground mt-1">
              Manage storage boxes and containers
            </p>
          </div>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2">
          <Button asChild className="btn-glow">
            <Link to="/boxes/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Box
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by box number or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={boxStatusFilter} onValueChange={setBoxStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Box Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Box Statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="full">Full</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <BoxIcon className="w-4 h-4" />
        <span>
          Showing {filteredBoxes.length} of {boxes.length} boxes
        </span>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredBoxes.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
            No boxes found matching your criteria
          </div>
        ) : (
          filteredBoxes.map((box) => (
            <Card key={box.id} className="card-hover group">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <Link to={`/boxes/${box.id}`}>
                      <CardTitle className="text-lg font-mono hover:underline">{box.id}</CardTitle>
                    </Link>
                    <div className="flex items-center gap-2 mt-2">
                      {getBoxStatusBadge(box.box_status)}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/boxes/${box.id}`)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/boxes/${box.id}/edit`)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteId(box.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {box.description ? (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {box.description}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No description
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-muted-foreground">
                      Created: {box.date_created ? new Date(box.date_created).toLocaleDateString() : '—'}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => navigate(`/boxes/${box.id}`)}
                      className="text-xs"
                    >
                      View →
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Box</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this box? This action cannot be undone.
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

export default BoxesList;
