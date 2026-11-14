-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CO_OP', 'CONTRACT');

-- CreateEnum
CREATE TYPE "WorkArrangement" AS ENUM ('ONSITE', 'HYBRID', 'REMOTE');

-- CreateTable
CREATE TABLE "companies" (
    "company_id" UUID NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "industry" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "website" VARCHAR(2048),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("company_id")
);

-- CreateTable
CREATE TABLE "roles" (
    "role_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "location" VARCHAR(160),
    "employment_type" "EmploymentType",
    "work_arrangement" "WorkArrangement",
    "term" VARCHAR(80),
    "minimum_experience_level_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "skills" (
    "skill_id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "normalized_name" VARCHAR(120) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("skill_id")
);

-- CreateTable
CREATE TABLE "role_skills" (
    "role_id" UUID NOT NULL,
    "skill_id" UUID NOT NULL,

    CONSTRAINT "role_skills_pkey" PRIMARY KEY ("role_id","skill_id")
);

-- CreateTable
CREATE TABLE "coursework" (
    "coursework_id" UUID NOT NULL,
    "name" VARCHAR(180) NOT NULL,
    "normalized_name" VARCHAR(180) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coursework_pkey" PRIMARY KEY ("coursework_id")
);

-- CreateTable
CREATE TABLE "role_coursework" (
    "role_id" UUID NOT NULL,
    "coursework_id" UUID NOT NULL,

    CONSTRAINT "role_coursework_pkey" PRIMARY KEY ("role_id","coursework_id")
);

-- CreateTable
CREATE TABLE "career_interests" (
    "career_interest_id" UUID NOT NULL,
    "code" VARCHAR(80) NOT NULL,
    "label" VARCHAR(120) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "career_interests_pkey" PRIMARY KEY ("career_interest_id")
);

-- CreateTable
CREATE TABLE "role_career_interests" (
    "role_id" UUID NOT NULL,
    "career_interest_id" UUID NOT NULL,

    CONSTRAINT "role_career_interests_pkey" PRIMARY KEY ("role_id","career_interest_id")
);

-- CreateTable
CREATE TABLE "experience_levels" (
    "experience_level_id" UUID NOT NULL,
    "code" VARCHAR(80) NOT NULL,
    "label" VARCHAR(160) NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "experience_levels_pkey" PRIMARY KEY ("experience_level_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_slug_key" ON "companies"("slug");

-- CreateIndex
CREATE INDEX "companies_is_active_name_idx" ON "companies"("is_active", "name");

-- CreateIndex
CREATE INDEX "roles_is_active_title_idx" ON "roles"("is_active", "title");

-- CreateIndex
CREATE INDEX "roles_minimum_experience_level_id_idx" ON "roles"("minimum_experience_level_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_company_id_slug_key" ON "roles"("company_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "skills_normalized_name_key" ON "skills"("normalized_name");

-- CreateIndex
CREATE INDEX "role_skills_skill_id_idx" ON "role_skills"("skill_id");

-- CreateIndex
CREATE UNIQUE INDEX "coursework_normalized_name_key" ON "coursework"("normalized_name");

-- CreateIndex
CREATE INDEX "role_coursework_coursework_id_idx" ON "role_coursework"("coursework_id");

-- CreateIndex
CREATE UNIQUE INDEX "career_interests_code_key" ON "career_interests"("code");

-- CreateIndex
CREATE UNIQUE INDEX "career_interests_label_key" ON "career_interests"("label");

-- CreateIndex
CREATE INDEX "role_career_interests_career_interest_id_idx" ON "role_career_interests"("career_interest_id");

-- CreateIndex
CREATE UNIQUE INDEX "experience_levels_code_key" ON "experience_levels"("code");

-- CreateIndex
CREATE UNIQUE INDEX "experience_levels_label_key" ON "experience_levels"("label");

-- CreateIndex
CREATE UNIQUE INDEX "experience_levels_sort_order_key" ON "experience_levels"("sort_order");

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("company_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_minimum_experience_level_id_fkey" FOREIGN KEY ("minimum_experience_level_id") REFERENCES "experience_levels"("experience_level_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_skills" ADD CONSTRAINT "role_skills_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_skills" ADD CONSTRAINT "role_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("skill_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_coursework" ADD CONSTRAINT "role_coursework_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_coursework" ADD CONSTRAINT "role_coursework_coursework_id_fkey" FOREIGN KEY ("coursework_id") REFERENCES "coursework"("coursework_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_career_interests" ADD CONSTRAINT "role_career_interests_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_career_interests" ADD CONSTRAINT "role_career_interests_career_interest_id_fkey" FOREIGN KEY ("career_interest_id") REFERENCES "career_interests"("career_interest_id") ON DELETE RESTRICT ON UPDATE CASCADE;
