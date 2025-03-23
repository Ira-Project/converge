"use client";
import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer
} from 'recharts';
import { type RouterOutputs } from '@/trpc/shared';
import { ActivityType } from '@/lib/constants';

export function SkillsRadarCard(props: {
  submissions: RouterOutputs["analytics"]["getSubmissions"]
}) {

  console.log(props.submissions);
  console.log(props.submissions.filter(sub => sub.activityType === ActivityType.StepSolve));

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

  const creativityScore = (reasonTraceAvg * 0.6) + (conceptMapAvg * 0.4);
  
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

  console.log(informationLiteracyScore);

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
    fullMark: 10,
  }));

  return (
    <div className="flex flex-col md:flex-row bg-white rounded-lg mx-auto border border-muted">
      {/* Left section with radar chart */}
      <div className="w-full md:w-3/5 p-4 flex items-center justify-center text-xs">
        <ResponsiveContainer height={"100%"}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
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
      
      {/* Right section with skill descriptions */}
      <div className="flex flex-col w-full md:w-2/5 p-6 my-auto justify-center space-y-4">
        {skillsData.map((skill, index) => (
          <p key={index} className="text-xs text-muted-foreground mb-2">
            <strong>{skill.name}</strong> - {skill.description}
          </p>
        ))}
      </div>
    </div>
  );
};