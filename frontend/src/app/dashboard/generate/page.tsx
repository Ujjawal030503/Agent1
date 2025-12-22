'use client';

import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useToast } from '@/contexts/ToastContext';
import { brandKitApi, BrandKit } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Sparkles, Copy, CheckCircle } from 'lucide-react';

interface GeneratedPost {
  id: string;
  platform: string;
  text: string;
  isEditing: boolean;
  copied: boolean;
}

export default function GenerateContentPage() {
  const [brandKits, setBrandKits] = useState<BrandKit[]>([]);
  const [niche, setNiche] = useState('');
  const [platform, setPlatform] = useState('reddit');
  const [selectedBrandKit, setSelectedBrandKit] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const { showToast } = useToast();

  const loadBrandKits = useCallback(async () => {
    try {
      const response = await brandKitApi.getAll();
      if (response.success && response.data) {
        setBrandKits(response.data);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load brand kits';
      showToast(errorMessage, 'error');
    }
  }, [showToast]);

  useEffect(() => {
    loadBrandKits();
  }, [loadBrandKits]);

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();

    if (!niche.trim()) {
      showToast('Please enter a niche', 'error');
      return;
    }

    if (!platform) {
      showToast('Please select a platform', 'error');
      return;
    }

    setIsGenerating(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockPosts: GeneratedPost[] = [
        {
          id: '1',
          platform,
          text: `Just discovered something amazing about ${niche}! 🚀\n\nHere's what I learned that changed everything...\n\n[Thread 1/5]`,
          isEditing: false,
          copied: false,
        },
        {
          id: '2',
          platform,
          text: `The ${niche} industry is evolving fast. Here are 3 trends you can't ignore:\n\n1. Innovation in AI integration\n2. Focus on sustainability\n3. User-centric design\n\nWhat trends are you seeing?`,
          isEditing: false,
          copied: false,
        },
        {
          id: '3',
          platform,
          text: `Pro tip for anyone working in ${niche}:\n\nDon't just follow best practices—understand WHY they work.\n\nThat's the difference between copying and creating.`,
          isEditing: false,
          copied: false,
        },
      ];

      setGeneratedPosts(mockPosts);
      showToast('Content generated successfully!', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate content';
      showToast(errorMessage, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (post: GeneratedPost) => {
    try {
      await navigator.clipboard.writeText(post.text);
      setGeneratedPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, copied: true } : p))
      );
      showToast('Copied to clipboard!', 'success');

      setTimeout(() => {
        setGeneratedPosts((prev) =>
          prev.map((p) => (p.id === post.id ? { ...p, copied: false } : p))
        );
      }, 2000);
    } catch {
      showToast('Failed to copy to clipboard', 'error');
    }
  };

  const handleEdit = (postId: string) => {
    setGeneratedPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isEditing: true } : p))
    );
  };

  const handleSaveEdit = (postId: string, newText: string) => {
    setGeneratedPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, text: newText, isEditing: false } : p))
    );
    showToast('Post updated', 'success');
  };

  const getPlatformBadgeColor = (platform: string) => {
    switch (platform) {
      case 'reddit':
        return 'bg-orange-100 text-orange-800';
      case 'linkedin':
        return 'bg-blue-100 text-blue-800';
      case 'x':
        return 'bg-gray-800 text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'x':
        return 'X (Twitter)';
      default:
        return platform.charAt(0).toUpperCase() + platform.slice(1);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Generate Content</h1>
            <p className="text-gray-600 mt-2">
              Create AI-powered social media posts for your brand
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Content Generation Form</CardTitle>
              <CardDescription>
                Fill in the details to generate engaging social media posts
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleGenerate}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="niche">Niche *</Label>
                  <Input
                    id="niche"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="e.g., SaaS, fitness, finance"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="platform">Platform *</Label>
                  <Select
                    id="platform"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    required
                  >
                    <option value="reddit">Reddit</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="x">X (Twitter)</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brandKit">Brand Kit (Optional)</Label>
                  <Select
                    id="brandKit"
                    value={selectedBrandKit}
                    onChange={(e) => setSelectedBrandKit(e.target.value)}
                  >
                    <option value="">No brand kit</option>
                    {brandKits.map((kit) => (
                      <option key={kit.id} value={kit.id}>
                        {kit.brand_name}
                      </option>
                    ))}
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Select a brand kit to maintain consistent voice and tone
                  </p>
                </div>
              </CardContent>
              <div className="px-6 pb-6">
                <Button type="submit" disabled={isGenerating} className="w-full">
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Content
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>

          {generatedPosts.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Generated Posts</h2>
              <div className="grid gap-4">
                {generatedPosts.map((post) => (
                  <Card key={post.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPlatformBadgeColor(
                            post.platform
                          )}`}
                        >
                          {getPlatformName(post.platform)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(post)}
                          disabled={post.copied}
                        >
                          {post.copied ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-1" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {post.isEditing ? (
                        <div className="space-y-2">
                          <Textarea
                            value={post.text}
                            onChange={(e) => {
                              const newText = e.target.value;
                              setGeneratedPosts((prev) =>
                                prev.map((p) => (p.id === post.id ? { ...p, text: newText } : p))
                              );
                            }}
                            rows={6}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(post.id, post.text)}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setGeneratedPosts((prev) =>
                                  prev.map((p) => (p.id === post.id ? { ...p, isEditing: false } : p))
                                )
                              }
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-gray-900 whitespace-pre-wrap">{post.text}</p>
                          <Button
                            variant="link"
                            size="sm"
                            className="mt-2 px-0"
                            onClick={() => handleEdit(post.id)}
                          >
                            Edit post
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
