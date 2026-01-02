import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useBale, useCreateBale, useUpdateBale } from "@/hooks/useBales";
import { useFarmers } from "@/hooks/useFarmers";
import { useBoxes } from "@/hooks/useBoxes";
import tobaccoWarehouse from "@/assets/tobacco-warehouse.jpg";

const BaleForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = !!id;

  const { data: existingBale, isLoading: loadingBale } = useBale(id);
  const { data: farmers = [], isLoading: loadingFarmers } = useFarmers();
  const { data: boxes = [], isLoading: loadingBoxes } = useBoxes();

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
              size="icon"
              className="bg-background/50 hover:bg-background/70"
            >
              <Link to="/bales">
                <ArrowLeft className="w-5 h-5" />
              </Link>
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
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Barcode *</Label>
                  <Input
                    value={formData.bar_code}
                    onChange={(e) => handleChange("bar_code", e.target.value)}
                    placeholder="BALE-001"
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
                      <SelectItem value="A">X40K</SelectItem>
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
