'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, CheckCircle, Trash2, AlertTriangle } from 'lucide-react';
import PostEditor from './PostEditor';

export interface Post {
  id: string;
  platform: string;
  text: string;
  confidence_score?: number;
}

interface PostCardProps {
  post: Post;
  wordsToAvoid?: string[];
  onUpdate: (id: string, newText: string) => void;
  onDelete: (id: string) => void;
  onCopy: (post: Post) => void;
}

export default function PostCard({
  post,
  wordsToAvoid = [],
  onUpdate,
  onDelete,
  onCopy,
}: PostCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(post.text);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(post.text);
      setCopied(true);
      onCopy(post);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleSave = () => {
    onUpdate(post.id, editedText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedText(post.text);
    setIsEditing(false);
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
        return 'X';
      case 'reddit':
        return 'Reddit';
      case 'linkedin':
        return 'LinkedIn';
      default:
        return platform.charAt(0).toUpperCase() + platform.slice(1);
    }
  };

  const getConfidenceColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPlatformBadgeColor(
                post.platform
              )}`}
            >
              {getPlatformName(post.platform)}
            </span>
            {post.confidence_score !== undefined && (
              <span
                className={`text-sm font-medium ${getConfidenceColor(
                  post.confidence_score
                )}`}
              >
                {Math.round(post.confidence_score * 100)}% confidence
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={copied}
            >
              {copied ? (
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
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(post.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-3">
            <PostEditor
              value={editedText}
              onChange={setEditedText}
              platform={post.platform}
              wordsToAvoid={wordsToAvoid}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-gray-900 whitespace-pre-wrap mb-3">{post.text}</p>
            <Button
              variant="link"
              size="sm"
              className="px-0"
              onClick={() => setIsEditing(true)}
            >
              Edit post
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
