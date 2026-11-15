-- Add profile data without changing existing company, role, or catalog records.
CREATE TABLE "matching_profiles" (
    "profile_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "career_interest_id" UUID NOT NULL,
    "experience_level_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "matching_profiles_pkey" PRIMARY KEY ("profile_id")
);

CREATE TABLE "matching_profile_skills" (
    "profile_id" UUID NOT NULL,
    "skill_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "matching_profile_skills_pkey" PRIMARY KEY ("profile_id", "skill_id")
);

CREATE TABLE "matching_profile_coursework" (
    "profile_id" UUID NOT NULL,
    "coursework_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "matching_profile_coursework_pkey" PRIMARY KEY ("profile_id", "coursework_id")
);

CREATE UNIQUE INDEX "matching_profiles_student_id_key"
    ON "matching_profiles"("student_id");
CREATE INDEX "matching_profiles_career_interest_id_idx"
    ON "matching_profiles"("career_interest_id");
CREATE INDEX "matching_profiles_experience_level_id_idx"
    ON "matching_profiles"("experience_level_id");
CREATE UNIQUE INDEX "matching_profile_skills_profile_id_position_key"
    ON "matching_profile_skills"("profile_id", "position");
CREATE INDEX "matching_profile_skills_skill_id_idx"
    ON "matching_profile_skills"("skill_id");
CREATE UNIQUE INDEX "matching_profile_coursework_profile_id_position_key"
    ON "matching_profile_coursework"("profile_id", "position");
CREATE INDEX "matching_profile_coursework_coursework_id_idx"
    ON "matching_profile_coursework"("coursework_id");

ALTER TABLE "matching_profiles"
    ADD CONSTRAINT "matching_profiles_career_interest_id_fkey"
    FOREIGN KEY ("career_interest_id") REFERENCES "career_interests"("career_interest_id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "matching_profiles"
    ADD CONSTRAINT "matching_profiles_experience_level_id_fkey"
    FOREIGN KEY ("experience_level_id") REFERENCES "experience_levels"("experience_level_id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "matching_profile_skills"
    ADD CONSTRAINT "matching_profile_skills_profile_id_fkey"
    FOREIGN KEY ("profile_id") REFERENCES "matching_profiles"("profile_id")
    ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "matching_profile_skills"
    ADD CONSTRAINT "matching_profile_skills_skill_id_fkey"
    FOREIGN KEY ("skill_id") REFERENCES "skills"("skill_id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "matching_profile_coursework"
    ADD CONSTRAINT "matching_profile_coursework_profile_id_fkey"
    FOREIGN KEY ("profile_id") REFERENCES "matching_profiles"("profile_id")
    ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "matching_profile_coursework"
    ADD CONSTRAINT "matching_profile_coursework_coursework_id_fkey"
    FOREIGN KEY ("coursework_id") REFERENCES "coursework"("coursework_id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
