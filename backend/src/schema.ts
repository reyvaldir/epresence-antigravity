export const typeDefs = `#graphql
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
    avatarUrl: String
    phone: String
    isApproved: Boolean!
    createdAt: String!
  }

  type AttendanceRecord {
    id: ID!
    userId: String!
    type: String!
    latitude: Float!
    longitude: Float!
    address: String
    selfieUrl: String!
    timestamp: String!
    status: String
  }

  type OfficeLocation {
    id: ID!
    name: String!
    latitude: Float!
    longitude: Float!
    radius: Float!
  }

  type AbsenceRequest {
    id: ID!
    userId: String!
    type: String!
    reason: String!
    status: String!
    startDate: String!
    endDate: String!
  }

  type WorkSchedule {
    id: ID!
    userId: String!
    dayOfWeek: Int!
    startTime: String!
    endTime: String!
    isDayOff: Boolean!
  }

  type Query {
    me: User
    users: [User!]!
    attendanceHistory(userId: String): [AttendanceRecord!]!
    userAbsenceRequests(userId: String): [AbsenceRequest!]!
    allAbsenceRequests: [AbsenceRequest!]!
    mySchedule(userId: String!): [WorkSchedule!]!
    allWorkSchedules: [WorkSchedule!]!
    officeLocations: [OfficeLocation!]!
  }

  type Mutation {
    checkIn(latitude: Float!, longitude: Float!, address: String, selfieUrl: String!): AttendanceRecord!
    checkOut(latitude: Float!, longitude: Float!, address: String, selfieUrl: String!): AttendanceRecord!
    updateProfile(name: String, phone: String, avatarUrl: String): User!
    submitAbsenceRequest(userId: String!, type: String!, reason: String!, startDate: String!, endDate: String!): AbsenceRequest!
    
    # Admin mutations
    approveAbsenceRequest(requestId: ID!, approvedBy: String!): AbsenceRequest!
    rejectAbsenceRequest(requestId: ID!, approvedBy: String!): AbsenceRequest!
    approveUser(userId: ID!): User!
    rejectUser(userId: ID!): User!
    deleteUser(userId: ID!): User!
    updateUserRole(userId: ID!, role: String!): User!
    
    # Location mutations
    createOfficeLocation(name: String!, latitude: Float!, longitude: Float!, radius: Float!): OfficeLocation!
    updateOfficeLocation(id: ID!, name: String, latitude: Float, longitude: Float, radius: Float): OfficeLocation!
    deleteOfficeLocation(id: ID!): OfficeLocation!

    # Schedule mutations
    updateWorkSchedule(userId: String!, days: [WorkScheduleInput!]!): [WorkSchedule!]!
  }

  input WorkScheduleInput {
    dayOfWeek: Int!
    startTime: String!
    endTime: String!
    isDayOff: Boolean!
  }
`;
