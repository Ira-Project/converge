"use client";
import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  PolarRadiusAxis
} from 'recharts';
import { type RouterOutputs } from '@/trpc/shared';
import { ActivityType } from '@/lib/constants';

export function SkillsRadarCard(props: {
  submissions: RouterOutputs["analytics"]["getSubmissions"]
}) {

  // Calculate Memory score from knowledge zap submissions
  const memoryScore = props.submissions
    .filter(sub => sub.activityType === ActivityType.KnowledgeZap)
    .reduce((acc, sub) => acc + sub.score, 0) / props.submissions.filter(sub => sub.activityType === ActivityType.KnowledgeZap).length;

  // Calculate Creativity score using weighted average of ReasonTrace and ConceptMapping
  const reasonTraceScores = props.submissions
    .filter(sub => sub.activityType === ActivityType.ReasonTrace)
    .map(sub => sub.score);
  const conceptMapScores = props.submissions
    .filter(sub => sub.activityType === ActivityType.ConceptMapping)
    .map(sub => sub.score);

  const reasonTraceAvg = reasonTraceScores.length > 0 
    ? reasonTraceScores.reduce((acc, score) => acc + score, 0) / reasonTraceScores.length 
    : 0;
  const conceptMapAvg = conceptMapScores.length > 0 
    ? conceptMapScores.reduce((acc, score) => acc + score, 0) / conceptMapScores.length 
    : 0;

  // Calculate creativity score based on available activities
  const creativityScore = reasonTraceScores.length === 0
    ? conceptMapAvg  // Only use concept mapping if no reason trace
    : conceptMapScores.length === 0
      ? reasonTraceAvg  // Only use reason trace if no concept mapping
      : (reasonTraceAvg * 0.6) + (conceptMapAvg * 0.4);  // Use weighted average if both exist
  
  // Calculate Communication score from Learn By Teaching submissions
  const communicationScore = props.submissions
    .filter(sub => sub.activityType === ActivityType.LearnByTeaching)
    .reduce((acc, sub) => acc + sub.score, 0) / props.submissions
    .filter(sub => sub.activityType === ActivityType.LearnByTeaching).length || 0;

  // Calculate Information Literacy score from Read and Relay submissions
  const informationLiteracyScore = props.submissions
    .filter(sub => sub.activityType === ActivityType.ReadAndRelay)
    .reduce((acc, sub) => acc + sub.score, 0) / props.submissions
    .filter(sub => sub.activityType === ActivityType.ReadAndRelay).length || 0;


  // Calculate Problem Solving score from StepSolve submissions
  const problemSolvingScore = props.submissions
    .filter(sub => sub.activityType === ActivityType.StepSolve)
    .reduce((acc, sub) => acc + sub.score, 0) / props.submissions
    .filter(sub => sub.activityType === ActivityType.StepSolve).length || 0;

  // Skills data with descriptions
  const skillsData = [
    {
      name: 'Memory',
      value: memoryScore,
      description: 'Memory helps retain and recall information for problem-solving. It\'s key to applying knowledge in new situations. Calculated from Knowledge Zap submissions.'
    },
    {
      name: 'Creativity',
      value: creativityScore,
      description: 'Creativity sparks innovation and new ideas. It helps adapt and find unique solutions to challenges. Calculated from Reason Trace and Concept Mapping submissions.'
    },
    {
      name: 'Communication',
      value: communicationScore,
      description: 'Clear communication is vital for sharing ideas and collaborating. It strengthens relationships and teamwork. Calculated from Learn By Teaching submissions.'
    },
    {
      name: 'Information Literacy',
      value: informationLiteracyScore,
      description: 'Information literacy allows people to evaluate and use data effectively. It\'s essential for making informed decisions. Calculated from Read and Relay submissions.'
    },
    {
      name: 'Problem Solving',
      value: problemSolvingScore,
      description: 'Problem-solving involves finding solutions to challenges. It\'s crucial for overcoming obstacles and improving outcomes. Calculated from StepSolve submissions.'
    },
  ];

  // Format data for radar chart
  const chartData = skillsData.map(skill => ({
    subject: skill.name,
    A: skill.value,
  }));

  return (
    <div className="flex flex-col bg-white rounded-lg mx-auto border p-4 w-full">
      {/* Left section with radar chart */}
      <p className="text-lg font-bold mb-4">
        Skills
      </p>
      <ResponsiveContainer width={"100%"} >
        <RadarChart outerRadius="70%" data={chartData}>
          <PolarGrid />
          <PolarAngleAxis 
            dataKey="subject"
            tick={{ fontSize: 10 }}
          />
          <PolarRadiusAxis 
            domain={[0, 10]} 
            tickCount={6}
            style={{ display: 'none' }}
          />
          <Radar
            name="Skills"
            dataKey="A"
            stroke="#E82D5C"
            fill="#E82D5C"
            fillOpacity={0.7}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};