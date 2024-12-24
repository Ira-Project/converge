'use client';
import { Suspense } from "react";
import { AssignmentListSkeleton } from "./assignment-list-skeleton";
import { Roles } from "@/lib/constants";

import 'swiper/css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Mousewheel } from 'swiper/modules';
import { type RouterOutputs } from "@/trpc/shared";
import { AssignmentCard } from "./assignment-card";
import { UploadLessonPlanForm } from "./upload-lesson-plan-form";


export const AssignmentList = (
  { assignments, role } : 
  { assignments: RouterOutputs["explanationAssignment"]["list"], role: Roles }
) => {
  const { assignmentList, activeIndex } = assignments;  

  return (
    <div className="flex flex-col gap-8 max-h-full -translate-y-[20%] w-full z-0">
      {
        assignmentList.length === 0 
        ?
          <p className="text-muted-foreground">No ongoing assignments found</p>
        :
        <Suspense fallback={<AssignmentListSkeleton />} >
          <Swiper 
            initialSlide={activeIndex}
            shortSwipes={false}
            centeredSlides={true}
            slidesPerView={'auto'}
            direction={'vertical'}
            spaceBetween={20}
            effect={'coverflow'}
            coverflowEffect={{
              scale: 0.9,
              depth: 200,
              rotate: 0,
              slideShadows: false,
            }}
            mousewheel={true}
            modules={[Mousewheel, EffectCoverflow]}>
            {assignmentList.map((assignment) => (
              <SwiperSlide key={assignment.id}>
                <AssignmentCard 
                  role={role}
                  id={assignment.id}
                  isLocked={assignment.isLocked}
                  topic={assignment.topic.name}
                  dueDate={assignment.dueDate ?? undefined}
                  isLive={assignment.isLive}
                  imageUrl={assignment.topic.imageUrl ?? undefined} />
              </SwiperSlide>
            ))}
            <SwiperSlide>
              <div className="flex flex-col items-center justify-center h-60 p-10 mx-auto">
                {
                  role === Roles.Teacher ?
                  <div className="flex flex-col gap-2">
                    <p className="text-xl font-semibold">Don't See Your Topic?</p>
                    <p className="text-sm"> 
                      Upload your lesson plan or curriculum. We will create an assignment for you in the next 24 hours. 
                    </p>
                    <UploadLessonPlanForm />
                  </div>
                  :
                  <p className="text-muted-foreground">No more assignments</p>
                }
              </div>
            </SwiperSlide>
          </Swiper>
        </Suspense>
      }
    </div>
  );
}