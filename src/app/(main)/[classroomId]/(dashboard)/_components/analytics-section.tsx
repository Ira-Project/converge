import { SkillsRadarCard } from './radar-chart';
import { ConceptGraph } from './concept-graph';
import { api } from '@/trpc/server';

export async function AnalyticsSection(props: { classroomId: string }) {

  const submissions = await api.analytics.getSubmissions.query({ classroomId: props.classroomId })
  const conceptTracking = await api.analytics.getConceptTracking.query({ classroomId: props.classroomId })

  return (
    <div className="px-4 md:px-8">
      <p className="text-lg md:text-xl font-bold mb-3 md:mb-4">
        Data Insights
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-4 md:gap-6 lg:gap-8">
        <SkillsRadarCard submissions={submissions} />
        <ConceptGraph 
          concepts={conceptTracking.concepts} 
          edges={conceptTracking.edges} 
          trackedConcepts={conceptTracking.trackedConcepts} 
          numberOfStudents={conceptTracking.numberOfStudents} />
      </div>
    </div>
  );
} 