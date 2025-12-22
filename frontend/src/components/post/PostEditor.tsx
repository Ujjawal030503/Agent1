'use client';

import React, { useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Info } from 'lucide-react';

interface PostEditorProps {
  value: string;
  onChange: (value: string) => void;
  platform: string;
  wordsToAvoid?: string[];
}

const AI_KEYWORDS = [
  'delve',
  'leverage',
  'cutting-edge',
  'game-changer',
  'revolutionize',
  'elevate',
  'empower',
  'synergy',
  'paradigm shift',
  'robust',
  'unlock',
  'seamless',
  'innovative',
  'transformative',
];

export default function PostEditor({
  value,
  onChange,
  platform,
  wordsToAvoid = [],
}: PostEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const getCharacterLimit = () => {
    switch (platform) {
      case 'x':
        return 280;
      case 'reddit':
        return 40000;
      case 'linkedin':
        return 3000;
      default:
        return null;
    }
  };

  const characterLimit = getCharacterLimit();
  const characterCount = value.length;
  const isOverLimit = characterLimit ? characterCount > characterLimit : false;

  const checkForViolations = () => {
    const lowerText = value.toLowerCase();
    const violations: string[] = [];

    wordsToAvoid.forEach((word) => {
      if (lowerText.includes(word.toLowerCase())) {
        violations.push(word);
      }
    });

    return violations;
  };

  const checkForAILanguage = () => {
    const lowerText = value.toLowerCase();
    const aiWords: string[] = [];

    AI_KEYWORDS.forEach((word) => {
      if (lowerText.includes(word.toLowerCase())) {
        aiWords.push(word);
      }
    });

    return aiWords;
  };

  const violations = checkForViolations();
  const aiWords = checkForAILanguage();
  const hasWarnings = violations.length > 0 || aiWords.length > 0;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full min-h-[120px] resize-none ${
            isOverLimit ? 'border-red-500 focus:border-red-500' : ''
          } ${hasWarnings ? 'border-yellow-500' : ''}`}
          placeholder="Enter your post content..."
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex flex-col gap-1">
          {violations.length > 0 && (
            <div className="flex items-start gap-1 text-red-600">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Words to avoid found:</strong> {violations.join(', ')}
              </span>
            </div>
          )}
          {aiWords.length > 0 && (
            <div className="flex items-start gap-1 text-yellow-600">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                <strong>AI-like language detected:</strong> {aiWords.join(', ')}
              </span>
            </div>
          )}
        </div>
        <div
          className={`font-medium ${
            isOverLimit
              ? 'text-red-600'
              : characterLimit && characterCount > characterLimit * 0.9
              ? 'text-yellow-600'
              : 'text-gray-500'
          }`}
        >
          {characterCount}
          {characterLimit && ` / ${characterLimit}`}
        </div>
      </div>

      {platform === 'x' && (
        <p className="text-xs text-gray-500">
          X (Twitter) has a 280 character limit
        </p>
      )}
    </div>
  );
}
