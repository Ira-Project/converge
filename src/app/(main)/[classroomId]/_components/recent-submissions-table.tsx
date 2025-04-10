
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
    <div className="flex flex-col h-full min-h-[300px]">
      <p className="text-xl font-bold mb-4">
        Recent Submissions
      </p>
      <div className="bg-white rounded-2xl mx-auto border h-full my-auto overflow-y-scroll w-full">
        <div className="p-4 pb-2">
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
    </div>
  );
};