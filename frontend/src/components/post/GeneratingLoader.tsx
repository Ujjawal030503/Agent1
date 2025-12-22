'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

export default function GeneratingLoader() {
  return (
    <Card>
      <CardContent className="py-12">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
            <Sparkles className="h-8 w-8 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Generating posts...
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Our AI is crafting engaging content for you
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
