import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Scanner } from "@yudiel/react-qr-scanner";
import { DirectusBale, DirectusFarmer } from "@/lib/directus";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Save,
  Package,
  AlertTriangle,
  Loader2,
  DollarSign,
  Scale,
  Hash,
  Camera,
  Keyboard,
  Search,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useBale, useCreateBale, useUpdateBale } from "@/hooks/useBales";
import { useFarmers } from "@/hooks/useFarmers";
import { useBoxes } from "@/hooks/useBoxes";
import tobaccoWarehouse from "@/assets/tobacco-warehouse.jpg";
import { useBales } from "@/hooks/useBales";
import classNames from "classnames";

type ScanMode = "camera" | "manual";

const BaleForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = !!id;
  type TabKey = "home" | "profile" | "messages";
  const { data: existingBale, isLoading: loadingBale } = useBale(id);
  const { data: bales = [], isLoading } = useBales();
  const { data: farmers = [], isLoading: loadingFarmers } = useFarmers();
  const { data: boxes = [], isLoading: loadingBoxes } = useBoxes();

  const [mode, setMode] = useState<ScanMode>("manual");
  const [manualInput, setManualInput] = useState("");
  const [foundBale, setFoundBale] = useState<DirectusBale | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

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

  const searchBale = useCallback(
    (query: string) => {
      const bale = bales.find(
        (b) =>
          b.bar_code?.toLowerCase() === query.toLowerCase() ||
          b.id === query ||
          b.lot_number?.toLowerCase() === query.toLowerCase()
      );

      if (bale) {
        setFoundBale(bale);
        setScanError(null);
        toast({
          title: "Bale Found",
          description: `Found bale ${
            bale.bar_code || String(bale.id).slice(0, 8)
          }`,
        });
      } else {
        setFoundBale(null);
        setScanError("No bale found with that barcode or ID.");
        toast({
          variant: "destructive",
          title: "Not Found",
          description: "No bale found with that barcode or ID.",
        });
      }
    },
    [bales, toast]
  );

  const handleScanResult = useCallback(
    (result: any) => {
      if (result && result[0]?.rawValue) {
        const scannedValue = result[0].rawValue;
        setManualInput(scannedValue);
        searchBale(scannedValue);
        setIsScanning(false);
        setMode("manual");
      }
    },
    [searchBale]
  );

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      searchBale(manualInput.trim());
    }
  };

  const startScanning = () => {
    setIsScanning(true);
    setScanError(null);
    setFoundBale(null);
  };

  const stopScanning = () => {
    setIsScanning(false);
  };

  const getClassificationColor = (classification: string | undefined) => {
    if (!classification) return "bg-muted";
    const colors: Record<string, string> = {
      A: "bg-success/10 text-success border-success/30",
      B: "bg-primary/10 text-primary border-primary/30",
      C: "bg-warning/10 text-warning border-warning/30",
      D: "bg-destructive/10 text-destructive border-destructive/30",
    };
    return colors[classification] || "bg-muted";
  };

  const createBale = useCreateBale();
  const updateBale = useUpdateBale();

  const [formData, setFormData] = useState({
    bar_code: "",
    lot_number: "",
    grower_number: "",
    box: "",
    classification: "",
    mass: "",
    price: "",
    trade: "",
    buyer: "",
    buyers_mark: "",
    group_number: "",
    SEQ: "",
    appeal: "",
    frlsle: "",
    var: "",
    ro: "",
    rb: "",
    xx: "",
    co: "",
    rep: "",
    has_fault: false,
    fault_description: "",
  });
  const [hasFault, setHasFault] = useState<boolean>(formData.has_fault);
  const handleGoBack = () => {
    navigate(-1); // This will go back to the previous page
  };
  useEffect(() => {
    const populateFormData = (bale) => {
      const growerId =
        typeof bale.grower_number === "object" && bale.grower_number
          ? bale.grower_number.id
          : bale.grower_number || "";
      const boxId =
        typeof bale.box === "object" && bale.box ? bale.box.id : bale.box || "";

      return {
        bar_code: bale.bar_code || "",
        lot_number: bale.lot_number || "",
        grower_number: growerId,
        box: boxId,
        classification: bale.classification || "",
        mass: bale.mass?.toString() || "",
        price: bale.price?.toString() || "",
        trade: bale.trade || "",
        buyer: bale.buyer || "",
        buyers_mark: bale.buyers_mark || "",
        group_number: bale.group_number || "",
        SEQ: bale.SEQ || "",
        appeal: bale.appeal || "",
        frlsle: bale.frlsle || "",
        var: bale.var || "",
        ro: bale.ro || "",
        rb: bale.rb || "",
        xx: bale.xx || "",
        co: bale.co || "",
        rep: bale.rep || "",
        has_fault: bale.has_fault || false,
        fault_description: bale.fault_description || "",
      };
    };

    if (existingBale) {
      setFormData(populateFormData(existingBale));
    }
  }, [existingBale]);

  const handleChange = (field: string, value: string | boolean) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      mass: formData.mass ? parseFloat(formData.mass) : null,
      price: formData.price ? parseFloat(formData.price) : null,
      grower_number: formData.grower_number || null,
      box: formData.box || null,
    };
    try {
      if (isEdit && id) {
        await updateBale.mutateAsync({ id, data: payload });
        toast({
          title: "Bale Updated",
          description: `Bale ${formData.bar_code || id} has been updated.`,
        });
      } else {
        await createBale.mutateAsync(payload);
        toast({
          title: "Bale Created",
          description: `Bale ${formData.bar_code || "New"} has been created.`,
        });
      }
      navigate("/bales");
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save bale.",
      });
    }
  };

  const isSubmitting = createBale.isPending || updateBale.isPending;
  if (isEdit && (loadingBale || loadingFarmers || loadingBoxes))
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );

  const [activeTab, setActiveTab] = useState<TabKey>("home");

  const tabButtonClass = (tab: TabKey) =>
    classNames(
      "w-full px-4 py-2 text-sm font-medium transition-colors border-b-2",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
      {
        "border-primary text-foreground": activeTab === tab,
        "border-transparent text-muted-foreground hover:text-foreground":
          activeTab !== tab,
      }
    );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="relative h-40 rounded-xl overflow-hidden">
        <img
          src={tobaccoWarehouse}
          alt="Tobacco warehouse"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
        <div className="absolute inset-0 flex items-center px-6">
          <div className="flex items-center gap-4">
            <Button
              asChild
              variant="ghost"
              onClick={handleGoBack}
              size="icon"
              className="bg-background/50 hover:bg-background/70"
            >
              {/* <Link to="/bales"> */}
              <ArrowLeft className="w-5 h-5" />
              {/* </Link> */}
            </Button>
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                {isEdit ? "Edit Bale" : "Create New Bale"}
              </h1>
              <p className="text-muted-foreground mt-1">
                {isEdit
                  ? `Editing bale ${existingBale?.bar_code || id}`
                  : "Register a new tobacco bale"}
              </p>
            </div>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Temporary Barcode
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4 animate-fade-in">
                {/* Tabs */}
                <nav
                  role="tablist"
                  aria-label="Tabs"
                  aria-orientation="horizontal"
                  className="flex border-b"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "home"}
                    aria-controls="tab-home"
                    className={tabButtonClass("home")}
                    onClick={() => setActiveTab("home")}
                  >
                    Scan Bales
                  </button>

                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "profile"}
                    aria-controls="tab-profile"
                    className={tabButtonClass("profile")}
                    onClick={() => setActiveTab("profile")}
                  >
                    Shipment Order
                  </button>

                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "messages"}
                    aria-controls="tab-messages"
                    className={tabButtonClass("messages")}
                    onClick={() => setActiveTab("messages")}
                  >
                    Confirm
                  </button>
                </nav>

                {/* Panels */}
                <div className="mt-4">
                  {/* Scan Bales */}
                  {activeTab === "home" && (
                    <div id="tab-home" role="tabpanel">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Camera className="w-5 h-5" />
                            Scan Bales
                          </CardTitle>
                        </CardHeader>

                        <CardContent>
                          <div className="space-y-4">
                            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                              {isScanning ? (
                                <Scanner
                                  onScan={handleScanResult}
                                  onError={(error) => {
                                    console.error("Scan error:", error);
                                    setScanError(
                                      "Camera error. Please try again."
                                    );
                                  }}
                                  constraints={{ facingMode: "environment" }}
                                  styles={{
                                    container: {
                                      width: "100%",
                                      height: "100%",
                                    },
                                    video: {
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    },
                                  }}
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full">
                                  <div className="text-center">
                                    <Camera className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                                    <p className="text-muted-foreground">
                                      Camera paused
                                    </p>
                                  </div>
                                </div>
                              )}

                              {isScanning && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                  <div className="w-48 h-32 border-2 border-accent rounded-lg animate-pulse" />
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2">
                              {!isScanning ? (
                                <Button
                                  onClick={startScanning}
                                  className="flex-1"
                                >
                                  <Camera className="w-4 h-4 mr-2" />
                                  Start Scanning
                                </Button>
                              ) : (
                                <Button
                                  variant="destructive"
                                  onClick={stopScanning}
                                  className="flex-1"
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Stop Scanning
                                </Button>
                              )}
                            </div>

                            {scanError && (
                              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                                {scanError}
                              </div>
                            )}
                            <div className="space-y-2">
                              <Label>Mass</Label>
                              <Input
                                value={formData.group_number}
                                onChange={(e) =>
                                  handleChange("mass", e.target.value)
                                }
                                placeholder="Place On Scale"
                                disabled
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Add Details */}
                  {activeTab === "profile" && (
                    <div id="tab-profile" role="tabpanel">
                      <h1 className="text-2xl font-bold">Shipment Order</h1>
                    </div>
                  )}

                  {/* Confirm */}
                  {activeTab === "messages" && (
                    <div id="tab-messages" role="tabpanel">
                      <h1 className="text-2xl font-bold">Confirm</h1>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Barcode *</Label>
                  <Input
                    value={formData.bar_code}
                    onChange={(e) => handleChange("bar_code", e.target.value)}
                    placeholder=""
                    className="font-mono"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Lot Number</Label>
                  <Input
                    value={formData.lot_number}
                    onChange={(e) => handleChange("lot_number", e.target.value)}
                    placeholder="LOT-001"
                    className="font-mono"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Farmer</Label>
                <Select
                  value={formData.grower_number}
                  onValueChange={(v) => handleChange("grower_number", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select farmer" />
                  </SelectTrigger>
                  <SelectContent>
                    {farmers.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.first_name} {f.last_name} ({f.grower_number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Box</Label>
                <Select
                  value={formData.box}
                  onValueChange={(v) => handleChange("box", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select box" />
                  </SelectTrigger>
                  <SelectContent>
                    {boxes.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.box_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Classification</Label>
                  <Select
                    value={formData.classification}
                    onValueChange={(v) => handleChange("classification", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>None</SelectItem>
                      <SelectItem value="X40K">X40K</SelectItem>
                      <SelectItem value="B">Class B</SelectItem>
                      <SelectItem value="C">Class C</SelectItem>
                      <SelectItem value="D">Class D</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Group Number</Label>
                  <Input
                    value={formData.group_number}
                    onChange={(e) =>
                      handleChange("group_number", e.target.value)
                    }
                    placeholder="GRP-001"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5" />
                Measurements & Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mass (kg)</Label>
                  <div className="relative">
                    <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.mass}
                      onChange={(e) => handleChange("mass", e.target.value)}
                      placeholder="0.00"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Price</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => handleChange("price", e.target.value)}
                      placeholder="0.00"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Trade</Label>
                  <Input
                    value={formData.trade}
                    onChange={(e) => handleChange("trade", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Buyer</Label>
                  <Input
                    value={formData.buyer}
                    onChange={(e) => handleChange("buyer", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Buyer's Mark</Label>
                  <Input
                    value={formData.buyers_mark}
                    onChange={(e) =>
                      handleChange("buyers_mark", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>SEQ</Label>
                  <Input
                    value={formData.SEQ}
                    onChange={(e) => handleChange("SEQ", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Appeal</Label>
                <Input
                  value={formData.appeal}
                  onChange={(e) => handleChange("appeal", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="w-5 h-5" />
                Technical Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {["frlsle", "var", "ro", "rb", "xx", "co", "rep"].map((f) => (
                  <div key={f} className="space-y-2">
                    <Label>{f.toUpperCase()}</Label>
                    <Input
                      type="checkbox"
                      checked={hasFault}
                      onChange={(e) => setHasFault(e.target.checked)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Fault Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Has Fault</Label>
                  <p className="text-sm text-muted-foreground">
                    Flag if quality issues
                  </p>
                </div>
                <Switch
                  checked={formData.has_fault}
                  onCheckedChange={(c) => handleChange("has_fault", c)}
                />
              </div>
              {formData.has_fault && (
                <div className="space-y-2">
                  <Label>Fault Description</Label>
                  <Textarea
                    value={formData.fault_description}
                    onChange={(e) =>
                      handleChange("fault_description", e.target.value)
                    }
                    rows={4}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="flex items-center justify-end gap-4">
          <div className="flex items-center gap-2">
            <Input type="checkbox" className="h-5 w-5" />
            <Label>Stay On This Page After Creating</Label>
          </div>

          <Button asChild variant="outline">
            <Link to="/bales">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting} className="btn-glow">
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isSubmitting
              ? "Saving..."
              : isEdit
              ? "Update Bale"
              : "Create Bale"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BaleForm;
