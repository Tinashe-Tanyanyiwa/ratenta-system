import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Box, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBox, useCreateBox, useUpdateBox } from '@/hooks/useBoxes';
import tobaccoStorage from '@/assets/tobacco-storage.jpeg';

const BoxForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = !!id;

  const { data: existingBox, isLoading: loadingBox } = useBox(id);
  const createBox = useCreateBox();
  const updateBox = useUpdateBox();

  const [formData, setFormData] = useState({
    box_number: '',
    description: '',
    box_status: 'available',
  });

  useEffect(() => {
    if (existingBox) {
      setFormData({
        box_number: existingBox.box_number || '',
        description: existingBox.description || '',
        box_status: existingBox.box_status || 'available',
      });
    }
  }, [existingBox]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEdit && id) {
        await updateBox.mutateAsync({ id, data: formData });
        toast({
          title: 'Box Updated',
          description: `Box ${formData.box_number} has been updated.`,
        });
      } else {
        await createBox.mutateAsync(formData);
        toast({
          title: 'Box Created',
          description: `Box ${formData.box_number} has been added.`,
        });
      }
      navigate('/boxes');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save box. Please try again.',
      });
    }
  };

  const isSubmitting = createBox.isPending || updateBox.isPending;

  if (isEdit && loadingBox) {
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
          src={tobaccoStorage} 
          alt="Tobacco storage" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
        <div className="absolute inset-0 flex items-center px-6">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon" className="bg-background/50 hover:bg-background/70">
              <Link to="/boxes">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                {isEdit ? 'Edit Box' : 'Add New Box'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {isEdit ? `Editing ${existingBox?.box_number}` : 'Register a new storage box'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Box className="w-5 h-5" />
              Box Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="box_number">Box Number *</Label>
              <Input
                id="box_number"
                value={formData.box_number}
                onChange={(e) => handleChange('box_number', e.target.value)}
                placeholder="BOX-001"
                className="font-mono"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="box_status">Box Status</Label>
              <Select
                value={formData.box_status}
                onValueChange={(value) => handleChange('box_status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Additional notes about this box..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4 mt-6">
          <Button asChild variant="outline">
            <Link to="/boxes">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting} className="btn-glow">
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Box' : 'Create Box'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BoxForm;
