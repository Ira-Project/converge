'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { MultiSelect } from '@/components/ui/multi-select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FilterIcon } from 'lucide-react';
import { type AssignmentTopic } from '../types';
import posthog from 'posthog-js';

interface Classroom {
  course?: {
    name: string;
    subject: {
      name: string;
    } | null;
  } | null;
  gradeText?: string | null;
}

interface ActivityLibraryFiltersProps {
  topics: AssignmentTopic[];
  classroom?: Classroom;
  onFilterChange: (filteredTopics: AssignmentTopic[]) => void;
}

export default function ActivityLibraryFilters({ topics, classroom, onFilterChange }: ActivityLibraryFiltersProps) {
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  // Extract unique options from assignments - memoized to prevent infinite re-renders
  const allCourses = useMemo(() => Array.from(
    new Map(
      topics.flatMap(topic => 
        topic.assignments.flatMap(assignment => 
          assignment.courses.map(course => [course.id, course])
        )
      )
    ).values()
  ), [topics]);

  const allGrades = useMemo(() => Array.from(
    new Set(
      topics.flatMap(topic => 
        topic.assignments.flatMap(assignment => assignment.grades)
      )
    )
  ).sort(), [topics]);

  const allSubjects = useMemo(() => Array.from(
    new Map(
      topics.flatMap(topic => 
        topic.assignments.flatMap(assignment => 
          assignment.subjects.map(subject => [subject.id, subject])
        )
      )
    ).values()
  ), [topics]);

  // Set default filters based on classroom details
  useEffect(() => {
    if (classroom && allCourses.length > 0 && allSubjects.length > 0) {
      const newCourses: string[] = [];
      const newGrades: string[] = [];
      const newSubjects: string[] = [];

      // Find matching course by name
      if (classroom.course?.name) {
        const matchingCourse = allCourses.find(course => course.name === classroom.course?.name);
        if (matchingCourse) {
          newCourses.push(matchingCourse.id);
        }
      }
      // Set grade filter
      if (classroom.gradeText) {
        newGrades.push(classroom.gradeText);
      }
      // Find matching subject by name
      if (classroom.course?.subject?.name) {
        const matchingSubject = allSubjects.find(subject => subject.name === classroom.course?.subject?.name);
        if (matchingSubject) {
          newSubjects.push(matchingSubject.id);
        }
      }

      // Only update state if values have changed to prevent unnecessary re-renders
      setSelectedCourses(prev => JSON.stringify(prev) !== JSON.stringify(newCourses) ? newCourses : prev);
      setSelectedGrades(prev => JSON.stringify(prev) !== JSON.stringify(newGrades) ? newGrades : prev);
      setSelectedSubjects(prev => JSON.stringify(prev) !== JSON.stringify(newSubjects) ? newSubjects : prev);
    }
  }, [classroom, allCourses, allSubjects]);

  // Memoize the filter function to prevent unnecessary re-renders
  const applyFilters = useCallback(() => {
    const filteredTopics = topics.map(topic => {
      const filteredAssignments = topic.assignments.filter(assignment => {
        // Check course filter
        const courseMatch = selectedCourses.length === 0 || 
          assignment.courses.some(course => selectedCourses.includes(course.id));

        // Check grade filter
        const gradeMatch = selectedGrades.length === 0 || 
          assignment.grades.some(grade => selectedGrades.includes(grade));

        // Check subject filter
        const subjectMatch = selectedSubjects.length === 0 || 
          assignment.subjects.some(subject => selectedSubjects.includes(subject.id));

        return courseMatch && gradeMatch && subjectMatch;
      });

      return {
        ...topic,
        assignments: filteredAssignments
      };
    }).filter(topic => topic.assignments.length > 0); // Only include topics with matching assignments

    onFilterChange(filteredTopics);
  }, [topics, selectedCourses, selectedGrades, selectedSubjects, onFilterChange]);

  // Apply filters whenever filter state changes
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <FilterIcon className="w-4 h-4" />
          Filters
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-4" align="start">
        <div className="space-y-4">
          <h4 className="font-medium leading-none">Filter Activities</h4>
          
          {/* Course Filter */}
          {allCourses.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Courses</label>
              <MultiSelect
                key={`courses-${selectedCourses.join(',')}`}
                options={allCourses.map(course => ({ label: course.name, value: course.id }))}
                defaultValue={selectedCourses}
                onValueChange={(value) => {
                  setSelectedCourses(value);
                  posthog.capture("activity_library_course_filter_changed");
                }}
                placeholder="Select courses"
                maxCount={2}
                className="w-full"
              />
            </div>
          )}

          {/* Grade Filter */}
          {allGrades.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Grades</label>
              <MultiSelect
                key={`grades-${selectedGrades.join(',')}`}
                options={allGrades.map(grade => ({ label: `Grade ${grade}`, value: grade }))}
                defaultValue={selectedGrades}
                onValueChange={(value) => {
                  setSelectedGrades(value);
                  posthog.capture("activity_library_grade_filter_changed");
                }}
                placeholder="Select grades"
                maxCount={2}
                className="w-full"
              />
            </div>
          )}

          {/* Subject Filter */}
          {allSubjects.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Subjects</label>
              <MultiSelect
                key={`subjects-${selectedSubjects.join(',')}`}
                options={allSubjects.map(subject => ({ label: subject.name, value: subject.id }))}
                defaultValue={selectedSubjects}
                onValueChange={(value) => {
                  setSelectedSubjects(value);
                  posthog.capture("activity_library_subject_filter_changed");
                }}
                placeholder="Select subjects"
                maxCount={2}
                className="w-full"
              />
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
} 