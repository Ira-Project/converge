'use client';

import { useState } from 'react';
import { MultiSelect } from '@/components/ui/multi-select'; // You'll need to implement or import this
import { SkillsRadarCard } from './radarChart';
import MonthlySubmissionsChart from './submissionChart';
import RecentSubmissionsList from './submissionsList';
import TopicBreakdownChart from './topicBreakdown';
import { type RouterOutputs } from '@/trpc/shared';
import { FilterIcon } from 'lucide-react';
import { ConceptGraph } from './conceptGraph';
import posthog from 'posthog-js';

interface AnalyticsDashboardProps {
  conceptTracking: RouterOutputs["analytics"]["getConceptTracking"];
  submissions: RouterOutputs["analytics"]["getSubmissions"];
}

export function AnalyticsDashboard({ submissions, conceptTracking }: AnalyticsDashboardProps) {

  // Extract unique topics from submissions with their IDs
  const topics = submissions 
    ? Array.from(new Set(submissions.map(sub => sub.topicId)))
        .filter(Boolean)
        .map(id => {
          const submission = submissions.find(sub => sub.topicId === id);
          return {
            id,
            name: submission?.topic ?? ''
          };
        })
    : [];

  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);

  const filteredSubmissions = selectedTopicIds.length > 0
    ? submissions.filter(sub => sub.topicId && selectedTopicIds.includes(sub.topicId))
    : submissions;

  return (
    <>
      <div className="px-8 mb-8 flex flex-row gap-2 ml-auto justify-end">
        <FilterIcon className="w-4 h-4 my-auto" />
        <MultiSelect
          options={topics.map(topic => ({ label: topic.name, value: topic.id }))}
          value={selectedTopicIds}
          onValueChange={(value) => {
            setSelectedTopicIds(value)
            posthog.capture("analytics_topic_filter_changed");
          }}
          placeholder="Filter Topics"
          maxCount={2}
          className="w-full max-w-xl truncate"
        />
      </div>

      <div className="px-8 mb-8">
        <div className="flex flex-row gap-2 mb-4">
          <p className="text-lg font-medium">Skills</p>
        </div>
        <SkillsRadarCard submissions={filteredSubmissions} />
      </div>

      <div className="px-8 mb-8">
        <div className="flex flex-row gap-2 mb-4">
          <p className="text-lg font-medium">Engagement</p>
        </div>
        <div className="flex flex-row gap-4">
          <div className="w-3/5 h-[400px]">
            <MonthlySubmissionsChart submissions={filteredSubmissions} />
          </div>
          <div className="w-2/5 h-[400px]">
            <RecentSubmissionsList submissions={filteredSubmissions} />
          </div>
        </div>
      </div>

      <div className="px-8 mb-8">
        <div className="flex flex-row gap-2 mb-4">
          <p className="text-lg font-medium">Topic Breakdown</p>
        </div>
        <TopicBreakdownChart submissions={filteredSubmissions} />
      </div>

      <div className="px-8 mb-8">
        <div className="flex flex-row gap-2 mb-4">
          <p className="text-lg font-medium">Concept Graph</p>
        </div>
        <ConceptGraph 
          concepts={conceptTracking.concepts} 
          edges={conceptTracking.edges} 
          trackedConcepts={conceptTracking.trackedConcepts} 
          numberOfStudents={conceptTracking.numberOfStudents}
          selectedTopics={selectedTopicIds}/>
      </div>
    </>
  );
} 