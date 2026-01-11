import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBales } from "@/hooks/useBales";
import { useFarmers } from "@/hooks/useFarmers";
import { useBoxes } from "@/hooks/useBoxes";
import { DirectusFarmer, DirectusBale } from "@/lib/directus";
import {
  Package,
  Users,
  Box,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Loader2,
  Leaf,
  BarChart3,
  Calendar,
} from "lucide-react";
import tobaccoLeavesTexture from "@/assets/tobacco-leaves-texture.jpeg";
import balesImage from "@/assets/bales.png";

const Dashboard: React.FC = () => {
  const { data: bales = [], isLoading: isLoadingBales } = useBales();
  const { data: farmers = [], isLoading: isLoadingFarmers } = useFarmers();
  const { data: boxes = [], isLoading: isLoadingBoxes } = useBoxes();

  const isLoading = isLoadingBales || isLoadingFarmers || isLoadingBoxes;

  const stats = {
    totalBales: bales.length,
    faultyBales: bales.filter((b) => b.has_fault).length,
    totalFarmers: farmers.length,
    totalBoxes: boxes.length,
    availableBoxes: boxes.filter((b) => b.box_status === "available").length,
  };

  const getFarmerName = (bale: DirectusBale): string => {
    if (typeof bale.grower_number === "object" && bale.grower_number) {
      const farmer = bale.grower_number as DirectusFarmer;
      return `${farmer.first_name} ${farmer.last_name}`;
    }
    return "Unknown";
  };

  const recentBales = bales.slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative h-56 rounded-2xl overflow-hidden">
        <img
          src={tobaccoLeavesTexture}
          alt="Tobacco leaves"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
        <div className="absolute inset-0 flex items-center px-8">
          <div className="max-w-lg">
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium text-primary">
                Ratenta Enterprises
              </span>
            </div>
            <h1 className="font-display text-4xl font-bold text-foreground">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Overview of your tobacco production management
            </p>
          </div>
        </div>
       
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Link to="/bales">
          <Card className="card-hover border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Bales
              </CardTitle>
              <Package className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalBales}</div>
              <p className="text-xs text-muted-foreground mt-1">
                registered in system
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/farmers">
          <Card className="card-hover border-l-4 border-l-tobacco-leaf">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Registered Farmers
              </CardTitle>
              <Users className="w-5 h-5 text-tobacco-leaf" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalFarmers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                tobacco growers
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/boxes">
          <Card className="card-hover border-l-4 border-l-accent">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Boxes
              </CardTitle>
              <Box className="w-5 h-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalBoxes}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-success">{stats.availableBoxes}</span>{" "}
                available
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/bales">
          <Card className="card-hover border-l-4 border-l-warning">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Flagged Issues
              </CardTitle>
              <AlertTriangle className="w-5 h-5 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">
                {stats.faultyBales}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                bales with faults
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              asChild
              className="w-full justify-start btn-glow"
              variant="default"
            >
              <Link to="/bales/new">
                <Package className="w-4 h-4 mr-2" />
                Create New Bale
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link to="/scan">
                <TrendingUp className="w-4 h-4 mr-2" />
                Scan Barcode
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link to="/farmers/new">
                <Users className="w-4 h-4 mr-2" />
                Add Farmer
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link to="/boxes/new">
                <Box className="w-4 h-4 mr-2" />
                Add Box
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Bales */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Bales
            </CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/bales" className="flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentBales.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No bales yet</p>
                <Button asChild className="mt-4" size="sm">
                  <Link to="/bales/new">Create your first bale</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentBales.map((bale) => (
                  <Link
                    key={bale.id}
                    to={`/bales/${bale.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {bale.has_fault ? (
                          <AlertTriangle className="w-4 h-4 text-warning" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-success" />
                        )}
                      </div>
                      <div>
                        x
                        <p className="text-xs text-muted-foreground">
                          {getFarmerName(bale)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {bale.mass ? `${bale.mass} kg` : "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {bale.classification || "—"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
