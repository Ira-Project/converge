'use client';

import { useState, useEffect, useCallback } from 'react';
import AssignmentTopicSection from './assignment-topic-section';
import ActivityLibraryFilters from './activity-library-filters';
import { type Roles } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useHashNavigation } from '@/lib/utils';
import { type AssignmentTopic } from '../types';

interface Classroom {
  course?: {
    name: string;
    subject: {
      name: string;
    } | null;
  } | null;
  gradeText?: string | null;
}

interface AssignmentTopicListProps {
  topics: AssignmentTopic[];
  role: Roles;
  classroomId: string;
  classroom?: Classroom;
}

export default function AssignmentTopicList({ topics, role, classroomId, classroom }: AssignmentTopicListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTopics, setFilteredTopics] = useState<AssignmentTopic[]>(topics);

  // Handle filter changes from the filter component
  const handleFilterChange = useCallback((newFilteredTopics: AssignmentTopic[]) => {
    setFilteredTopics(newFilteredTopics);
  }, []);

  // Apply search filter on top of other filters
  const searchFilteredTopics = filteredTopics.filter((topic) =>
    topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.assignments.some(assignment => 
      assignment.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  useEffect(() => {
    // Set up hash navigation and return the cleanup function
    // Stop 100 pixels above the intended target
    return useHashNavigation([searchFilteredTopics], 200);
  }, [searchFilteredTopics]);

  return (
    <div className="w-full">
      {/* Search and Filters Side by Side */}
      <div className="mb-8 flex flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="flex flex-row items-center max-w-2xl min-w-[40%]">
          <Search className="w-4 h-4 mr-2" />
          <Input
            type="text"
            placeholder="Search topics and activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xl"
          />
        </div>

        {/* Filters */}
        <div className="flex-shrink-0 max-w-md">
          <ActivityLibraryFilters 
            topics={topics}
            classroom={classroom}
            onFilterChange={handleFilterChange}
          />
        </div>
      </div>

      {/* Topics */}
      <div className="flex flex-col gap-8">
        {searchFilteredTopics.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No activities found matching your criteria. Try adjusting your filters or search query.
            </p>
          </div>
        ) : (
          searchFilteredTopics.map((topic) => (
            <div key={topic.slug}>
              <AssignmentTopicSection 
                topic={topic} 
                role={role} 
                classroomId={classroomId}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
} 