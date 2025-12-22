'use client';

import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useToast } from '@/contexts/ToastContext';
import { brandKitApi, BrandKit } from '@/lib/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Edit, X } from 'lucide-react';

export default function BrandKitsPage() {
  const [brandKits, setBrandKits] = useState<BrandKit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    brand_name: '',
    tone: '',
    personality: '',
    words_to_use: '',
    words_to_avoid: '',
    example_posts: '',
  });

  const loadBrandKits = useCallback(async () => {
    try {
      const response = await brandKitApi.getAll();
      if (response.success && response.data) {
        setBrandKits(response.data);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load brand kits';
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadBrandKits();
  }, [loadBrandKits]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.brand_name.trim()) {
      showToast('Brand name is required', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        brand_name: formData.brand_name,
        tone: formData.tone || null,
        personality: formData.personality || null,
        words_to_use: formData.words_to_use
          ? formData.words_to_use.split(',').map((w) => w.trim()).filter(Boolean)
          : null,
        words_to_avoid: formData.words_to_avoid
          ? formData.words_to_avoid.split(',').map((w) => w.trim()).filter(Boolean)
          : null,
        example_posts: formData.example_posts || null,
      };

      if (editingId) {
        await brandKitApi.update(editingId, payload);
        showToast('Brand kit updated successfully', 'success');
      } else {
        await brandKitApi.create(payload);
        showToast('Brand kit created successfully', 'success');
      }

      resetForm();
      loadBrandKits();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save brand kit';
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (brandKit: BrandKit) => {
    setEditingId(brandKit.id);
    setFormData({
      brand_name: brandKit.brand_name,
      tone: brandKit.tone || '',
      personality: brandKit.personality || '',
      words_to_use: brandKit.words_to_use?.join(', ') || '',
      words_to_avoid: brandKit.words_to_avoid?.join(', ') || '',
      example_posts: brandKit.example_posts || '',
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this brand kit?')) {
      return;
    }

    try {
      await brandKitApi.delete(id);
      showToast('Brand kit deleted successfully', 'success');
      loadBrandKits();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete brand kit';
      showToast(errorMessage, 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      brand_name: '',
      tone: '',
      personality: '',
      words_to_use: '',
      words_to_avoid: '',
      example_posts: '',
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Brand Kits</h1>
              <p className="text-gray-600 mt-2">
                Manage your brand voice and personality
              </p>
            </div>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Brand Kit
            </Button>
          </div>

          {isFormOpen && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {editingId ? 'Edit Brand Kit' : 'Create Brand Kit'}
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={resetForm}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>
                  Define your brand&apos;s voice and personality for consistent content
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand_name">Brand Name *</Label>
                    <Input
                      id="brand_name"
                      value={formData.brand_name}
                      onChange={(e) =>
                        setFormData({ ...formData, brand_name: e.target.value })
                      }
                      placeholder="Enter brand name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tone">Tone</Label>
                    <Textarea
                      id="tone"
                      value={formData.tone}
                      onChange={(e) =>
                        setFormData({ ...formData, tone: e.target.value })
                      }
                      placeholder="Describe the tone (e.g., professional, casual, friendly)"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="personality">Personality</Label>
                    <Textarea
                      id="personality"
                      value={formData.personality}
                      onChange={(e) =>
                        setFormData({ ...formData, personality: e.target.value })
                      }
                      placeholder="Describe the brand personality (e.g., innovative, trustworthy)"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="words_to_use">Words to Use</Label>
                    <Input
                      id="words_to_use"
                      value={formData.words_to_use}
                      onChange={(e) =>
                        setFormData({ ...formData, words_to_use: e.target.value })
                      }
                      placeholder="Enter comma-separated words (e.g., innovative, cutting-edge, modern)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="words_to_avoid">Words to Avoid</Label>
                    <Input
                      id="words_to_avoid"
                      value={formData.words_to_avoid}
                      onChange={(e) =>
                        setFormData({ ...formData, words_to_avoid: e.target.value })
                      }
                      placeholder="Enter comma-separated words to avoid"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="example_posts">Example Posts</Label>
                    <Textarea
                      id="example_posts"
                      value={formData.example_posts}
                      onChange={(e) =>
                        setFormData({ ...formData, example_posts: e.target.value })
                      }
                      placeholder="Paste examples of posts that represent your desired style"
                      rows={5}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : brandKits.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-600 mb-4">No brand kits yet</p>
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Brand Kit
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {brandKits.map((brandKit) => (
                <Card key={brandKit.id}>
                  <CardHeader>
                    <CardTitle>{brandKit.brand_name}</CardTitle>
                    {brandKit.tone && (
                      <CardDescription>{brandKit.tone}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {brandKit.personality && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Personality:</p>
                        <p className="text-sm text-gray-600">{brandKit.personality}</p>
                      </div>
                    )}
                    {brandKit.words_to_use && brandKit.words_to_use.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Words to use:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {brandKit.words_to_use.map((word, i) => (
                            <span
                              key={i}
                              className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded"
                            >
                              {word}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {brandKit.words_to_avoid && brandKit.words_to_avoid.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Words to avoid:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {brandKit.words_to_avoid.map((word, i) => (
                            <span
                              key={i}
                              className="inline-block px-2 py-1 text-xs bg-red-100 text-red-800 rounded"
                            >
                              {word}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(brandKit)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(brandKit.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
