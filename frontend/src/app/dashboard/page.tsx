'use client';

import React from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Sparkles, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Welcome to your content generation dashboard
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Brand Kits</CardTitle>
                  <Package className="h-8 w-8 text-primary" />
                </div>
                <CardDescription>
                  Manage your brand voice and personality
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Create and manage brand kits to maintain consistent messaging across all platforms.
                </p>
                <Button asChild className="w-full">
                  <Link href="/dashboard/brand-kits">Manage Brand Kits</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Generate Content</CardTitle>
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <CardDescription>
                  Create AI-powered social media posts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate engaging content for Reddit, LinkedIn, and X using AI.
                </p>
                <Button asChild className="w-full">
                  <Link href="/dashboard/generate">Generate Content</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Analytics</CardTitle>
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <CardDescription>
                  Track your content performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Coming soon: View analytics and insights about your generated content.
                </p>
                <Button variant="outline" className="w-full" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Follow these steps to create your first post</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>Create a brand kit to define your brand voice and personality</li>
                <li>Navigate to the Generate Content page</li>
                <li>Select your niche and target platform</li>
                <li>Choose a brand kit (optional) to maintain consistency</li>
                <li>Generate and customize your posts</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
