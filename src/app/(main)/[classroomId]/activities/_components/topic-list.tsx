'use client';

import { useState } from 'react';
import TopicSection from './topic-section';
import { type Roles } from '@/lib/constants';
import { Input } from '@/components/ui/input'; // Assuming you have this UI component
import { type Topic } from '../../types';
import { Search } from 'lucide-react';


interface TopicListProps {
  topics: Topic[];
  role: Roles;
  classroomId: string;
}

export default function TopicList({ topics, role, classroomId }: TopicListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTopics = topics.filter((topic) =>
    topic.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <TopicSection 
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