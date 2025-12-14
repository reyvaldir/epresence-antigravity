import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to handle BigInt serialization
const serialize = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return obj.toString();
  if (Array.isArray(obj)) return obj.map(serialize);
  if (typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      newObj[key] = serialize(obj[key]);
    }
    return newObj;
  }
  return obj;
};

export const resolvers = {
  Query: {
    me: async (_: any, __: any, context: any) => {
      // TODO: Get userId from context.token (Clerk)
      const user = await prisma.user.findFirst();
      return serialize(user);
    },
    users: async () => {
      const users = await prisma.user.findMany();
      return serialize(users);
    },
    attendanceHistory: async (_: any, { userId }: { userId?: string }) => {
      const where = userId ? { userId } : {};
      const records = await prisma.attendanceRecord.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        include: { user: true }
      });
      return serialize(records);
    },
    userAbsenceRequests: async (_: any, { userId }: { userId: string }) => {
      const requests = await prisma.absenceRequest.findMany({
        where: { userId },
        orderBy: { startDate: 'desc' }
      });
      return serialize(requests);
    },
    allAbsenceRequests: async () => {
      const requests = await prisma.absenceRequest.findMany({
        orderBy: { startDate: 'desc' },
        include: { user: true }
      });
      return serialize(requests);
    },
    mySchedule: async (_: any, { userId }: { userId: string }) => {
      const schedules = await prisma.workSchedule.findMany({
        where: { userId },
        orderBy: { dayOfWeek: 'asc' }
      });
      return serialize(schedules);
    },
    allWorkSchedules: async () => {
      const schedules = await prisma.workSchedule.findMany();
      return serialize(schedules);
    },
    officeLocations: async () => {
      const locations = await prisma.officeLocation.findMany();
      return serialize(locations);
    }
  },
  Mutation: {
    checkIn: async (_: any, args: { latitude: number, longitude: number, address?: string, selfieUrl: string }) => {
      const user = await prisma.user.findFirst();
      if (!user) throw new Error("No user found");

      const record = await prisma.attendanceRecord.create({
        data: {
          userId: user.id,
          type: 'check_in',
          latitude: args.latitude,
          longitude: args.longitude,
          address: args.address,
          selfieUrl: args.selfieUrl,
          timestamp: BigInt(Date.now()),
          status: 'on_time'
        }
      });
      return serialize(record);
    },
    checkOut: async (_: any, args: { latitude: number, longitude: number, address?: string, selfieUrl: string }) => {
      const user = await prisma.user.findFirst();
      if (!user) throw new Error("No user found");

      const record = await prisma.attendanceRecord.create({
        data: {
          userId: user.id,
          type: 'check_out',
          latitude: args.latitude,
          longitude: args.longitude,
          address: args.address,
          selfieUrl: args.selfieUrl,
          timestamp: BigInt(Date.now()),
        }
      });
      return serialize(record);
    },
    updateWorkSchedule: async (_: any, args: { userId: string, days: any[] }) => {
      // Transaction to replace schedule
      return await prisma.$transaction(async (tx) => {
        // Delete existing
        await tx.workSchedule.deleteMany({
          where: { userId: args.userId }
        });

        // Create new
        // Note: createMany is not supported in SQLite if that's what we are using?
        // Prisma documentation says createMany is supported in SQLite since 2.22? No.
        // If not supported, we loop.
        // Assuming Postgres/MySQL for production but if SQLite (common for dev) -> use loops or Promise.all
        // Let's use Promise.all to be safe across DBs.

        const createdSchedules = await Promise.all(
          args.days.map(day => tx.workSchedule.create({
            data: {
              userId: args.userId,
              dayOfWeek: day.dayOfWeek,
              startTime: day.startTime,
              endTime: day.endTime,
              isDayOff: day.isDayOff
            }
          }))
        );
        return serialize(createdSchedules);
      });
    },
    updateProfile: async (_: any, args: { name?: string, phone?: string, avatarUrl?: string }) => {
      const user = await prisma.user.findFirst();
      if (!user) throw new Error("No user found");

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: args.name,
          phone: args.phone,
          avatarUrl: args.avatarUrl
        }
      });
      return serialize(updatedUser);
    },
    submitAbsenceRequest: async (_: any, args: { userId: string, type: string, reason: string, startDate: string, endDate: string }) => {
      return await prisma.absenceRequest.create({
        data: {
          userId: args.userId,
          type: args.type,
          reason: args.reason,
          status: 'pending',
          startDate: BigInt(args.startDate),
          endDate: BigInt(args.endDate)
        }
      });
    },
    approveAbsenceRequest: async (_: any, args: { requestId: string, approvedBy: string }) => {
      return await prisma.absenceRequest.update({
        where: { id: args.requestId },
        data: {
          status: 'approved',
          approvedById: args.approvedBy
        }
      });
    },
    rejectAbsenceRequest: async (_: any, args: { requestId: string, approvedBy: string }) => {
      return await prisma.absenceRequest.update({
        where: { id: args.requestId },
        data: {
          status: 'rejected',
          approvedById: args.approvedBy
        }
      });
    },
    approveUser: async (_: any, args: { userId: string }) => {
      return await prisma.user.update({
        where: { id: args.userId },
        data: { isApproved: true }
      });
    },
    rejectUser: async (_: any, args: { userId: string }) => {
      return await prisma.user.update({
        where: { id: args.userId },
        data: { isApproved: false }
      });
    },
    deleteUser: async (_: any, args: { userId: string }) => {
      return await prisma.user.delete({
        where: { id: args.userId }
      });
    },
    updateUserRole: async (_: any, args: { userId: string, role: string }) => {
      return await prisma.user.update({
        where: { id: args.userId },
        data: { role: args.role }
      });
    },
    createOfficeLocation: async (_: any, args: { name: string, latitude: number, longitude: number, radius: number }) => {
      return await prisma.officeLocation.create({
        data: {
          name: args.name,
          latitude: args.latitude,
          longitude: args.longitude,
          radius: args.radius
        }
      });
    },
    updateOfficeLocation: async (_: any, args: { id: string, name?: string, latitude?: number, longitude?: number, radius?: number }) => {
      return await prisma.officeLocation.update({
        where: { id: args.id },
        data: {
          name: args.name,
          latitude: args.latitude,
          longitude: args.longitude,
          radius: args.radius
        }
      });
    },
    deleteOfficeLocation: async (_: any, args: { id: string }) => {
      return await prisma.officeLocation.delete({
        where: { id: args.id }
      });
    }
  },
  AbsenceRequest: {
    startDate: (parent: any) => parent.startDate.toString(),
    endDate: (parent: any) => parent.endDate.toString(),
  }
};
