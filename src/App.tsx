import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";

// Pages
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import BalesList from "@/pages/bales/BalesList";
import BaleDetail from "@/pages/bales/BaleDetail";
import BaleForm from "@/pages/bales/BaleForm";
import FarmersList from "@/pages/farmers/FarmersList";
import FarmerDetail from "@/pages/farmers/FarmerDetail";
import FarmerForm from "@/pages/farmers/FarmerForm";
import BoxesList from "@/pages/boxes/BoxesList";
import BoxDetail from "@/pages/boxes/BoxDetail";
import BoxForm from "@/pages/boxes/BoxForm";
import Scan from "@/pages/Scan";
import ChangePassword from "@/pages/ChangePassword";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Bales */}
              <Route path="/bales" element={<BalesList />} />
              <Route path="/bales/new" element={<BaleForm />} />
              <Route path="/bales/:id" element={<BaleDetail />} />
              <Route path="/bales/:id/edit" element={<BaleForm />} />

              {/* Farmers */}
              <Route path="/farmers" element={<FarmersList />} />
              <Route path="/farmers/new" element={<FarmerForm />} />
              <Route path="/farmers/:id" element={<FarmerDetail />} />
              <Route path="/farmers/:id/edit" element={<FarmerForm />} />

              {/* Boxes */}
              <Route path="/boxes" element={<BoxesList />} />
              <Route path="/boxes/new" element={<BoxForm />} />
              <Route path="/boxes/:id" element={<BoxDetail />} />
              <Route path="/boxes/:id/edit" element={<BoxForm />} />

              {/* Scanner */}
              <Route path="/scan" element={<Scan />} />

              {/* Settings */}
              <Route path="/change-password" element={<ChangePassword />} />
            </Route>

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
