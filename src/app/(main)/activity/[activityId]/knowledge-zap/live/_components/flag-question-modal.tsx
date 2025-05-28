'use client'

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { api } from '@/trpc/react';
import { toast } from 'sonner';
import { type KnowledgeZapQuestionType } from '@/lib/constants';
import { LoadingButton } from '@/components/loading-button';
import { Flag } from 'lucide-react';
import FormattedText from '@/components/formatted-text';

interface FlagQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionId: string;
  questionText: string;
  questionType: KnowledgeZapQuestionType;
  classroomId: string;
}

export const FlagQuestionModal: React.FC<FlagQuestionModalProps> = ({
  isOpen,
  onClose,
  questionId,
  questionText,
  questionType,
  classroomId
}) => {
  const [description, setDescription] = useState('');

  const flagQuestionMutation = api.knowledgeQuestions.flagQuestion.useMutation({
    onSuccess: () => {
      toast.success('Question flagged successfully! Your teacher and our team have been notified.');
      setDescription('');
      onClose();
    },
    onError: (error) => {
      toast.error('Failed to flag question. Please try again.');
      console.error('Error flagging question:', error);
    }
  });

  const handleSubmit = () => {
    flagQuestionMutation.mutate({
      questionId,
      type: questionType,
      report: description.trim() || undefined,
      questionText,
      classroomId
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Flag Question as Incorrect
          </DialogTitle>
          <DialogDescription>
            Help us improve by reporting questions that seem incorrect or confusing.
            Your teacher and our development team will be notified via email.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <Label className="text-sm font-medium text-gray-700">Question:</Label>
            <br />
            <FormattedText text={questionText} />
          </div>
          
          <div>
            <Label htmlFor="description" className="text-sm font-medium">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Please describe what seems incorrect about this question..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
              rows={4}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose} disabled={flagQuestionMutation.isLoading}>
            Cancel
          </Button>
          <LoadingButton
            onClick={handleSubmit}
            loading={flagQuestionMutation.isLoading}
            disabled={flagQuestionMutation.isLoading}
          >
            Flag Question
          </LoadingButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 