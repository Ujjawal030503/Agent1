'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Download, Trash2 } from 'lucide-react';
import { Post } from './PostCard';

interface BulkActionsProps {
  posts: Post[];
  onCopyAll: () => void;
  onExport: () => void;
  onDeleteAll: () => void;
}

export default function BulkActions({
  posts,
  onCopyAll,
  onExport,
  onDeleteAll,
}: BulkActionsProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
      <div className="text-sm text-gray-700">
        <span className="font-semibold">{posts.length}</span>{' '}
        {posts.length === 1 ? 'post' : 'posts'} generated
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onCopyAll}>
          <Copy className="h-4 w-4 mr-2" />
          Copy All
        </Button>
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button variant="destructive" size="sm" onClick={onDeleteAll}>
          <Trash2 className="h-4 w-4 mr-2" />
          Clear All
        </Button>
      </div>
    </div>
  );
}
