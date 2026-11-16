import type { Prisma, PrismaClient } from '../generated/prisma/client.ts'
import type { RoleInput } from '../matching/scoreMatch.ts'

const recommendationRoleSelect = {
  roleId: true,
  companyId: true,
  slug: true,
  title: true,
  description: true,
  location: true,
  employmentType: true,
  workArrangement: true,
  term: true,
  company: {
    select: {
      companyId: true,
      name: true,
      slug: true,
    },
  },
  minimumExperienceLevel: {
    select: {
      label: true,
      sortOrder: true,
    },
  },
  skills: {
    select: {
      skill: {
        select: { name: true },
      },
    },
  },
  coursework: {
    select: {
      coursework: {
        select: { name: true },
      },
    },
  },
  careerInterests: {
    select: {
      careerInterest: {
        select: { label: true },
      },
    },
  },
} satisfies Prisma.RoleSelect

type RecommendationRoleRecord = Prisma.RoleGetPayload<{
  select: typeof recommendationRoleSelect
}>

export type RecommendationRole = Omit<
  RecommendationRoleRecord,
  | 'skills'
  | 'coursework'
  | 'careerInterests'
  | 'minimumExperienceLevel'
> &
  RoleInput

export interface RecommendationRepository {
  listActiveRoles(): Promise<RecommendationRole[]>
}

export function createRecommendationRepository(
  prisma: PrismaClient,
): RecommendationRepository {
  return {
    async listActiveRoles() {
      const roles = await prisma.role.findMany({
        where: {
          isActive: true,
          company: { is: { isActive: true } },
        },
        select: recommendationRoleSelect,
        orderBy: [{ title: 'asc' }, { roleId: 'asc' }],
      })

      return roles.map(
        ({
          skills,
          coursework,
          careerInterests,
          minimumExperienceLevel,
          ...role
        }) => ({
          ...role,
          skills: skills.map(({ skill }) => skill.name),
          coursework: coursework.map(({ coursework }) => coursework.name),
          careerInterests: careerInterests.map(
            ({ careerInterest }) => careerInterest.label,
          ),
          minimumExperienceLevel,
        }),
      )
    },
  }
}
