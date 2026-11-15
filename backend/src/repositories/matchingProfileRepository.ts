import type { Prisma, PrismaClient } from '../generated/prisma/client.ts'

const profileSelect = {
  profileId: true,
  createdAt: true,
  updatedAt: true,
  careerInterest: { select: { label: true } },
  experienceLevel: { select: { label: true } },
  skills: {
    orderBy: { position: 'asc' },
    select: { skill: { select: { name: true } } },
  },
  coursework: {
    orderBy: { position: 'asc' },
    select: { coursework: { select: { name: true } } },
  },
} satisfies Prisma.MatchingProfileSelect

type MatchingProfileRecord = Prisma.MatchingProfileGetPayload<{
  select: typeof profileSelect
}>

export interface MatchingProfileInput {
  careerInterest: string
  skills: string[]
  coursework: string[]
  experienceLevel: string
}

export interface SavedMatchingProfile {
  profileId: string
  careerInterest: string
  skills: string[]
  coursework: string[]
  experienceLevel: string
  createdAt: Date
  updatedAt: Date
}

export interface MatchingProfileRepository {
  findForStudent(): Promise<SavedMatchingProfile | null>
  saveForStudent(input: MatchingProfileInput): Promise<SavedMatchingProfile>
}

export class MatchingProfileValidationError extends Error {}

function normalizeName(name: string): string {
  return name.normalize('NFKC').trim().toLowerCase().replace(/\s+/g, ' ')
}

function serializeProfile(
  profile: MatchingProfileRecord,
): SavedMatchingProfile {
  return {
    profileId: profile.profileId,
    careerInterest: profile.careerInterest.label,
    skills: profile.skills.map(({ skill }) => skill.name),
    coursework: profile.coursework.map(({ coursework }) => coursework.name),
    experienceLevel: profile.experienceLevel.label,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  }
}

export function createMatchingProfileRepository(
  prisma: PrismaClient,
  studentId: string,
): MatchingProfileRepository {
  return {
    async findForStudent() {
      const profile = await prisma.matchingProfile.findUnique({
        where: { studentId },
        select: profileSelect,
      })

      return profile ? serializeProfile(profile) : null
    },

    async saveForStudent(input) {
      const careerInterest = await prisma.careerInterest.findUnique({
        where: { label: input.careerInterest },
        select: { careerInterestId: true },
      })
      const experienceLevel = await prisma.experienceLevel.findUnique({
        where: { label: input.experienceLevel },
        select: { experienceLevelId: true },
      })

      if (!careerInterest || !experienceLevel) {
        throw new MatchingProfileValidationError(
          'The career interest or experience level is not recognized.',
        )
      }

      const skills = [...new Set(input.skills.map((skill) => skill.trim()))]
      const coursework = [
        ...new Set(input.coursework.map((course) => course.trim())),
      ]

      return prisma.$transaction(async (transaction) => {
        const skillRecords = await Promise.all(
          skills.map((name) =>
            transaction.skill.upsert({
              where: { normalizedName: normalizeName(name) },
              update: {},
              create: { name, normalizedName: normalizeName(name) },
              select: { skillId: true },
            }),
          ),
        )
        const courseworkRecords = await Promise.all(
          coursework.map((name) =>
            transaction.coursework.upsert({
              where: { normalizedName: normalizeName(name) },
              update: {},
              create: { name, normalizedName: normalizeName(name) },
              select: { courseworkId: true },
            }),
          ),
        )
        const profile = await transaction.matchingProfile.upsert({
          where: { studentId },
          create: {
            studentId,
            careerInterestId: careerInterest.careerInterestId,
            experienceLevelId: experienceLevel.experienceLevelId,
          },
          update: {
            careerInterestId: careerInterest.careerInterestId,
            experienceLevelId: experienceLevel.experienceLevelId,
          },
          select: { profileId: true },
        })

        await transaction.matchingProfileSkill.deleteMany({
          where: { profileId: profile.profileId },
        })
        await transaction.matchingProfileCoursework.deleteMany({
          where: { profileId: profile.profileId },
        })
        await transaction.matchingProfileSkill.createMany({
          data: skillRecords.map(({ skillId }, position) => ({
            profileId: profile.profileId,
            skillId,
            position,
          })),
        })
        await transaction.matchingProfileCoursework.createMany({
          data: courseworkRecords.map(({ courseworkId }, position) => ({
            profileId: profile.profileId,
            courseworkId,
            position,
          })),
        })

        const savedProfile = await transaction.matchingProfile.findUniqueOrThrow({
          where: { profileId: profile.profileId },
          select: profileSelect,
        })

        return serializeProfile(savedProfile)
      })
    },
  }
}
