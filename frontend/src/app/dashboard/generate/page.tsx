'use client';

import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useToast } from '@/contexts/ToastContext';
import { brandKitApi, contentApi, BrandKit } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Sparkles } from 'lucide-react';
import PostCard, { Post } from '@/components/post/PostCard';
import BulkActions from '@/components/post/BulkActions';
import GeneratingLoader from '@/components/post/GeneratingLoader';

export default function GenerateContentPage() {
  const [brandKits, setBrandKits] = useState<BrandKit[]>([]);
  const [niche, setNiche] = useState('');
  const [platform, setPlatform] = useState('reddit');
  const [selectedBrandKit, setSelectedBrandKit] = useState('');
  const [selectedBrandKitData, setSelectedBrandKitData] = useState<BrandKit | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPosts, setGeneratedPosts] = useState<Post[]>([]);
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

  useEffect(() => {
    if (selectedBrandKit) {
      const brandKit = brandKits.find((kit) => kit.id === selectedBrandKit);
      setSelectedBrandKitData(brandKit || null);
    } else {
      setSelectedBrandKitData(null);
    }
  }, [selectedBrandKit, brandKits]);

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
      const response = await contentApi.generate(
        niche,
        platform,
        selectedBrandKit || undefined
      );

      if (response.success && response.data) {
        const posts: Post[] = response.data.map((p) => ({
          id: p.id,
          platform: p.platform,
          text: p.post_text,
          confidence_score: p.confidence_score ? p.confidence_score / 100 : undefined,
          validation_notes: p.validation_notes,
          revised_text: p.revised_text,
        }));

        setGeneratedPosts(posts);
        showToast('Content generated successfully!', 'success');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate content';
      showToast(errorMessage, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdatePost = (id: string, newText: string) => {
    setGeneratedPosts((prev) =>
      prev.map((post) => (post.id === id ? { ...post, text: newText } : post))
    );
    showToast('Post updated', 'success');
  };

  const handleDeletePost = (id: string) => {
    setGeneratedPosts((prev) => prev.filter((post) => post.id !== id));
    showToast('Post deleted', 'success');
  };

  const handleCopyPost = (post: Post) => {
    showToast('Copied to clipboard!', 'success');
  };

  const handleCopyAll = async () => {
    try {
      const allPostsText = generatedPosts
        .map((post, index) => `Post ${index + 1} (${post.platform}):\n${post.text}`)
        .join('\n\n---\n\n');
      await navigator.clipboard.writeText(allPostsText);
      showToast('All posts copied to clipboard!', 'success');
    } catch (error) {
      showToast('Failed to copy posts', 'error');
    }
  };

  const handleExport = () => {
    try {
      const allPostsText = generatedPosts
        .map(
          (post, index) =>
            `Post ${index + 1} - ${post.platform.toUpperCase()}\n` +
            `Confidence: ${post.confidence_score ? Math.round(post.confidence_score * 100) : 'N/A'}%\n` +
            `\n${post.text}\n`
        )
        .join('\n---\n\n');

      const blob = new Blob([allPostsText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${niche.replace(/\s+/g, '-')}-posts-${Date.now()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Posts exported successfully!', 'success');
    } catch (error) {
      showToast('Failed to export posts', 'error');
    }
  };

  const handleDeleteAll = () => {
    if (confirm('Are you sure you want to delete all posts?')) {
      setGeneratedPosts([]);
      showToast('All posts cleared', 'success');
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

          {isGenerating && <GeneratingLoader />}

          {!isGenerating && generatedPosts.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Generated Posts</h2>
              </div>

              <BulkActions
                posts={generatedPosts}
                onCopyAll={handleCopyAll}
                onExport={handleExport}
                onDeleteAll={handleDeleteAll}
              />

              <div className="grid gap-4">
                {generatedPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    wordsToAvoid={selectedBrandKitData?.words_to_avoid || []}
                    onUpdate={handleUpdatePost}
                    onDelete={handleDeletePost}
                    onCopy={handleCopyPost}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
