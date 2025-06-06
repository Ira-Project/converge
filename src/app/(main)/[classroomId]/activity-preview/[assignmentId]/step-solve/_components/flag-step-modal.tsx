import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/trpc/react';
import { toast } from 'sonner';

interface FlagStepModalProps {
  isOpen: boolean;
  onClose: () => void;
  stepId: string;
  stepText: string;
  classroomId: string;
}

export const FlagStepModal: React.FC<FlagStepModalProps> = ({
  isOpen,
  onClose,
  stepId,
  stepText,
  classroomId
}) => {
  const [description, setDescription] = useState('');

  const flagStepMutation = api.stepSolveCheckStep.flagStep.useMutation({
    onSuccess: () => {
      toast.success('Step flagged successfully! Your teacher and our team have been notified.');
      setDescription('');
      onClose();
    },
    onError: (error) => {
      toast.error('Failed to flag step. Please try again.');
      console.error('Error flagging step:', error);
    }
  });

  const handleSubmit = () => {
    flagStepMutation.mutate({
      stepId,
      report: description.trim() || undefined,
      stepText,
      classroomId
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Flag Incorrect Step</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Help us improve by reporting issues with this step. Your feedback will be sent to your teacher and our team.
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">
              Step Content:
            </label>
            <div className="p-3 bg-gray-50 rounded-md border text-sm">
              {stepText || "No step text available"}
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">
              What's wrong with this step? (Optional)
            </label>
            <Textarea
              placeholder="Describe the issue with this step..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full"
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={flagStepMutation.isLoading}
            >
              {flagStepMutation.isLoading ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 