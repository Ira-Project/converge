/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from "..";
import { and, eq } from "drizzle-orm";
import { generateId } from "lucia";

import { courses, subjects, topics } from "../schema/subject";
import { emailsToPreload } from './emailsToPreload'
import { preloadedUsers } from "../schema/user";
import { ActivityType, Roles } from "@/lib/constants";
import { classrooms } from "../schema/classroom";
import { activity } from "../schema/activity";

import { createKnowledgeZapAssignment } from "./knowledge/knowledge-seed";
import { createStepSolveAssignment } from "./stepSolve/stepSolve-seed";
import { createReasoningAssignment } from "./reasoning/reasoning-seed";

async function createCoursesSubjectsAndTopics() {
  const list = [
    {
      name: "Mathematics",
      imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Math.svg",
      courses: [
        {
          name: "AP Statistics",
          topics: []
        },
        {
          name: "Algebra 1",
          topics: []
        },
        {
          name: "Algebra 2",
          topics: []
        },
        {
          name: "Geomery",
          topics: []
        },
        {
          name: "Precalculus",
          topics: []
        },
        {
          name: "Statistics",
          topics: []
        },
        {
          name: "Calculus A/B",
          topics: []
        },
        {
          name: "Calculus B/C",
          topics: []
        },
        {
          name: "IB DP Mathematics: Analysis and Approaches (SL)",
          topics: []
        },
        {
          name: "IB DP Mathematics: Analysis and Approaches (HL)",
          topics: []
        },
        {
          name: "IB DP Mathematics: Applications and Interpretation (SL)",
          topics: []
        },
        {
          name: "IB DP Mathematics: Applications and Interpretation (HL)",
          topics: []
        },
        {
          name: "IB MYP Standard Mathematics",
          topics: []
        },
        {
          name: "IB MYP Extended Mathematics",
          topics: []
        },
        {
          name: "Mathematics",
          topics: [
            {
              name: "Algebraic Expressions",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Algebraic+Expressions.png"
            },
            {
              name: "Quadratic Equations",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Quadratic+Equations.png"
            },
            {
              name: "Functions",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Functions.png"
            },
            {
              name: "Complex Numbers",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Complex+Numbers.png"
            },
            {
              name: "Trigonometry",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Trigonometry.png"
            },
            {
              name: "Limits and Continuity",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Limits+and+Continuity.png"
            },
            {
              name: "Differentiation",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Differentiation.png"
            },
            {
              name: "Integration",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Integration.png"
            },
            {
              name: "Probability",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Probability.png"
            },
            {
              name: "Distributions",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Distributions.png"
            }
          ]
        }
      ]
    },
    {
      name: "Physics",
      imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Physics.svg",
      courses: [
        {
          name: "AP Physics C: Electricity and Magnetism",
          topics: [
            {
              name: "Electric Charge",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Electric+Charge.png"
            },
          ]
        },
        {
          name: "AP Physics C: Mechanics",
          topics: []
        },
        {
          name: "AP Physics 1 - Algebra Based",
          topics: []
        },
        {
          name: "AP Physics 2: Algebra Based",
          topics: []
        },
        {
          name: "AP Physics C: Mechanics",
          topics: []
        },
        {
          name: "Physics",
          topics: [
            {
              name: "Kinematics",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Kinematics.png"
            },
            {
              name: "Forces and Momentum",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Forces+and+Momentum.png"
            },
            {
              name: "Work, Energy and Power",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Work%2C+Energy+and+Power.png"
            },
            {
              name: "Gravitational Fields",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Gravitational+Fields.png"
            },
            {
              name: "Electric Charge",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Electric+Charge.png"
            },
            {
              name: "Magnetic Fields",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Magnetic+Fields.png"
            },
            {
              name: "Thermal Energy Transfer",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Thermal+Energy+Transfer.png"
            },
            {
              name: "Gas Laws",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Gas+Laws.png"
            },
            {
              name: "Wave Model",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Wave+Model.png"
            },
            {
              name: "Wave Phenomena",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Wave+Phenomena.png"
            },
            {
              name: "Structure of the Atom",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Structure+of+the+Atom.png"
            },
          ]
        },
        {
          name: "Physics Standard",
          topics: []
        },
        {
          name: "Physics Honors",
          topics: []
        },
        {
          name: "IB Physics SL",
          topics: [
            {
              name: "Kinematics",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Kinematics.png"
            },
            {
              name: "Forces and Momentum",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Forces+and+Momentum.png"
            },
            {
              name: "Work, Energy and Power",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Work%2C+Energy+and+Power.png"
            },
            {
              name: "Gravitational Fields",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Gravitational+Fields.png"
            },
            {
              name: "Electric Charge",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Electric+Charge.png"
            },
            {
              name: "Magnetic Fields",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Magnetic+Fields.png"
            },
            {
              name: "Thermal Energy Transfer",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Thermal+Energy+Transfer.png"
            },
            {
              name: "Gas Laws",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Gas+Laws.png"
            },
            {
              name: "Wave Model",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Wave+Model.png"
            },
            {
              name: "Wave Phenomena",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Wave+Phenomena.png"
            },
            {
              name: "Structure of the Atom",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Structure+of+the+Atom.png"
            },
          ]
        },
        {
          name: "IB Physics HL",
          topics: []
        },
        {
          name: "Conceptual Physics (Regular C)",
          topics: []
        },
      ]
    },
    {
      name: "Chemistry",
      imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Chemistry.svg",
      courses: [
        {
          name: "Chemistry Standard",
          topics: []
        },
        {
          name: "Chemistry Honors",
          topics: []
        },
        {
          name: "IB Chemistry SL",
          topics: []
        },
        {
          name: "IB Chemistry HL",
          topics: []
        },
      ]
    },
    {
      name: "Biology",
      imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Biology.svg",
      courses: [
        {
          name: "Biology Standard",
          topics: []
        },
        {
          name: "Biology Honors",
          topics: []
        },
        {
          name: "IB Biology SL",
          topics: []
        },
        {
          name: "IB Biology HL",
          topics: []
        },
      ]
    }
  ]

  for (const subject of list) {

    const existingSubject = await db.selectDistinct().from(subjects).where(
      eq(subjects.name, subject.name),
    )

    let subjectId = generateId(21);

    if (existingSubject?.[0]?.id === undefined) {
      await db.insert(subjects).values({
        id: subjectId,
        name: subject.name,
      })
    } else {
      // Update fields if needed
      subjectId = existingSubject[0].id
    }
  

    for (const course of subject.courses) {
      
      const existingCourse = await db.selectDistinct().from(courses).where(
        and(
          eq(courses.name, course.name),
          eq(courses.subjectId, subjectId),
        )
      )

      let courseId = generateId(21);
      if (existingCourse?.[0]?.id === undefined) {
        await db.insert(courses).values({
          id: courseId,
          name: course.name,
          subjectId: subjectId,
        })
      } else {
        // Update fields if needed
        courseId = existingCourse[0].id
      }

      for (const topic of course.topics) {
        
        const existingTopic = await db.selectDistinct().from(topics).where(
          and(
            eq(topics.name, topic.name),
            eq(topics.courseId, courseId),
          )
        )

        if (existingTopic?.[0]?.id === undefined) {
          await db.insert(topics).values({
            id: generateId(21),
            name: topic.name,
            courseId: courseId,
            imageUrl: topic.imageUrl,
          });
        } else {
          // Update fields if needed
        }
      }
    }
    
  }
}

async function uploadPreloadedUsers() {
  for(const email of emailsToPreload) {
    await db.insert(preloadedUsers).values({
      id: generateId(21),
      email: email,
      role: Roles.Student,
    }).onConflictDoNothing({ target: preloadedUsers.email })
  }
}


const activityIdsDev: { topicId: string, assignmentId: string, name: string, type: ActivityType, order: number, points: number }[] = [
  // {    
  //   name: "Simple Harmonic Motion",
  //   type: ActivityType.KnowledgeZap,
  //   topicId: "QoUD52AFmibtZ7SGqIbmI",
  //   assignmentId: "888dtusghs9q8nbb21fg0",
  //   order: 0,
  //   points: 100
  // },
  // {    
  //   name: "Thermodynamics",
  //   type: ActivityType.KnowledgeZap,
  //   topicId: "6PPsDBZy9nMXjt6GeUcOp",
  //   assignmentId: "63qd53u5u7pnh8mol99e2",
  //   order: 0,
  //   points: 100
  // },
  // {
  //   name: "Thermodynamics",
  //   type: ActivityType.StepSolve,
  //   topicId: "6PPsDBZy9nMXjt6GeUcOp",
  //   assignmentId: "j0zffoobtgqnx80wvdgme",
  //   order: 0,
  //   points: 100
  // }
  // {    
  //   name: "Simple Harmonic Motion",
  //   type: ActivityType.StepSolve,
  //   topicId: "QoUD52AFmibtZ7SGqIbmI",
  //   assignmentId: "zht6mtsucv0uefplgetla",
  //   order: 0,
  //   points: 100
  // },
]

const activityIdsProd: { topicId: string, assignmentId: string, name: string, type: ActivityType, order: number, points: number }[] = [
  // {    
  //   name: "Simple Harmonic Motion",
  //   type: ActivityType.KnowledgeZap,
  //   topicId: "qY4JbQSoTts2eHzmUE9Gx",
  //   assignmentId: "qu3rnkdk84nesmbrow0ib",
  //   order: 0,
  //   points: 100
  // },
  // {    
  //   name: "Thermodynamics",
  //   type: ActivityType.KnowledgeZap,
  //   topicId: "jA5iZ5cKkLy1GIvdT30HQ",
  //   assignmentId: "o7yheiv6bl31sqm2dh726",
  //   order: 0,
  //   points: 100
  // },
  // {
  //   name: "Thermodynamics",
  //   type: ActivityType.StepSolve,
  //   topicId: "jA5iZ5cKkLy1GIvdT30HQ",
  //   assignmentId: "hzuya7pkj79wi2lcaci6d",
  //   order: 0,
  //   points: 100
  // }
  // {    
  //   name: "Simple Harmonic Motion",
  //   type: ActivityType.StepSolve,
  //   topicId: "qY4JbQSoTts2eHzmUE9Gx",
  //   assignmentId: "ycsgq3nbq24s53vv3e2t7",
  //   order: 0,
  //   points: 100
  // },
]


async function addActivitiesClassrooms(classroomId: string) {

  const classes = await db.select().from(classrooms).where(eq(classrooms.id, classroomId));

  const classroom = classes[0];

  if(!classroom) {
    throw new Error("Classroom not found");
  }

  const activityIds = process.env.ENVIRONMENT === "prod" ? activityIdsProd : activityIdsDev;

  for(const activityId of activityIds) {
    await db.insert(activity).values({
      id: generateId(21),
      name: activityId.name,
      type: activityId.type,
      assignmentId: activityId.assignmentId,
      order: activityId.order,
      points: activityId.points,
      classroomId: classroomId,
      topicId: activityId.topicId,
      createdBy: classroom.createdBy,
      isLive: false,
      isLocked: false,
    });
  }

}


const devClassrooms = [
  "8pify78tp9sjnn9f55ls0",
  "uldhld6cq0iqihr474cd4",
  "w1mn5uv1na85phrtcthyj",
]

const prodClassrooms = [
  "dyo82wqgtabd18x3wcqq8",
  "ijlzd5fim95uvrcq46qgr",
  "qskhg964cbzym6z30201b",
  "be98owll7hr706yw0686w",
  "off258ymh74kyefsd5ois",
]


const classroomsToAddActivities = process.env.ENVIRONMENT === "prod" ? prodClassrooms : devClassrooms;

for(const classroomId of classroomsToAddActivities) {
  await addActivitiesClassrooms(classroomId);
}

// await createKnowledgeZapAssignment();
// await createStepSolveAssignment();
//  await createReasoningAssignment();