import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, User, MapPin, Phone, Mail, CreditCard, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFarmer, useCreateFarmer, useUpdateFarmer } from '@/hooks/useFarmers';
import farmersImage from '@/assets/farmers.png';

const FarmerForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = !!id;

  const { data: existingFarmer, isLoading: loadingFarmer } = useFarmer(id);
  const createFarmer = useCreateFarmer();
  const updateFarmer = useUpdateFarmer();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    grower_number: '',
    national_id: '',
    phone_number: '',
    email: '',
    farm_location: '',
  });

  useEffect(() => {
    if (existingFarmer) {
      setFormData({
        first_name: existingFarmer.first_name || '',
        last_name: existingFarmer.last_name || '',
        grower_number: existingFarmer.grower_number || '',
        national_id: existingFarmer.national_id || '',
        phone_number: existingFarmer.phone_number || '',
        email: existingFarmer.email || '',
        farm_location: existingFarmer.farm_location || '',
      });
    }
  }, [existingFarmer]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEdit && id) {
        await updateFarmer.mutateAsync({ id, data: formData });
        toast({
          title: 'Farmer Updated',
          description: `${formData.first_name} ${formData.last_name} has been updated.`,
        });
      } else {
        await createFarmer.mutateAsync(formData);
        toast({
          title: 'Farmer Created',
          description: `${formData.first_name} ${formData.last_name} has been added.`,
        });
      }
      navigate('/farmers');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save farmer. Please try again.',
      });
    }
  };

  const isSubmitting = createFarmer.isPending || updateFarmer.isPending;

  if (isEdit && loadingFarmer) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative h-40 rounded-xl overflow-hidden">
        <img 
          src={farmersImage} 
          alt="Farmers" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
        <div className="absolute inset-0 flex items-center px-6">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon" className="bg-background/50 hover:bg-background/70">
              <Link to="/farmers">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                {isEdit ? 'Edit Farmer' : 'Add New Farmer'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {isEdit ? `Editing ${existingFarmer?.first_name} ${existingFarmer?.last_name}` : 'Register a new tobacco farmer'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleChange('first_name', e.target.value)}
                    placeholder="John"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleChange('last_name', e.target.value)}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="grower_number">Grower Number *</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="grower_number"
                    value={formData.grower_number}
                    onChange={(e) => handleChange('grower_number', e.target.value)}
                    placeholder="GRW-001"
                    className="pl-10 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="national_id">National ID</Label>
                <Input
                  id="national_id"
                  value={formData.national_id}
                  onChange={(e) => handleChange('national_id', e.target.value)}
                  placeholder="00-000000X00"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Contact & Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone_number"
                    value={formData.phone_number}
                    onChange={(e) => handleChange('phone_number', e.target.value)}
                    placeholder="+263 77 123 4567"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="farmer@example.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="farm_location">Farm Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Textarea
                    id="farm_location"
                    value={formData.farm_location}
                    onChange={(e) => handleChange('farm_location', e.target.value)}
                    placeholder="Farm address or location description..."
                    className="pl-10 min-h-[120px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <Button asChild variant="outline">
            <Link to="/farmers">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting} className="btn-glow">
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Farmer' : 'Create Farmer'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FarmerForm;
