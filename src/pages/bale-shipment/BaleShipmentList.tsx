import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useBaleShipments,
  useDeleteBaleShipment,
} from "@/hooks/useBaleShipments";
import { DirectusBale, DirectusFarmer, DirectusBox } from "@/lib/directus";
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
  Box as BoxIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import tobaccoWarehouse from "@/assets/tobacco-warehouse.jpg";

const BaleShipmentList: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: baleshipment = [], isLoading, error } = useBaleShipments();
  const deleteBaleShipment = useDeleteBaleShipment();

  const [searchQuery, setSearchQuery] = useState("");
  const [classificationFilter, setClassificationFilter] =
    useState<string>("all");
  const [balesShipmentStatusFilter, setBalesShipmentStatusFilter] =
    useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getFarmerName = (bale: DirectusBale): string => {
    if (typeof bale.grower_number === "object" && bale.grower_number) {
      const farmer = bale.grower_number as DirectusFarmer;
      return `${farmer.first_name} ${farmer.last_name}`;
    }
    return "Unknown";
  };

  const getFarmerId = (bale: DirectusBale): string | null => {
    if (typeof bale.grower_number === "object" && bale.grower_number) {
      return (bale.grower_number as DirectusFarmer).id;
    }
    return null;
  };

  const getBoxNumber = (bale: DirectusBale): string | null => {
    if (typeof bale.box === "object" && bale.box) {
      return (bale.box as DirectusBox).box_number;
    }
    return null;
  };

  const filteredBalesShipments = useMemo(() => {
    return baleshipment.filter((bale) => {
      const baleId = bale.id; // Keep it as a number

      const matchesSearch =
        String(baleId).includes(searchQuery) || // Convert to string just for this check
        (bale.filters &&
          bale.filters.toLowerCase().includes(searchQuery.toLowerCase())) || // Ensure to lowercase filters
        (bale.status &&
          bale.status.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesSort =
        balesShipmentStatusFilter === "all" ||
        bale.sort === balesShipmentStatusFilter;
      return matchesSearch && matchesSort;
    });
  }, [baleshipment, searchQuery, balesShipmentStatusFilter]);

  console.log("Filtered Bale Shipments:", filteredBalesShipments);

  const handleDelete = async (id: string) => {
    try {
      await deleteBaleShipment.mutateAsync(id);
      setDeleteId(null);
      toast({
        title: "Bale Shipment Deleted",
        description: "The bale shipment has been successfully deleted.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete bale.",
      });
    }
  };

  const getBoxStatusBadge = (boxStatus: string | undefined) => {
    if (!boxStatus) return null;
    const variants: Record<
      string,
      {
        variant: "default" | "secondary" | "outline" | "destructive";
        label: string;
      }
    > = {
      available: { variant: "default", label: "Available" },
      full: { variant: "secondary", label: "Full" },
      in_transit: { variant: "outline", label: "In Transit" },
      closed: { variant: "destructive", label: "Closed" },
    };
    const { variant, label } = variants[boxStatus] || {
      variant: "secondary",
      label: boxStatus,
    };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getClassificationBadge = (classification: string | undefined) => {
    if (!classification) return null;
    const colors: Record<string, string> = {
      A: "bg-success/10 text-success border-success/30",
      B: "bg-primary/10 text-primary border-primary/30",
      C: "bg-warning/10 text-warning border-warning/30",
      D: "bg-destructive/10 text-destructive border-destructive/30",
    };
    return (
      <span
        className={`px-2 py-0.5 rounded text-xs font-medium border ${
          colors[classification] || "bg-muted"
        }`}
      >
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
            <h1 className="font-display text-3xl font-bold text-foreground">
              Bales Shipment
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and track all Shipments Of Bales
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
            <Select
              value={classificationFilter}
              onValueChange={setClassificationFilter}
            >
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
        <span>Showing {filteredBalesShipments.length} of boxes</span>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredBalesShipments.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
            No boxes found matching your criteria
          </div>
        ) : (
          filteredBalesShipments.map((bale) => (
            <Card key={bale.id} className="card-hover group">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <Link to={`/boxes/${bale.id}`}>
                      <CardTitle className="text-lg font-mono hover:underline">
                        {bale.id}
                      </CardTitle>
                    </Link>
                    <div className="flex items-center gap-2 mt-2">
                      {getBoxStatusBadge(bale.status)}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => navigate(`/bale-shipments/${bale.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          navigate(`/bale-shipments/${bale.id}/edit`)
                        }
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
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
                </div>
              </CardHeader>
              <CardContent>
                {/* <div className="space-y-3">
                  {bale.bales ? (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {bale.description}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No description
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-muted-foreground">
                      Created: {bale.date_created ? new Date(bale.date_created).toLocaleDateString() : '—'}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => navigate(`/bale-shipments/${bale.id}`)}
                      className="text-xs"
                    >
                      View →
                    </Button>
                  </div>
                </div> */}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bale</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this bale? This action cannot be
              undone.
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

export default BaleShipmentList;
