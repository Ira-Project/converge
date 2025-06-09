'use client';

import { useState, useEffect } from 'react';
import TopicSection from './topic-section';
import { Roles, Paths } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useHashNavigation } from '@/lib/utils';
import { type Topic } from '../types';
import Link from 'next/link';

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

      {filteredTopics.length > 0 ? (
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
      ) : (
        <div className="flex items-center justify-center min-h-[300px] text-center w-3/4 mx-auto">
          {searchQuery ? (
            <p className="text-muted-foreground">
              No topics found matching "{searchQuery}". Try a different search term or check in our<Link href={`${Paths.Classroom}${classroomId}${Paths.ActivityLibrary}`} className="underline mx-1">activity library</Link>.
            </p>
          ) : role === Roles.Student ? (
            <p className="text-muted-foreground">No activities assigned</p>
          ) : (
            <p className="text-muted-foreground">
              <span>You haven't assigned any activities to your students. Choose from our</span>
              <Link href={`${Paths.Classroom}${classroomId}${Paths.ActivityLibrary}`} className="underline mx-1">
                activity library
              </Link>
              <span> to get started.</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
} 