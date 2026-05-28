CREATE TYPE "public"."activity_type" AS ENUM('Learn By Teaching', 'Reason Trace', 'Read and Relay', 'Knowledge Zap', 'Step Solve', 'Human vs AI');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('student', 'teacher');--> statement-breakpoint
CREATE TYPE "public"."handle_type" AS ENUM('source', 'target');--> statement-breakpoint
CREATE TYPE "public"."position" AS ENUM('top', 'right', 'bottom', 'left');--> statement-breakpoint
CREATE TYPE "public"."knowledge_zap_question_type" AS ENUM('multiple_choice', 'matching', 'ordering');--> statement-breakpoint
CREATE TABLE "ira_project_activity" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type_text" text,
	"assignment_id" varchar(21),
	"classroom_id" varchar(21),
	"is_live" boolean DEFAULT false NOT NULL,
	"is_locked" boolean DEFAULT false NOT NULL,
	"due_date" timestamp,
	"order" integer NOT NULL,
	"points" integer NOT NULL,
	"topic_id" varchar(21),
	"generated" boolean DEFAULT false NOT NULL,
	"created_by" varchar(21),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_activity_to_assignment" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"activity_id" varchar(21) NOT NULL,
	"knowledge_zap_assignment_id" varchar(21),
	"step_solve_assignment_id" varchar(21),
	"read_and_relay_assignment_id" varchar(21),
	"concept_mapping_assignment_id" varchar(21),
	"reason_trace_assignment_id" varchar(21),
	"learn_by_teaching_assignment_id" varchar(21),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_classrooms" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"course_id" varchar(21),
	"subject_id" varchar(21),
	"gradeText" varchar(50),
	"year" integer DEFAULT 2024 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"show_leaderboard_students" boolean DEFAULT false NOT NULL,
	"show_leaderboard_teachers" boolean DEFAULT false NOT NULL,
	"code" varchar(8) NOT NULL,
	"created_by" varchar(21),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"is_demo" boolean DEFAULT true NOT NULL,
	CONSTRAINT "ira_project_classrooms_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "ira_project_user_class_relations" (
	"user_id" varchar(21) NOT NULL,
	"classroom_id" varchar(21) NOT NULL,
	"role" "role" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "ira_project_user_class_relations_user_id_classroom_id_pk" PRIMARY KEY("user_id","classroom_id")
);
--> statement-breakpoint
CREATE TABLE "ira_project_concept_edges" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"concept_id" varchar(36),
	"related_concept_id" varchar(36),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_concept_tracking" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"is_correct" boolean NOT NULL,
	"concept_id" varchar(36),
	"user_id" varchar(21),
	"classroom_id" varchar(21),
	"activity_type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_concepts" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"answer_text" text,
	"formulas" text[],
	"generated" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" varchar(21),
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_concepts_to_courses" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"concept_id" varchar(36),
	"course_id" varchar(21),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_concepts_to_grades" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"concept_id" varchar(36),
	"grade" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_concepts_to_subjects" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"concept_id" varchar(36),
	"subject_id" varchar(21),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_concepts_to_topics" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"concept_id" varchar(36),
	"topic_id" varchar(21),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_concept_mapping_assignment_to_course" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"assignment_id" varchar(21) NOT NULL,
	"course_id" varchar(21) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_concept_mapping_assignment_to_grade" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"assignment_id" varchar(21) NOT NULL,
	"grade" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_concept_mapping_assignment_to_subject" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"assignment_id" varchar(21) NOT NULL,
	"subject_id" varchar(21) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_cm_assignments" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"name" text,
	"description" text,
	"top_text" text,
	"concept_map_width_to_height_ratio" double precision DEFAULT 2 NOT NULL,
	"percentage_edges_to_hide" double precision DEFAULT 0.5 NOT NULL,
	"percentage_nodes_to_hide" double precision DEFAULT 0.5 NOT NULL,
	"topic_id" varchar(21) NOT NULL,
	"order" integer,
	"generated" boolean DEFAULT false NOT NULL,
	"created_by" varchar(21),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_cm_attempt_edges" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"attempt_id" varchar(21),
	"map_attempt_id" varchar(21),
	"source_node_id" varchar(21),
	"target_node_id" varchar(21),
	"label" text,
	"is_correct" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_cm_attempt_nodes" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"attempt_id" varchar(21),
	"map_attempt_id" varchar(21),
	"node_id" varchar(21),
	"label" text,
	"is_correct" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"created_by" varchar(21)
);
--> statement-breakpoint
CREATE TABLE "ira_project_cm_attempts" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"activity_id" varchar(21),
	"assignment_id" varchar(21),
	"score" double precision,
	"accuracy" double precision,
	"submitted_at" timestamp,
	"user_id" varchar(21) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_cm_map_attempts" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"attempt_id" varchar(21),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"is_correct" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ira_project_cm_edges" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"always_visible" boolean DEFAULT false NOT NULL,
	"source_node_id" varchar(21),
	"target_node_id" varchar(21),
	"source_handle_id" varchar(21),
	"target_handle_id" varchar(21),
	"assignment_id" varchar(21) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_cm_node_handles" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"position" "position" NOT NULL,
	"node_id" varchar(21),
	"type" "handle_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_cm_nodes" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"x" double precision NOT NULL,
	"y" double precision NOT NULL,
	"assignment_id" varchar(21) NOT NULL,
	"always_visible" boolean DEFAULT false NOT NULL,
	"label" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_knowledge_zap_assignment_attempts" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"assignment_id" varchar(21),
	"activity_id" varchar(21),
	"is_revision" boolean DEFAULT false NOT NULL,
	"score" double precision,
	"questions_completed" integer,
	"total_attempts" integer,
	"submitted_at" timestamp,
	"user_id" varchar(21),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_knowledge_zap_assignment_to_course" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"assignment_id" varchar(21) NOT NULL,
	"course_id" varchar(21) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_knowledge_zap_assignment_to_grade" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"assignment_id" varchar(21) NOT NULL,
	"grade" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_knowledge_zap_assignment_to_subject" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"assignment_id" varchar(21) NOT NULL,
	"subject_id" varchar(21) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_knowledge_zap_assignments" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"name" text,
	"description" text,
	"topic_id" varchar(21) NOT NULL,
	"order" integer,
	"generated" boolean DEFAULT false NOT NULL,
	"created_by" varchar(21),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"is_latest" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ira_project_knowledge_zap_question_attempts" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"question_id" varchar(21) NOT NULL,
	"attempt_id" varchar(21) NOT NULL,
	"is_correct" boolean NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_knowledge_zap_question_report" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"question_id" varchar(21) NOT NULL,
	"type" "knowledge_zap_question_type" NOT NULL,
	"report" text NOT NULL,
	"user_id" varchar(21) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_knowledge_zap_question_to_assignment" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"order" integer,
	"question_id" varchar(21) NOT NULL,
	"assignment_id" varchar(21) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_knowledge_zap_questions" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"question" text NOT NULL,
	"question_id" varchar(21)[],
	"type" "knowledge_zap_question_type" NOT NULL,
	"topic_id" varchar(21),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_knowledge_zap_questions_to_concepts" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"question_id" varchar(21) NOT NULL,
	"concept_id" varchar(36) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_matching_answer_options" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"question_id" varchar(21) NOT NULL,
	"option_a" text NOT NULL,
	"option_b" text NOT NULL,
	"image_url_a" text,
	"image_url_b" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_matching_attempts" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"question_attempt_id" varchar(21) NOT NULL,
	"question_id" varchar(21) NOT NULL,
	"is_correct" boolean NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_matching_attempt_selection" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"attempt_id" varchar(21) NOT NULL,
	"option_1_id" varchar(21) NOT NULL,
	"option_2_id" varchar(21) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_matching_questions" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"question" text NOT NULL,
	"image_url" text,
	"question_id" varchar(21) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_multiple_choice_answer_options" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"question_id" varchar(21) NOT NULL,
	"option" text NOT NULL,
	"image_url" text,
	"is_correct" boolean NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_multiple_choice_attempts" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"question_attempt_id" varchar(21) NOT NULL,
	"question_id" varchar(21) NOT NULL,
	"option_id" varchar(21) NOT NULL,
	"is_correct" boolean NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_multiple_choice_questions" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"question" text NOT NULL,
	"image_url" text,
	"question_id" varchar(21) NOT NULL,
	"multiple_correct" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_ordering_answer_options" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"question_id" varchar(21) NOT NULL,
	"option" text NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_ordering_attempts" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"question_attempt_id" varchar(21) NOT NULL,
	"question_id" varchar(21) NOT NULL,
	"is_correct" boolean NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_ordering_attempt_selection" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"attempt_id" varchar(21) NOT NULL,
	"option_id" varchar(21) NOT NULL,
	"order" integer NOT NULL,
	"is_correct" boolean NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_ordering_questions" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"question" text NOT NULL,
	"question_id" varchar(21) NOT NULL,
	"top_label" text DEFAULT 'Smallest' NOT NULL,
	"bottom_label" text DEFAULT 'Biggest' NOT NULL,
	"is_descending" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_explain_assignment_to_course" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"assignment_id" varchar(21) NOT NULL,
	"course_id" varchar(21) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_explain_assignment_to_grade" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"assignment_id" varchar(21) NOT NULL,
	"grade" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_explain_assignment_to_subject" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"assignment_id" varchar(21) NOT NULL,
	"subject_id" varchar(21) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_explain_assignments" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"name" text,
	"description" text,
	"topic_id" varchar(21) NOT NULL,
	"order" integer,
	"show_concepts" boolean DEFAULT false NOT NULL,
	"show_answers" boolean DEFAULT true NOT NULL,
	"generated" boolean DEFAULT false NOT NULL,
	"created_by" varchar(21),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_explain_answers" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"question_id" varchar(21),
	"answer" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_explain_question_concepts" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"question_id" varchar(21),
	"concept_id" varchar(36),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_explain_question_to_assignment" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"order" integer,
	"question_id" varchar(21) NOT NULL,
	"assignment_id" varchar(21) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_explain_questions" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"question" text NOT NULL,
	"lambda_url" text NOT NULL,
	"image" text,
	"topic_id" varchar(21),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_explain_test_attempts" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"activity_id" varchar(21),
	"assignment_id" varchar(21),
	"score" integer,
	"score2" double precision,
	"average_score" double precision,
	"submitted_at" timestamp,
	"user_id" varchar(21) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_explain_computed_answers" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"explanation_id" varchar(21) NOT NULL,
	"question_id" varchar(21) NOT NULL,
	"computed_answer" text NOT NULL,
	"is_correct" boolean DEFAULT false NOT NULL,
	"explanation_text" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_explanation" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"formula" text,
	"test_attempt_id" varchar(21),
	"created_by" varchar(21) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_lesson_plan_files" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"skills" text[] DEFAULT '{}' NOT NULL,
	"url" text,
	"created_by" varchar(21),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_read_and_relay_assignment_to_course" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"assignment_id" varchar(21) NOT NULL,
	"course_id" varchar(21) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_read_and_relay_assignment_to_grade" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"assignment_id" varchar(21) NOT NULL,
	"grade" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_read_and_relay_assignment_to_subject" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"assignment_id" varchar(21) NOT NULL,
	"subject_id" varchar(21) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_rr_assignments" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"name" text,
	"description" text,
	"reading_passage" text,
	"max_number_of_highlights" integer DEFAULT 5 NOT NULL,
	"max_number_of_formulas" integer DEFAULT 3 NOT NULL,
	"max_highlight_length" integer DEFAULT 200 NOT NULL,
	"max_formula_length" integer DEFAULT 200 NOT NULL,
	"topic_id" varchar(21) NOT NULL,
	"order" integer,
	"show_answers" boolean DEFAULT true NOT NULL,
	"generated" boolean DEFAULT false NOT NULL,
	"created_by" varchar(21),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_rr_attempts" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"activity_id" varchar(21),
	"assignment_id" varchar(21),
	"score" double precision,
	"accuracy" double precision,
	"submitted_at" timestamp,
	"user_id" varchar(21) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_rr_cheat_sheets" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"attempt_id" varchar(21),
	"highlights" text[],
	"formulas" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"created_by" varchar(21)
);
--> statement-breakpoint
CREATE TABLE "ira_project_rr_computed_answers" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"cheatsheet_id" varchar(21),
	"question_id" varchar(21),
	"answer" text,
	"is_correct" boolean DEFAULT false NOT NULL,
	"working_text" text,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_rr_answers" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"question_id" varchar(21),
	"answer" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_rr_question_to_assignment" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"order" integer,
	"question_id" varchar(21) NOT NULL,
	"assignment_id" varchar(21) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_rr_questions" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"question" text NOT NULL,
	"lambda_url" text NOT NULL,
	"image" text,
	"topic_id" varchar(21),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_reasoning_assignment_attempts" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"assignment_id" varchar(21),
	"activity_id" varchar(21),
	"score" double precision,
	"accuracy" double precision,
	"submitted_at" timestamp,
	"user_id" varchar(21),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_reasoning_assignment_to_course" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"assignment_id" varchar(21) NOT NULL,
	"course_id" varchar(21) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_reasoning_assignment_to_grade" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"assignment_id" varchar(21) NOT NULL,
	"grade" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_reasoning_assignment_to_subject" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"assignment_id" varchar(21) NOT NULL,
	"subject_id" varchar(21) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_reasoning_assignments" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"name" text,
	"description" text,
	"topic_id" varchar(21) NOT NULL,
	"order" integer,
	"generated" boolean DEFAULT false NOT NULL,
	"created_by" varchar(21),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_reasoning_assignment_question_final_answer" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"attempt_id" varchar(21),
	"question_id" varchar(21),
	"answer" text NOT NULL,
	"is_correct" boolean NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_reasoning_assignment_question_answers" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"attempt_id" varchar(21),
	"reasoning_option_id" varchar(21),
	"step" integer NOT NULL,
	"is_correct" boolean,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_reasoning_assignment_question_attempts" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"part" integer DEFAULT 1 NOT NULL,
	"attempt_id" varchar(21),
	"correct" boolean DEFAULT false NOT NULL,
	"question_id" varchar(21),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_reasoning_answer_options" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"question_id" varchar(21),
	"option_text" text NOT NULL,
	"option_image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_reasoning_pathway" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"question_id" varchar(21),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_reasoning_pathway_step" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"pathway_id" varchar(21),
	"answer_option_id" varchar(21) NOT NULL,
	"step_number" integer NOT NULL,
	"step_number_list" integer[],
	"is_correct" boolean NOT NULL,
	"replacement_option_id" varchar(21),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_reasoning_question_to_assignment" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"order" integer,
	"question_id" varchar(21) NOT NULL,
	"assignment_id" varchar(21) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_reasoning_questions" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"top_text" text,
	"top_image" text,
	"question" text,
	"image" text,
	"answer" text,
	"answer_image" text,
	"number_of_steps" integer NOT NULL,
	"correct_answers" text[] DEFAULT '{}'::text[] NOT NULL,
	"correct_answers_unit" text,
	"topic_id" varchar(21),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_step_solve_assignment_attempts" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"assignment_id" varchar(21),
	"activity_id" varchar(21),
	"score" double precision,
	"is_revision" boolean DEFAULT false NOT NULL,
	"reasoning_score" double precision,
	"evaluation_score" double precision,
	"steps_completed" integer,
	"steps_total" integer,
	"completion_rate" double precision,
	"submitted_at" timestamp,
	"user_id" varchar(21),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_step_solve_assignment_template_to_course" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"template_id" varchar(21) NOT NULL,
	"course_id" varchar(21) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_step_solve_assignment_template_to_grade" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"template_id" varchar(21) NOT NULL,
	"grade" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_step_solve_assignment_template_to_subject" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"template_id" varchar(21) NOT NULL,
	"subject_id" varchar(21) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_step_solve_assignment_templates" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"name" text,
	"description" text,
	"assignment_ids" varchar(21)[] NOT NULL,
	"topic_id" varchar(21) NOT NULL,
	"order" integer,
	"generated" boolean DEFAULT false NOT NULL,
	"created_by" varchar(21),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_step_solve_assignments" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"name" text,
	"description" text,
	"template_id" varchar(21),
	"topic_id" varchar(21) NOT NULL,
	"order" integer,
	"generated" boolean DEFAULT false NOT NULL,
	"created_by" varchar(21),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_step_solve_question_attempt_steps" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"question_attempt_id" varchar(21) NOT NULL,
	"step_solve_step_id" varchar(21) NOT NULL,
	"answer" text,
	"step_solve_step_option_id" varchar(21),
	"is_correct" boolean,
	"reasoning_correct" boolean,
	"evaluation_correct" boolean,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_step_solve_question_attempts" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"attempt_id" varchar(21),
	"correct" boolean DEFAULT false NOT NULL,
	"score" double precision,
	"steps_completed" integer,
	"reasoning_score" double precision,
	"evaluation_score" double precision,
	"question_id" varchar(21) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_step_solve_question_to_assignment" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"order" integer,
	"question_id" varchar(21) NOT NULL,
	"assignment_id" varchar(21) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_step_solve_questions" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"question" text NOT NULL,
	"image" text,
	"topic_id" varchar(21),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_step_solve_step" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"question_id" varchar(21),
	"step_text" text NOT NULL,
	"step_text_part2" text,
	"step_image" text,
	"step_number" integer NOT NULL,
	"step_solve_answer" text[],
	"step_solve_answer_units" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_step_solve_step_concepts" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"step_id" varchar(21),
	"concept_id" varchar(36),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_step_solve_step_options" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"step_id" varchar(21),
	"option_text" text NOT NULL,
	"option_image" text,
	"is_correct" boolean NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_step_solve_step_report" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"step_id" varchar(21) NOT NULL,
	"report" text NOT NULL,
	"user_id" varchar(21) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_courses" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"locked" boolean DEFAULT false NOT NULL,
	"subject_id" varchar(21),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_subjects" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"image_url" text,
	"locked" boolean DEFAULT false NOT NULL,
	"demo_classroom_id" varchar(21),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ira_project_topics" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"order" text,
	"image_url" text,
	"course_id" varchar(21),
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"slug" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ira_project_email_verification_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(21) NOT NULL,
	"email" varchar(255) NOT NULL,
	"code" varchar(8) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "ira_project_email_verification_codes_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "ira_project_password_reset_tokens" (
	"id" varchar(40) PRIMARY KEY NOT NULL,
	"user_id" varchar(21) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ira_project_preloaded_users" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"not_onboarded" boolean DEFAULT true NOT NULL,
	"role" "role" DEFAULT 'student' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "ira_project_preloaded_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "ira_project_sessions" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(21) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ira_project_teacher_courses" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"user_id" varchar(21) NOT NULL,
	"course_id" varchar(21) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ira_project_teacher_grades" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"user_id" varchar(21) NOT NULL,
	"grade" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ira_project_teacher_subjects" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"user_id" varchar(21) NOT NULL,
	"subject_id" varchar(21) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ira_project_users" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"role" "role" DEFAULT 'student' NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"hashed_password" varchar(255),
	"avatar" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"is_onboarded" boolean DEFAULT false NOT NULL,
	"default_classroom_id" varchar(21),
	CONSTRAINT "ira_project_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "ira_project_actions" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"channel_id" varchar(21) NOT NULL,
	"actionType" varchar NOT NULL,
	"payload" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"explanation_id" text,
	"explanation" text,
	"working" text
);
--> statement-breakpoint
ALTER TABLE "ira_project_activity" ADD CONSTRAINT "ira_project_activity_classroom_id_ira_project_classrooms_id_fk" FOREIGN KEY ("classroom_id") REFERENCES "public"."ira_project_classrooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_activity" ADD CONSTRAINT "ira_project_activity_topic_id_ira_project_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."ira_project_topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_activity" ADD CONSTRAINT "ira_project_activity_created_by_ira_project_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."ira_project_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_activity_to_assignment" ADD CONSTRAINT "ira_project_activity_to_assignment_activity_id_ira_project_activity_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."ira_project_activity"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_activity_to_assignment" ADD CONSTRAINT "ira_project_activity_to_assignment_knowledge_zap_assignment_id_ira_project_knowledge_zap_assignments_id_fk" FOREIGN KEY ("knowledge_zap_assignment_id") REFERENCES "public"."ira_project_knowledge_zap_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_activity_to_assignment" ADD CONSTRAINT "ira_project_activity_to_assignment_step_solve_assignment_id_ira_project_step_solve_assignments_id_fk" FOREIGN KEY ("step_solve_assignment_id") REFERENCES "public"."ira_project_step_solve_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_activity_to_assignment" ADD CONSTRAINT "ira_project_activity_to_assignment_read_and_relay_assignment_id_ira_project_rr_assignments_id_fk" FOREIGN KEY ("read_and_relay_assignment_id") REFERENCES "public"."ira_project_rr_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_activity_to_assignment" ADD CONSTRAINT "ira_project_activity_to_assignment_concept_mapping_assignment_id_ira_project_cm_assignments_id_fk" FOREIGN KEY ("concept_mapping_assignment_id") REFERENCES "public"."ira_project_cm_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_activity_to_assignment" ADD CONSTRAINT "ira_project_activity_to_assignment_reason_trace_assignment_id_ira_project_reasoning_assignments_id_fk" FOREIGN KEY ("reason_trace_assignment_id") REFERENCES "public"."ira_project_reasoning_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_activity_to_assignment" ADD CONSTRAINT "ira_project_activity_to_assignment_learn_by_teaching_assignment_id_ira_project_explain_assignments_id_fk" FOREIGN KEY ("learn_by_teaching_assignment_id") REFERENCES "public"."ira_project_explain_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_classrooms" ADD CONSTRAINT "ira_project_classrooms_course_id_ira_project_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."ira_project_courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_classrooms" ADD CONSTRAINT "ira_project_classrooms_subject_id_ira_project_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."ira_project_subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_classrooms" ADD CONSTRAINT "ira_project_classrooms_created_by_ira_project_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."ira_project_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_user_class_relations" ADD CONSTRAINT "ira_project_user_class_relations_user_id_ira_project_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."ira_project_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_user_class_relations" ADD CONSTRAINT "ira_project_user_class_relations_classroom_id_ira_project_classrooms_id_fk" FOREIGN KEY ("classroom_id") REFERENCES "public"."ira_project_classrooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_concept_edges" ADD CONSTRAINT "ira_project_concept_edges_concept_id_ira_project_concepts_id_fk" FOREIGN KEY ("concept_id") REFERENCES "public"."ira_project_concepts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_concept_edges" ADD CONSTRAINT "ira_project_concept_edges_related_concept_id_ira_project_concepts_id_fk" FOREIGN KEY ("related_concept_id") REFERENCES "public"."ira_project_concepts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_concept_tracking" ADD CONSTRAINT "ira_project_concept_tracking_concept_id_ira_project_concepts_id_fk" FOREIGN KEY ("concept_id") REFERENCES "public"."ira_project_concepts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_concept_tracking" ADD CONSTRAINT "ira_project_concept_tracking_user_id_ira_project_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."ira_project_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_concept_tracking" ADD CONSTRAINT "ira_project_concept_tracking_classroom_id_ira_project_classrooms_id_fk" FOREIGN KEY ("classroom_id") REFERENCES "public"."ira_project_classrooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_concepts" ADD CONSTRAINT "ira_project_concepts_created_by_ira_project_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."ira_project_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_concepts_to_courses" ADD CONSTRAINT "ira_project_concepts_to_courses_concept_id_ira_project_concepts_id_fk" FOREIGN KEY ("concept_id") REFERENCES "public"."ira_project_concepts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_concepts_to_courses" ADD CONSTRAINT "ira_project_concepts_to_courses_course_id_ira_project_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."ira_project_courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_concepts_to_grades" ADD CONSTRAINT "ira_project_concepts_to_grades_concept_id_ira_project_concepts_id_fk" FOREIGN KEY ("concept_id") REFERENCES "public"."ira_project_concepts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_concepts_to_subjects" ADD CONSTRAINT "ira_project_concepts_to_subjects_concept_id_ira_project_concepts_id_fk" FOREIGN KEY ("concept_id") REFERENCES "public"."ira_project_concepts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_concepts_to_subjects" ADD CONSTRAINT "ira_project_concepts_to_subjects_subject_id_ira_project_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."ira_project_subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_concepts_to_topics" ADD CONSTRAINT "ira_project_concepts_to_topics_concept_id_ira_project_concepts_id_fk" FOREIGN KEY ("concept_id") REFERENCES "public"."ira_project_concepts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_concepts_to_topics" ADD CONSTRAINT "ira_project_concepts_to_topics_topic_id_ira_project_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."ira_project_topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_concept_mapping_assignment_to_course" ADD CONSTRAINT "ira_project_concept_mapping_assignment_to_course_assignment_id_ira_project_cm_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."ira_project_cm_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_concept_mapping_assignment_to_course" ADD CONSTRAINT "ira_project_concept_mapping_assignment_to_course_course_id_ira_project_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."ira_project_courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_concept_mapping_assignment_to_grade" ADD CONSTRAINT "ira_project_concept_mapping_assignment_to_grade_assignment_id_ira_project_cm_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."ira_project_cm_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_concept_mapping_assignment_to_subject" ADD CONSTRAINT "ira_project_concept_mapping_assignment_to_subject_assignment_id_ira_project_cm_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."ira_project_cm_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_concept_mapping_assignment_to_subject" ADD CONSTRAINT "ira_project_concept_mapping_assignment_to_subject_subject_id_ira_project_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."ira_project_subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_cm_assignments" ADD CONSTRAINT "ira_project_cm_assignments_topic_id_ira_project_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."ira_project_topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_cm_assignments" ADD CONSTRAINT "ira_project_cm_assignments_created_by_ira_project_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."ira_project_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_cm_attempt_edges" ADD CONSTRAINT "ira_project_cm_attempt_edges_attempt_id_ira_project_cm_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."ira_project_cm_attempts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_cm_attempt_edges" ADD CONSTRAINT "ira_project_cm_attempt_edges_map_attempt_id_ira_project_cm_map_attempts_id_fk" FOREIGN KEY ("map_attempt_id") REFERENCES "public"."ira_project_cm_map_attempts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_cm_attempt_edges" ADD CONSTRAINT "ira_project_cm_attempt_edges_source_node_id_ira_project_cm_nodes_id_fk" FOREIGN KEY ("source_node_id") REFERENCES "public"."ira_project_cm_nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_cm_attempt_edges" ADD CONSTRAINT "ira_project_cm_attempt_edges_target_node_id_ira_project_cm_nodes_id_fk" FOREIGN KEY ("target_node_id") REFERENCES "public"."ira_project_cm_nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_cm_attempt_nodes" ADD CONSTRAINT "ira_project_cm_attempt_nodes_attempt_id_ira_project_cm_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."ira_project_cm_attempts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_cm_attempt_nodes" ADD CONSTRAINT "ira_project_cm_attempt_nodes_map_attempt_id_ira_project_cm_map_attempts_id_fk" FOREIGN KEY ("map_attempt_id") REFERENCES "public"."ira_project_cm_map_attempts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_cm_attempt_nodes" ADD CONSTRAINT "ira_project_cm_attempt_nodes_node_id_ira_project_cm_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."ira_project_cm_nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_cm_attempt_nodes" ADD CONSTRAINT "ira_project_cm_attempt_nodes_created_by_ira_project_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."ira_project_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_cm_attempts" ADD CONSTRAINT "ira_project_cm_attempts_activity_id_ira_project_activity_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."ira_project_activity"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_cm_attempts" ADD CONSTRAINT "ira_project_cm_attempts_assignment_id_ira_project_cm_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."ira_project_cm_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_cm_attempts" ADD CONSTRAINT "ira_project_cm_attempts_user_id_ira_project_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."ira_project_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_cm_map_attempts" ADD CONSTRAINT "ira_project_cm_map_attempts_attempt_id_ira_project_cm_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."ira_project_cm_attempts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_cm_edges" ADD CONSTRAINT "ira_project_cm_edges_source_node_id_ira_project_cm_nodes_id_fk" FOREIGN KEY ("source_node_id") REFERENCES "public"."ira_project_cm_nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_cm_edges" ADD CONSTRAINT "ira_project_cm_edges_target_node_id_ira_project_cm_nodes_id_fk" FOREIGN KEY ("target_node_id") REFERENCES "public"."ira_project_cm_nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_cm_edges" ADD CONSTRAINT "ira_project_cm_edges_source_handle_id_ira_project_cm_node_handles_id_fk" FOREIGN KEY ("source_handle_id") REFERENCES "public"."ira_project_cm_node_handles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_cm_edges" ADD CONSTRAINT "ira_project_cm_edges_target_handle_id_ira_project_cm_node_handles_id_fk" FOREIGN KEY ("target_handle_id") REFERENCES "public"."ira_project_cm_node_handles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_cm_edges" ADD CONSTRAINT "ira_project_cm_edges_assignment_id_ira_project_cm_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."ira_project_cm_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_cm_node_handles" ADD CONSTRAINT "ira_project_cm_node_handles_node_id_ira_project_cm_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."ira_project_cm_nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_cm_nodes" ADD CONSTRAINT "ira_project_cm_nodes_assignment_id_ira_project_cm_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."ira_project_cm_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_knowledge_zap_assignment_attempts" ADD CONSTRAINT "ira_project_knowledge_zap_assignment_attempts_assignment_id_ira_project_knowledge_zap_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."ira_project_knowledge_zap_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_knowledge_zap_assignment_attempts" ADD CONSTRAINT "ira_project_knowledge_zap_assignment_attempts_activity_id_ira_project_activity_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."ira_project_activity"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_knowledge_zap_assignment_attempts" ADD CONSTRAINT "ira_project_knowledge_zap_assignment_attempts_user_id_ira_project_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."ira_project_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_knowledge_zap_assignment_to_course" ADD CONSTRAINT "ira_project_knowledge_zap_assignment_to_course_assignment_id_ira_project_knowledge_zap_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."ira_project_knowledge_zap_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_knowledge_zap_assignment_to_course" ADD CONSTRAINT "ira_project_knowledge_zap_assignment_to_course_course_id_ira_project_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."ira_project_courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_knowledge_zap_assignment_to_grade" ADD CONSTRAINT "ira_project_knowledge_zap_assignment_to_grade_assignment_id_ira_project_knowledge_zap_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."ira_project_knowledge_zap_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_knowledge_zap_assignment_to_subject" ADD CONSTRAINT "ira_project_knowledge_zap_assignment_to_subject_assignment_id_ira_project_knowledge_zap_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."ira_project_knowledge_zap_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_knowledge_zap_assignment_to_subject" ADD CONSTRAINT "ira_project_knowledge_zap_assignment_to_subject_subject_id_ira_project_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."ira_project_subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_knowledge_zap_assignments" ADD CONSTRAINT "ira_project_knowledge_zap_assignments_topic_id_ira_project_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."ira_project_topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_knowledge_zap_assignments" ADD CONSTRAINT "ira_project_knowledge_zap_assignments_created_by_ira_project_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."ira_project_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_knowledge_zap_question_attempts" ADD CONSTRAINT "ira_project_knowledge_zap_question_attempts_question_id_ira_project_knowledge_zap_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."ira_project_knowledge_zap_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_knowledge_zap_question_attempts" ADD CONSTRAINT "ira_project_knowledge_zap_question_attempts_attempt_id_ira_project_knowledge_zap_assignment_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."ira_project_knowledge_zap_assignment_attempts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_knowledge_zap_question_report" ADD CONSTRAINT "ira_project_knowledge_zap_question_report_user_id_ira_project_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."ira_project_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_knowledge_zap_question_to_assignment" ADD CONSTRAINT "ira_project_knowledge_zap_question_to_assignment_question_id_ira_project_knowledge_zap_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."ira_project_knowledge_zap_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_knowledge_zap_question_to_assignment" ADD CONSTRAINT "ira_project_knowledge_zap_question_to_assignment_assignment_id_ira_project_knowledge_zap_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."ira_project_knowledge_zap_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_knowledge_zap_questions" ADD CONSTRAINT "ira_project_knowledge_zap_questions_topic_id_ira_project_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."ira_project_topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_knowledge_zap_questions_to_concepts" ADD CONSTRAINT "ira_project_knowledge_zap_questions_to_concepts_question_id_ira_project_knowledge_zap_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."ira_project_knowledge_zap_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_knowledge_zap_questions_to_concepts" ADD CONSTRAINT "ira_project_knowledge_zap_questions_to_concepts_concept_id_ira_project_concepts_id_fk" FOREIGN KEY ("concept_id") REFERENCES "public"."ira_project_concepts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_matching_answer_options" ADD CONSTRAINT "ira_project_matching_answer_options_question_id_ira_project_matching_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."ira_project_matching_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_matching_attempts" ADD CONSTRAINT "ira_project_matching_attempts_question_attempt_id_ira_project_knowledge_zap_question_attempts_id_fk" FOREIGN KEY ("question_attempt_id") REFERENCES "public"."ira_project_knowledge_zap_question_attempts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_matching_attempts" ADD CONSTRAINT "ira_project_matching_attempts_question_id_ira_project_matching_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."ira_project_matching_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_matching_attempt_selection" ADD CONSTRAINT "ira_project_matching_attempt_selection_attempt_id_ira_project_matching_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."ira_project_matching_attempts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_matching_attempt_selection" ADD CONSTRAINT "ira_project_matching_attempt_selection_option_1_id_ira_project_matching_answer_options_id_fk" FOREIGN KEY ("option_1_id") REFERENCES "public"."ira_project_matching_answer_options"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_matching_attempt_selection" ADD CONSTRAINT "ira_project_matching_attempt_selection_option_2_id_ira_project_matching_answer_options_id_fk" FOREIGN KEY ("option_2_id") REFERENCES "public"."ira_project_matching_answer_options"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_matching_questions" ADD CONSTRAINT "ira_project_matching_questions_question_id_ira_project_knowledge_zap_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."ira_project_knowledge_zap_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_multiple_choice_answer_options" ADD CONSTRAINT "ira_project_multiple_choice_answer_options_question_id_ira_project_multiple_choice_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."ira_project_multiple_choice_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_multiple_choice_attempts" ADD CONSTRAINT "ira_project_multiple_choice_attempts_question_attempt_id_ira_project_knowledge_zap_question_attempts_id_fk" FOREIGN KEY ("question_attempt_id") REFERENCES "public"."ira_project_knowledge_zap_question_attempts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_multiple_choice_attempts" ADD CONSTRAINT "ira_project_multiple_choice_attempts_question_id_ira_project_multiple_choice_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."ira_project_multiple_choice_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_multiple_choice_attempts" ADD CONSTRAINT "ira_project_multiple_choice_attempts_option_id_ira_project_multiple_choice_answer_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."ira_project_multiple_choice_answer_options"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_multiple_choice_questions" ADD CONSTRAINT "ira_project_multiple_choice_questions_question_id_ira_project_knowledge_zap_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."ira_project_knowledge_zap_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_ordering_answer_options" ADD CONSTRAINT "ira_project_ordering_answer_options_question_id_ira_project_ordering_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."ira_project_ordering_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_ordering_attempts" ADD CONSTRAINT "ira_project_ordering_attempts_question_attempt_id_ira_project_knowledge_zap_question_attempts_id_fk" FOREIGN KEY ("question_attempt_id") REFERENCES "public"."ira_project_knowledge_zap_question_attempts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_ordering_attempts" ADD CONSTRAINT "ira_project_ordering_attempts_question_id_ira_project_ordering_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."ira_project_ordering_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_ordering_attempt_selection" ADD CONSTRAINT "ira_project_ordering_attempt_selection_attempt_id_ira_project_ordering_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."ira_project_ordering_attempts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_ordering_attempt_selection" ADD CONSTRAINT "ira_project_ordering_attempt_selection_option_id_ira_project_ordering_answer_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."ira_project_ordering_answer_options"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_ordering_questions" ADD CONSTRAINT "ira_project_ordering_questions_question_id_ira_project_knowledge_zap_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."ira_project_knowledge_zap_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_explain_assignment_to_course" ADD CONSTRAINT "ira_project_explain_assignment_to_course_assignment_id_ira_project_explain_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."ira_project_explain_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_explain_assignment_to_course" ADD CONSTRAINT "ira_project_explain_assignment_to_course_course_id_ira_project_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."ira_project_courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_explain_assignment_to_grade" ADD CONSTRAINT "ira_project_explain_assignment_to_grade_assignment_id_ira_project_explain_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."ira_project_explain_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_explain_assignment_to_subject" ADD CONSTRAINT "ira_project_explain_assignment_to_subject_assignment_id_ira_project_explain_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."ira_project_explain_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_explain_assignment_to_subject" ADD CONSTRAINT "ira_project_explain_assignment_to_subject_subject_id_ira_project_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."ira_project_subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_explain_assignments" ADD CONSTRAINT "ira_project_explain_assignments_topic_id_ira_project_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."ira_project_topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_explain_assignments" ADD CONSTRAINT "ira_project_explain_assignments_created_by_ira_project_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."ira_project_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_explain_answers" ADD CONSTRAINT "ira_project_explain_answers_question_id_ira_project_explain_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."ira_project_explain_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_explain_question_concepts" ADD CONSTRAINT "ira_project_explain_question_concepts_question_id_ira_project_explain_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."ira_project_explain_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_explain_question_concepts" ADD CONSTRAINT "ira_project_explain_question_concepts_concept_id_ira_project_concepts_id_fk" FOREIGN KEY ("concept_id") REFERENCES "public"."ira_project_concepts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_explain_question_to_assignment" ADD CONSTRAINT "ira_project_explain_question_to_assignment_question_id_ira_project_explain_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."ira_project_explain_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_explain_question_to_assignment" ADD CONSTRAINT "ira_project_explain_question_to_assignment_assignment_id_ira_project_explain_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."ira_project_explain_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_explain_questions" ADD CONSTRAINT "ira_project_explain_questions_topic_id_ira_project_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."ira_project_topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_explain_test_attempts" ADD CONSTRAINT "ira_project_explain_test_attempts_activity_id_ira_project_activity_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."ira_project_activity"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_explain_test_attempts" ADD CONSTRAINT "ira_project_explain_test_attempts_assignment_id_ira_project_explain_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."ira_project_explain_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_explain_test_attempts" ADD CONSTRAINT "ira_project_explain_test_attempts_user_id_ira_project_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."ira_project_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_explain_computed_answers" ADD CONSTRAINT "ira_project_explain_computed_answers_explanation_id_ira_project_explanation_id_fk" FOREIGN KEY ("explanation_id") REFERENCES "public"."ira_project_explanation"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_explain_computed_answers" ADD CONSTRAINT "ira_project_explain_computed_answers_question_id_ira_project_explain_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."ira_project_explain_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_explanation" ADD CONSTRAINT "ira_project_explanation_test_attempt_id_ira_project_explain_test_attempts_id_fk" FOREIGN KEY ("test_attempt_id") REFERENCES "public"."ira_project_explain_test_attempts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_explanation" ADD CONSTRAINT "ira_project_explanation_created_by_ira_project_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."ira_project_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_lesson_plan_files" ADD CONSTRAINT "ira_project_lesson_plan_files_created_by_ira_project_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."ira_project_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_read_and_relay_assignment_to_course" ADD CONSTRAINT "ira_project_read_and_relay_assignment_to_course_assignment_id_ira_project_rr_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."ira_project_rr_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_read_and_relay_assignment_to_course" ADD CONSTRAINT "ira_project_read_and_relay_assignment_to_course_course_id_ira_project_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."ira_project_courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_read_and_relay_assignment_to_grade" ADD CONSTRAINT "ira_project_read_and_relay_assignment_to_grade_assignment_id_ira_project_rr_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."ira_project_rr_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_read_and_relay_assignment_to_subject" ADD CONSTRAINT "ira_project_read_and_relay_assignment_to_subject_assignment_id_ira_project_rr_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."ira_project_rr_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_read_and_relay_assignment_to_subject" ADD CONSTRAINT "ira_project_read_and_relay_assignment_to_subject_subject_id_ira_project_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."ira_project_subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_rr_assignments" ADD CONSTRAINT "ira_project_rr_assignments_topic_id_ira_project_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."ira_project_topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_rr_assignments" ADD CONSTRAINT "ira_project_rr_assignments_created_by_ira_project_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."ira_project_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_rr_attempts" ADD CONSTRAINT "ira_project_rr_attempts_activity_id_ira_project_activity_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."ira_project_activity"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_rr_attempts" ADD CONSTRAINT "ira_project_rr_attempts_assignment_id_ira_project_rr_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."ira_project_rr_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_rr_attempts" ADD CONSTRAINT "ira_project_rr_attempts_user_id_ira_project_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."ira_project_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_rr_cheat_sheets" ADD CONSTRAINT "ira_project_rr_cheat_sheets_attempt_id_ira_project_rr_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."ira_project_rr_attempts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_rr_cheat_sheets" ADD CONSTRAINT "ira_project_rr_cheat_sheets_created_by_ira_project_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."ira_project_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_rr_computed_answers" ADD CONSTRAINT "ira_project_rr_computed_answers_cheatsheet_id_ira_project_rr_cheat_sheets_id_fk" FOREIGN KEY ("cheatsheet_id") REFERENCES "public"."ira_project_rr_cheat_sheets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_rr_computed_answers" ADD CONSTRAINT "ira_project_rr_computed_answers_question_id_ira_project_rr_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."ira_project_rr_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_rr_answers" ADD CONSTRAINT "ira_project_rr_answers_question_id_ira_project_rr_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."ira_project_rr_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_rr_question_to_assignment" ADD CONSTRAINT "ira_project_rr_question_to_assignment_question_id_ira_project_rr_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."ira_project_rr_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_rr_question_to_assignment" ADD CONSTRAINT "ira_project_rr_question_to_assignment_assignment_id_ira_project_rr_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."ira_project_rr_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_rr_questions" ADD CONSTRAINT "ira_project_rr_questions_topic_id_ira_project_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."ira_project_topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_reasoning_assignment_attempts" ADD CONSTRAINT "ira_project_reasoning_assignment_attempts_assignment_id_ira_project_reasoning_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."ira_project_reasoning_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_reasoning_assignment_attempts" ADD CONSTRAINT "ira_project_reasoning_assignment_attempts_activity_id_ira_project_activity_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."ira_project_activity"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_reasoning_assignment_attempts" ADD CONSTRAINT "ira_project_reasoning_assignment_attempts_user_id_ira_project_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."ira_project_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_reasoning_assignment_to_course" ADD CONSTRAINT "ira_project_reasoning_assignment_to_course_assignment_id_ira_project_reasoning_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."ira_project_reasoning_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_reasoning_assignment_to_course" ADD CONSTRAINT "ira_project_reasoning_assignment_to_course_course_id_ira_project_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."ira_project_courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_reasoning_assignment_to_grade" ADD CONSTRAINT "ira_project_reasoning_assignment_to_grade_assignment_id_ira_project_reasoning_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."ira_project_reasoning_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_reasoning_assignment_to_subject" ADD CONSTRAINT "ira_project_reasoning_assignment_to_subject_assignment_id_ira_project_reasoning_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."ira_project_reasoning_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_reasoning_assignment_to_subject" ADD CONSTRAINT "ira_project_reasoning_assignment_to_subject_subject_id_ira_project_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."ira_project_subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_reasoning_assignments" ADD CONSTRAINT "ira_project_reasoning_assignments_topic_id_ira_project_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."ira_project_topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_reasoning_assignments" ADD CONSTRAINT "ira_project_reasoning_assignments_created_by_ira_project_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."ira_project_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_reasoning_assignment_question_final_answer" ADD CONSTRAINT "ira_project_reasoning_assignment_question_final_answer_attempt_id_ira_project_reasoning_assignment_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."ira_project_reasoning_assignment_attempts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_reasoning_assignment_question_final_answer" ADD CONSTRAINT "ira_project_reasoning_assignment_question_final_answer_question_id_ira_project_reasoning_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."ira_project_reasoning_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_reasoning_assignment_question_answers" ADD CONSTRAINT "ira_project_reasoning_assignment_question_answers_attempt_id_ira_project_reasoning_assignment_question_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."ira_project_reasoning_assignment_question_attempts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_reasoning_assignment_question_answers" ADD CONSTRAINT "ira_project_reasoning_assignment_question_answers_reasoning_option_id_ira_project_reasoning_answer_options_id_fk" FOREIGN KEY ("reasoning_option_id") REFERENCES "public"."ira_project_reasoning_answer_options"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_reasoning_assignment_question_attempts" ADD CONSTRAINT "ira_project_reasoning_assignment_question_attempts_attempt_id_ira_project_reasoning_assignment_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."ira_project_reasoning_assignment_attempts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_reasoning_assignment_question_attempts" ADD CONSTRAINT "ira_project_reasoning_assignment_question_attempts_question_id_ira_project_reasoning_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."ira_project_reasoning_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_reasoning_answer_options" ADD CONSTRAINT "ira_project_reasoning_answer_options_question_id_ira_project_reasoning_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."ira_project_reasoning_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_reasoning_pathway" ADD CONSTRAINT "ira_project_reasoning_pathway_question_id_ira_project_reasoning_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."ira_project_reasoning_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_reasoning_pathway_step" ADD CONSTRAINT "ira_project_reasoning_pathway_step_pathway_id_ira_project_reasoning_pathway_id_fk" FOREIGN KEY ("pathway_id") REFERENCES "public"."ira_project_reasoning_pathway"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_reasoning_pathway_step" ADD CONSTRAINT "ira_project_reasoning_pathway_step_answer_option_id_ira_project_reasoning_answer_options_id_fk" FOREIGN KEY ("answer_option_id") REFERENCES "public"."ira_project_reasoning_answer_options"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_reasoning_pathway_step" ADD CONSTRAINT "ira_project_reasoning_pathway_step_replacement_option_id_ira_project_reasoning_answer_options_id_fk" FOREIGN KEY ("replacement_option_id") REFERENCES "public"."ira_project_reasoning_answer_options"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_reasoning_question_to_assignment" ADD CONSTRAINT "ira_project_reasoning_question_to_assignment_question_id_ira_project_reasoning_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."ira_project_reasoning_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_reasoning_question_to_assignment" ADD CONSTRAINT "ira_project_reasoning_question_to_assignment_assignment_id_ira_project_reasoning_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."ira_project_reasoning_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_reasoning_questions" ADD CONSTRAINT "ira_project_reasoning_questions_topic_id_ira_project_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."ira_project_topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_step_solve_assignment_attempts" ADD CONSTRAINT "ira_project_step_solve_assignment_attempts_assignment_id_ira_project_step_solve_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."ira_project_step_solve_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_step_solve_assignment_attempts" ADD CONSTRAINT "ira_project_step_solve_assignment_attempts_activity_id_ira_project_activity_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."ira_project_activity"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_step_solve_assignment_attempts" ADD CONSTRAINT "ira_project_step_solve_assignment_attempts_user_id_ira_project_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."ira_project_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_step_solve_assignment_template_to_course" ADD CONSTRAINT "ira_project_step_solve_assignment_template_to_course_template_id_ira_project_step_solve_assignment_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."ira_project_step_solve_assignment_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_step_solve_assignment_template_to_course" ADD CONSTRAINT "ira_project_step_solve_assignment_template_to_course_course_id_ira_project_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."ira_project_courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_step_solve_assignment_template_to_grade" ADD CONSTRAINT "ira_project_step_solve_assignment_template_to_grade_template_id_ira_project_step_solve_assignment_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."ira_project_step_solve_assignment_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_step_solve_assignment_template_to_subject" ADD CONSTRAINT "ira_project_step_solve_assignment_template_to_subject_template_id_ira_project_step_solve_assignment_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."ira_project_step_solve_assignment_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_step_solve_assignment_template_to_subject" ADD CONSTRAINT "ira_project_step_solve_assignment_template_to_subject_subject_id_ira_project_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."ira_project_subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_step_solve_assignment_templates" ADD CONSTRAINT "ira_project_step_solve_assignment_templates_topic_id_ira_project_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."ira_project_topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_step_solve_assignment_templates" ADD CONSTRAINT "ira_project_step_solve_assignment_templates_created_by_ira_project_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."ira_project_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_step_solve_assignments" ADD CONSTRAINT "ira_project_step_solve_assignments_template_id_ira_project_step_solve_assignment_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."ira_project_step_solve_assignment_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_step_solve_assignments" ADD CONSTRAINT "ira_project_step_solve_assignments_topic_id_ira_project_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."ira_project_topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_step_solve_assignments" ADD CONSTRAINT "ira_project_step_solve_assignments_created_by_ira_project_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."ira_project_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_step_solve_question_attempt_steps" ADD CONSTRAINT "ira_project_step_solve_question_attempt_steps_question_attempt_id_ira_project_step_solve_question_attempts_id_fk" FOREIGN KEY ("question_attempt_id") REFERENCES "public"."ira_project_step_solve_question_attempts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_step_solve_question_attempt_steps" ADD CONSTRAINT "ira_project_step_solve_question_attempt_steps_step_solve_step_id_ira_project_step_solve_step_id_fk" FOREIGN KEY ("step_solve_step_id") REFERENCES "public"."ira_project_step_solve_step"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_step_solve_question_attempt_steps" ADD CONSTRAINT "ira_project_step_solve_question_attempt_steps_step_solve_step_option_id_ira_project_step_solve_step_options_id_fk" FOREIGN KEY ("step_solve_step_option_id") REFERENCES "public"."ira_project_step_solve_step_options"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_step_solve_question_attempts" ADD CONSTRAINT "ira_project_step_solve_question_attempts_attempt_id_ira_project_step_solve_assignment_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."ira_project_step_solve_assignment_attempts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_step_solve_question_attempts" ADD CONSTRAINT "ira_project_step_solve_question_attempts_question_id_ira_project_step_solve_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."ira_project_step_solve_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_step_solve_question_to_assignment" ADD CONSTRAINT "ira_project_step_solve_question_to_assignment_question_id_ira_project_step_solve_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."ira_project_step_solve_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_step_solve_question_to_assignment" ADD CONSTRAINT "ira_project_step_solve_question_to_assignment_assignment_id_ira_project_step_solve_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."ira_project_step_solve_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_step_solve_questions" ADD CONSTRAINT "ira_project_step_solve_questions_topic_id_ira_project_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."ira_project_topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_step_solve_step" ADD CONSTRAINT "ira_project_step_solve_step_question_id_ira_project_step_solve_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."ira_project_step_solve_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_step_solve_step_concepts" ADD CONSTRAINT "ira_project_step_solve_step_concepts_step_id_ira_project_step_solve_step_id_fk" FOREIGN KEY ("step_id") REFERENCES "public"."ira_project_step_solve_step"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_step_solve_step_concepts" ADD CONSTRAINT "ira_project_step_solve_step_concepts_concept_id_ira_project_concepts_id_fk" FOREIGN KEY ("concept_id") REFERENCES "public"."ira_project_concepts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_step_solve_step_options" ADD CONSTRAINT "ira_project_step_solve_step_options_step_id_ira_project_step_solve_step_id_fk" FOREIGN KEY ("step_id") REFERENCES "public"."ira_project_step_solve_step"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_step_solve_step_report" ADD CONSTRAINT "ira_project_step_solve_step_report_step_id_ira_project_step_solve_step_id_fk" FOREIGN KEY ("step_id") REFERENCES "public"."ira_project_step_solve_step"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_step_solve_step_report" ADD CONSTRAINT "ira_project_step_solve_step_report_user_id_ira_project_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."ira_project_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_courses" ADD CONSTRAINT "ira_project_courses_subject_id_ira_project_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."ira_project_subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_topics" ADD CONSTRAINT "ira_project_topics_course_id_ira_project_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."ira_project_courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_teacher_courses" ADD CONSTRAINT "ira_project_teacher_courses_user_id_ira_project_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."ira_project_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_teacher_courses" ADD CONSTRAINT "ira_project_teacher_courses_course_id_ira_project_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."ira_project_courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_teacher_grades" ADD CONSTRAINT "ira_project_teacher_grades_user_id_ira_project_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."ira_project_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_teacher_subjects" ADD CONSTRAINT "ira_project_teacher_subjects_user_id_ira_project_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."ira_project_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ira_project_teacher_subjects" ADD CONSTRAINT "ira_project_teacher_subjects_subject_id_ira_project_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."ira_project_subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "class_member_class_idx" ON "ira_project_user_class_relations" USING btree ("classroom_id");--> statement-breakpoint
CREATE INDEX "class_member_user_idx" ON "ira_project_user_class_relations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_code_user_idx" ON "ira_project_email_verification_codes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_code_email_idx" ON "ira_project_email_verification_codes" USING btree ("email");--> statement-breakpoint
CREATE INDEX "password_token_user_idx" ON "ira_project_password_reset_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "preloaded_user_email_idx" ON "ira_project_preloaded_users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "session_user_idx" ON "ira_project_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_email_idx" ON "ira_project_users" USING btree ("email");