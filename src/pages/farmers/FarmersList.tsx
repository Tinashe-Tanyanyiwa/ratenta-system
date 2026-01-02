import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useFarmers, useDeleteFarmer } from '@/hooks/useFarmers';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Printer,
  Users,
  Loader2,
  Phone,
  Mail,
  MapPin,
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
import farmersImage from '@/assets/farmers.png';

const FarmersList: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: farmers = [], isLoading, error } = useFarmers();
  const deleteFarmer = useDeleteFarmer();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredFarmers = useMemo(() => {
    return farmers.filter((farmer) => {
      const matchesSearch =
        farmer.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        farmer.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        farmer.grower_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        farmer.phone_number?.includes(searchQuery) ||
        farmer.email?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [farmers, searchQuery]);

  const handleDelete = async (id: string) => {
    try {
      await deleteFarmer.mutateAsync(id);
      setDeleteId(null);
      toast({
        title: 'Farmer Deleted',
        description: 'The farmer has been successfully removed.',
      });
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
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 mx-auto text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error Loading Farmers</h2>
        <p className="text-muted-foreground">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative h-40 rounded-xl overflow-hidden">
        <img 
          src={farmersImage} 
          alt="Farmers at work" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
        <div className="absolute inset-0 flex items-center px-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Farmers</h1>
            <p className="text-muted-foreground mt-1">
              Manage registered tobacco farmers
            </p>
          </div>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2">
          <Button asChild className="btn-glow">
            <Link to="/farmers/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Farmer
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, grower number, phone, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="w-4 h-4" />
        <span>
          Showing {filteredFarmers.length} of {farmers.length} farmers
        </span>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Grower #</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFarmers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      No farmers found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFarmers.map((farmer) => (
                    <TableRow key={farmer.id} className="group">
                      <TableCell>
                        <Link
                          to={`/farmers/${farmer.id}`}
                          className="font-mono font-medium text-primary hover:underline"
                        >
                          {farmer.grower_number}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link 
                          to={`/farmers/${farmer.id}`}
                          className="flex items-center gap-3 hover:underline"
                        >
                          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-foreground">
                              {farmer.first_name?.[0]}{farmer.last_name?.[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{farmer.first_name} {farmer.last_name}</p>
                            {farmer.national_id && (
                              <p className="text-xs text-muted-foreground">ID: {farmer.national_id}</p>
                            )}
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {farmer.phone_number && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="w-3 h-3 text-muted-foreground" />
                              {farmer.phone_number}
                            </div>
                          )}
                          {farmer.email && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              {farmer.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {farmer.farm_location ? (
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <span className="truncate max-w-[200px]">{farmer.farm_location}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
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
                            <DropdownMenuItem onClick={() => navigate(`/farmers/${farmer.id}`)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/farmers/${farmer.id}/edit`)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.print()}>
                              <Printer className="w-4 h-4 mr-2" />
                              Print
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteId(farmer.id)}
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
            <AlertDialogTitle>Delete Farmer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this farmer? This action cannot be undone and will affect all associated bales.
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

export default FarmersList;
