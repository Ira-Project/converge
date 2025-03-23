
import Avatar from 'boring-avatars'
import {
  Avatar as ShadcnAvatar,
  AvatarImage,
} from "@/components/ui/avatar"
import {type RouterOutputs } from '@/trpc/shared';
import React from 'react';

export default function RecentSubmissionsList(props: {
  submissions: RouterOutputs["analytics"]["getSubmissions"]
}) {
  // Sample submissions data - replace with actual data as needed
  const submissions = props.submissions.slice(0, 5).map(submission => ({
    name: submission.name,
    avatar: submission.userAvatar,
    date: submission.submittedAt,
    type: submission.activityType,
    topic: submission.topic
  }));

  // Count total submissions this month
  const totalSubmissions = props.submissions.filter(sub => sub.submittedAt && new Date(sub.submittedAt).getMonth() === new Date().getMonth()).length;

  return (
    <div className="bg-white rounded-lg mx-auto border border-muted h-full my-auto">
      <div className="p-4 pb-2">
        <h2 className="text-md font-medium text-gray-900">Recent Submissions</h2>
        <p className="text-sm text-muted-foreground">You had {totalSubmissions} submissions this month</p>
      </div>
      
      <div>
        {submissions.map((submission, index) => (
          <div key={index} className="flex items-center p-2 px-4">
            {/* Avatar */}
            <div className="h-10 w-10 flex-shrink-0">
              <ShadcnAvatar className="h-8 w-8 rounded-full">
                {submission.avatar 
                  ? <AvatarImage src={submission.avatar} alt={submission.name} /> 
                  : <Avatar name={submission.name ?? "anonymous"} variant="bauhaus" />
                }
              </ShadcnAvatar>
            </div>
            
            {/* User info and timestamp */}
            <div className="flex-grow min-w-0">
              <p className="text-sm font-medium truncate">{submission.name}</p>
              <p className="text-xs text-muted-foreground">{submission.date ? new Date(submission.date).toLocaleString() : ''}</p>
            </div>
            {/* Categories and action */}
            <div className="flex flex-col items-end text-right ml-3">
              <p className="text-sm">
                {submission.topic}
              </p>
              <p className="text-xs text-muted-foreground">{submission.type}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};