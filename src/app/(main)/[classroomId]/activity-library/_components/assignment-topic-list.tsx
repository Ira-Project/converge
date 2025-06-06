'use client';

import { useState, useEffect } from 'react';
import AssignmentTopicSection from './assignment-topic-section';
import { type Roles } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useHashNavigation } from '@/lib/utils';
import { type AssignmentTopic } from '../types';

interface AssignmentTopicListProps {
  topics: AssignmentTopic[];
  role: Roles;
  classroomId: string;
}

export default function AssignmentTopicList({ topics, role, classroomId }: AssignmentTopicListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTopics = topics.filter((topic) =>
    topic.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    // Set up hash navigation and return the cleanup function
    // Stop 100 pixels above the intended target
    return useHashNavigation([topics], 200);
  }, [topics]);

  return (
    <div className="w-full">
      <div className="mb-6 ml-auto flex flex-row max-w-lg">
        <Search className="w-4 h-4 mr-2 my-auto" />
        <Input
          type="text"
          placeholder="Search topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="flex flex-col gap-8">
        {filteredTopics.map((topic) => (
          <div key={topic.slug}>
            <AssignmentTopicSection 
              topic={topic} 
              role={role} 
              classroomId={classroomId}
            />
          </div>
        ))}
      </div>
    </div>
  );
} 