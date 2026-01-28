import React, { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Box,
  Calendar,
  Package,
  Loader2,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Printer,
  AlertTriangle,
  Plus,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useBox, useDeleteBox } from "@/hooks/useBoxes";
import { useBales, useDeleteBale } from "@/hooks/useBales";
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
} from "@/components/ui/alert-dialog";
import { DirectusBale, DirectusBox, DirectusFarmer } from "@/lib/directus";

const BoxDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [classificationFilter, setClassificationFilter] = useState("all");
  const [faultFilter, setFaultFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const deleteBale = useDeleteBale();
  const deleteBox = useDeleteBox();

  const { data: box, isLoading: boxLoading } = useBox(id);
  const { data: allBales = [], isLoading: balesLoading, error } = useBales(id);
  const { data: balesunboxed = [], isLoading, error: errorBales } = useBales();

  console.log("Box Detail Loaded", { box, allBales });

  /* =========================
     Helper functions
     ========================= */

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

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

  const getClassificationBadge = (classification?: string) => {
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

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      { variant: "default" | "secondary" | "outline"; label: string }
    > = {
      open: { variant: "default", label: "Open" },
      closed: { variant: "secondary", label: "Closed" },
      in_transit: { variant: "outline", label: "In Transit" },
      maintenance: { variant: "secondary", label: "Maintenance" },
    };

    const { variant, label } = variants[status] || {
      variant: "secondary",
      label: status,
    };

    return <Badge variant={variant}>{label}</Badge>;
  };

  /* =========================
     Derived data
     ========================= */

  const boxBales =
    allBales.filter((bale) => {
      const boxId = typeof bale.box === "object" ? bale.box?.id : bale.box;
      return boxId === id;
    }) || [];
  console.log("Filtered Box Bales:", boxBales);

  const filteredBales = useMemo(() => {
    return allBales.filter((bale) => {
      const farmerName = getFarmerName(bale);
      const matchesSearch =
        bale.bar_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bale.lot_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        farmerName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesClassification =
        classificationFilter === "all" ||
        bale.classification === classificationFilter;
      const matchesFault =
        faultFilter === "all" ||
        (faultFilter === "faulty" && bale.has_fault) ||
        (faultFilter === "normal" && !bale.has_fault);

      return matchesSearch && matchesClassification && matchesFault;
    });
  }, [allBales, searchQuery, classificationFilter, faultFilter]);

  const filteredUnboxedBales = useMemo(() => {
    return balesunboxed.filter((bale) => {
      const farmerName = getFarmerName(bale);

      const matchesSearch =
        bale.bar_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bale.lot_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        farmerName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesClassification =
        classificationFilter === "all" ||
        bale.classification === classificationFilter;

      const matchesFault =
        faultFilter === "all" ||
        (faultFilter === "faulty" && bale.has_fault) ||
        (faultFilter === "normal" && !bale.has_fault);

      // Check if the box column is empty
      const isUnboxed =
        bale.box === null || bale.box === undefined || bale.box === "";

      return (
        matchesSearch && matchesClassification && matchesFault && isUnboxed
      );
    });
  }, [balesunboxed, searchQuery, classificationFilter, faultFilter]);

  /* =========================
     Actions
     ========================= */

  const handleDeleteBale = async (baleId: string) => {
    try {
      await deleteBale.mutateAsync(baleId);
      setDeleteId(null);
      toast({
        title: "Bale Deleted",
        description: "The bale has been successfully deleted.",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete bale.",
      });
    }
  };

  const handleDeleteBox = async () => {
    if (!id) return;
    try {
      await deleteBox.mutateAsync(id);
      toast({
        title: "Box Deleted",
        description: "The box has been successfully removed.",
      });
      navigate("/boxes");
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete box.",
      });
    }
  };

  /* =========================
     Loading / Error
     ========================= */

  if (boxLoading || balesLoading) {
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

  if (errorBales) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 mx-auto text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error Loading Bales</h2>
        <p className="text-muted-foreground">Please try again later.</p>
      </div>
    );
  }

  if (!box) {
    return (
      <div className="text-center py-12">
        <Box className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Box Not Found</h2>
        <Button asChild>
          <Link to="/boxes">Back to Boxes</Link>
        </Button>
      </div>
    );
  }

  /* =========================
     JSX (unchanged)
     ========================= */

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link to="/boxes">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg bg-accent flex items-center justify-center">
              <Box className="w-7 h-7 text-accent-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-display text-2xl font-bold font-mono">
                  {box.id}
                </h1>
                {getStatusBadge(box.box_status || "available")}
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                Box ID: {String(box.id).slice(0, 8)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to={`/boxes/${box.id}/edit`}>
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
                <AlertDialogTitle>Delete Box</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete box {box.box_number}? This
                  action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteBox}
                  className="bg-destructive"
                >
                  {deleteBox.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Delete"
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
              <Box className="w-5 h-5" />
              Box Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Box Number</p>
                <p className="font-mono font-medium mt-1 text-lg">{box.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="mt-1">
                  {getStatusBadge(box.box_status || "available")}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Description
                </p>
                <p className="text-sm">{box.description}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Filters</p>
                <p className="text-sm">{box.filter}</p>
              </div>
            </div>

            {/* {box.description && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Description
                </p>
                <p className="text-sm">{box.description}</p>
              </div>
            )} */}
          </CardContent>
        </Card>

        {/* Stats & Timeline */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Contents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-4xl font-bold text-primary">
                  {filteredBales.length}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Bales in Box
                </p>
              </div>
            </CardContent>
          </Card>

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
                <Select
                  value={classificationFilter}
                  onValueChange={setClassificationFilter}
                >
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

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Bale</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this bale? This action cannot
                  be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteId && handleDeleteBale(deleteId)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Package className="w-4 h-4" />
        <span>Showing {filteredBales.length} of bales</span>
        <div className="">
          <Button type="button" className="btn-glow" onClick={toggleModal}>
            <Plus className="w-4 h-4 mr-2" />
            Add Bales
          </Button>
        </div>
        <div
          id="default-modal"
          tabIndex={-1}
          aria-hidden={!isModalOpen}
          className={`${
            isModalOpen ? "" : "hidden"
          } overflow-y-auto overflow-x-hidden flex fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full`}
        >
          <div className="relative p-4 w-full max-w-2xl max-h-full">
            <div className=" bg-white relative bg-neutral-primary-soft border border-default rounded-base shadow-sm p-4 md:p-6">
              <div className="flex items-center justify-between border-b border-default pb-4 md:pb-5">
                <h1 className="font-display text-2xl font-bold font-mono">
                  Select Bales
                </h1>
                <button
                  onClick={toggleModal}
                  type="button"
                  className="text-body bg-transparent hover:bg-neutral-tertiary hover:text-heading rounded-base text-sm w-9 h-9 ms-auto inline-flex justify-center items-center"
                  data-modal-hide="default-modal"
                >
                  <svg
                    className="w-5 h-5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18 17.94 6M18 18 6.06 6"
                    />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>

              <div className="space-y-4 md:space-y-6 py-4 md:py-6">
                {/* Bale Information */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Barcode</TableHead>
                      <TableHead>Farmer</TableHead>
                      <TableHead className="text-center">Mass (kg)</TableHead>
                      <TableHead className="text-center">
                        Classification
                      </TableHead>
                      <TableHead className="text-center">Fault</TableHead>
                      <TableHead>Box</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                      <TableHead className="text-right">Select</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUnboxedBales.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-12 text-muted-foreground"
                        >
                          <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                          No bales found matching your criteria
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUnboxedBales.map((bale) => (
                        <TableRow key={bale.id} className="group">
                          <TableCell>
                            <Link
                              to={`/bales/${bale.id}`}
                              className="font-medium text-primary hover:underline font-mono"
                            >
                              {bale.bar_code || String(bale.id).slice(0, 8)}
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
                                    {getFarmerName(bale)
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </span>
                                </div>
                                {getFarmerName(bale)}
                              </Link>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center font-medium">
                            {bale.mass || "—"}
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
                              <span className="text-muted-foreground">
                                Unassigned
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
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
                                  onClick={() => navigate(`/bales/${bale.id}`)}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                {/* <DropdownMenuItem
                                  onClick={() =>
                                    navigate(`/bales/${bale.id}/edit`)
                                  }
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem> */}
                                <DropdownMenuItem
                                  onClick={() => window.print()}
                                >
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
                          <TableCell className="flex justify-center">
                            <div className="flex items-center mb-4">
                              <input
                                id="default-checkbox"
                                type="checkbox"
                                className="
      w-4 h-4
      border border-default-medium
      rounded-xs
      bg-neutral-secondary-medium
      focus:ring-2
      focus:ring-[#9c5a37]
      focus:ring-offset-0
    "
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center border-t border-default space-x-4 pt-4 md:pt-5">
                <Button
                  type="button"
                  className="btn-glow"
                  // onClick={toggleModal}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Confirm
                </Button>
                <Button onClick={toggleModal} variant="destructive" size="sm">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
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
                    <TableCell
                      colSpan={7}
                      className="text-center py-12 text-muted-foreground"
                    >
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
                          {bale.bar_code || String(bale.id).slice(0, 8)}
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
                                {getFarmerName(bale)
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </span>
                            </div>
                            {getFarmerName(bale)}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {bale.mass || "—"}
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
                          <span className="text-muted-foreground">
                            Unassigned
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
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
                              onClick={() => navigate(`/bales/${bale.id}`)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {/* <DropdownMenuItem
                              onClick={() => navigate(`/bales/${bale.id}/edit`)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem> */}
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
    </div>
  );
};

export default BoxDetail;
