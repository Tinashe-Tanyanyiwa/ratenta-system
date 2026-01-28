import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useBales } from '@/hooks/useBales';
import { DirectusBale, DirectusFarmer } from '@/lib/directus';
import { Scanner } from '@yudiel/react-qr-scanner';
import {
  Camera,
  Keyboard,
  Search,
  Package,
  User,
  Scale,
  AlertTriangle,
  X,
  Loader2,
  ScanLine,
  CheckCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import tobaccoWarehouse from '@/assets/tobacco-warehouse.jpg';

type ScanMode = 'camera' | 'manual';

const Scan: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: bales = [], isLoading } = useBales();
  
  const [mode, setMode] = useState<ScanMode>('manual');
  const [manualInput, setManualInput] = useState('');
  const [foundBale, setFoundBale] = useState<DirectusBale | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

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

  const searchBale = useCallback((query: string) => {
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
        title: 'Bale Found',
        description: `Found bale ${bale.bar_code || String(bale.id).slice(0, 8)
        }`,
      });
    } else {
      setFoundBale(null);
      setScanError('No bale found with that barcode or ID.');
      toast({
        variant: 'destructive',
        title: 'Not Found',
        description: 'No bale found with that barcode or ID.',
      });
    }
  }, [bales, toast]);

  const handleScanResult = useCallback((result: any) => {
    if (result && result[0]?.rawValue) {
      const scannedValue = result[0].rawValue;
      setManualInput(scannedValue);
      searchBale(scannedValue);
      setIsScanning(false);
      setMode('manual');
    }
  }, [searchBale]);

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
    if (!classification) return 'bg-muted';
    const colors: Record<string, string> = {
      A: 'bg-success/10 text-success border-success/30',
      B: 'bg-primary/10 text-primary border-primary/30',
      C: 'bg-warning/10 text-warning border-warning/30',
      D: 'bg-destructive/10 text-destructive border-destructive/30',
    };
    return colors[classification] || 'bg-muted';
  };

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
            <div className="flex items-center gap-2 mb-1">
              <ScanLine className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">Barcode Scanner</span>
            </div>
            <h1 className="font-display text-3xl font-bold">Scan Bale</h1>
            <p className="text-muted-foreground mt-1">
              Scan or enter a barcode to find bale information
            </p>
          </div>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="flex gap-2">
        <Button
          variant={mode === 'camera' ? 'default' : 'outline'}
          onClick={() => {
            setMode('camera');
            startScanning();
          }}
          className="flex-1 sm:flex-none"
        >
          <Camera className="w-4 h-4 mr-2" />
          Camera Scan
        </Button>
        <Button
          variant={mode === 'manual' ? 'default' : 'outline'}
          onClick={() => {
            setMode('manual');
            stopScanning();
          }}
          className="flex-1 sm:flex-none"
        >
          <Keyboard className="w-4 h-4 mr-2" />
          Manual Entry
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner Area */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {mode === 'camera' ? <Camera className="w-5 h-5" /> : <Keyboard className="w-5 h-5" />}
              {mode === 'camera' ? 'Camera Scanner' : 'Manual Input'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mode === 'camera' ? (
              <div className="space-y-4">
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                  {isScanning ? (
                    <Scanner
                      onScan={handleScanResult}
                      onError={(error) => {
                        console.error('Scan error:', error);
                        setScanError('Camera error. Please try manual input.');
                      }}
                      constraints={{ facingMode: 'environment' }}
                      styles={{
                        container: { width: '100%', height: '100%' },
                        video: { width: '100%', height: '100%', objectFit: 'cover' },
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Camera className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">Camera paused</p>
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
                    <Button onClick={startScanning} className="flex-1">
                      <Camera className="w-4 h-4 mr-2" />
                      Start Scanning
                    </Button>
                  ) : (
                    <Button variant="destructive" onClick={stopScanning} className="flex-1">
                      <X className="w-4 h-4 mr-2" />
                      Stop Scanning
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Position the barcode within the frame to scan automatically
                </p>
              </div>
            ) : (
              <form onSubmit={handleManualSearch} className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="Enter barcode, lot number, or Bale ID..."
                    className="pl-10 font-mono text-lg"
                    autoFocus
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 mr-2" />
                  )}
                  Search
                </Button>
              </form>
            )}
            
            {scanError && (
              <div className="mt-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {scanError}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Result Area */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Scaned Bales
            </CardTitle>
          </CardHeader>
          <CardContent>
            {foundBale ? (
              <div className="space-y-6 animate-fade-in">
                {/* Bale Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <span className="text-sm text-success font-medium">Bale Found</span>
                    </div>
                    <h3 className="text-xl font-bold">{foundBale.bar_code || `Bale #${foundBale.id.slice(0, 8)}`}</h3>
                    {foundBale.lot_number && (
                      <p className="text-sm text-muted-foreground font-mono">
                        Lot: {foundBale.lot_number}
                      </p>
                    )}
                  </div>
                  {foundBale.has_fault && (
                    <Badge variant="outline" className="border-warning text-warning">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Fault
                    </Badge>
                  )}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Scale className="w-4 h-4" />
                      <span className="text-xs">Mass</span>
                    </div>
                    <p className="text-lg font-bold">{foundBale.mass ? `${foundBale.mass} kg` : '—'}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Classification</div>
                    {foundBale.classification ? (
                      <span className={`px-2 py-1 rounded text-sm font-bold border ${getClassificationColor(foundBale.classification)}`}>
                        {foundBale.classification}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                </div>

                {/* Farmer Link */}
                {getFarmerId(foundBale) ? (
                  <Link
                    to={`/farmers/${getFarmerId(foundBale)}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{getFarmerName(foundBale)}</p>
                      <p className="text-xs text-primary">View farmer details →</p>
                    </div>
                  </Link>
                ) : (
                  <div className="p-3 rounded-lg bg-muted/50 text-muted-foreground">
                    No farmer assigned
                  </div>
                )}

                {/* Fault Info */}
                {foundBale.has_fault && foundBale.fault_description && (
                  <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
                    <p className="text-sm font-medium text-warning mb-1">Fault Description</p>
                    <p className="text-sm">{foundBale.fault_description}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button asChild className="flex-1">
                    <Link to={`/bales/${foundBale.id}`}>View Full Details</Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <Link to={`/bales/${foundBale.id}/edit`}>Edit Bale</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No bale scanned yet</p>
                <p className="text-sm">Scan a barcode or enter an ID to add bales</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Scan;
