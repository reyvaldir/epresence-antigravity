import { gql } from '@apollo/client';

export const GET_ME = gql`
  query GetMe {
    me {
      id
      name
      email
      role
      avatarUrl
      phone
      isApproved
      createdAt
    }
  }
`;

export const CHECK_IN = gql`
  mutation CheckIn($latitude: Float!, $longitude: Float!, $address: String, $selfieUrl: String!) {
    checkIn(latitude: $latitude, longitude: $longitude, address: $address, selfieUrl: $selfieUrl) {
      id
      timestamp
      status
    }
  }
`;

export const CHECK_OUT = gql`
  mutation CheckOut($latitude: Float!, $longitude: Float!, $address: String, $selfieUrl: String!) {
    checkOut(latitude: $latitude, longitude: $longitude, address: $address, selfieUrl: $selfieUrl) {
      id
      timestamp
      status
    }
  }
`;

export const GET_TODAY_ATTENDANCE = gql`
  query GetTodayAttendance($userId: String) {
    attendanceHistory(userId: $userId) {
      id
      type
      timestamp
      status
    }
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($name: String, $phone: String, $avatarUrl: String) {
    updateProfile(name: $name, phone: $phone, avatarUrl: $avatarUrl) {
      id
      name
      phone
      avatarUrl
    }
  }
`;

export const SUBMIT_ABSENCE_REQUEST = gql`
  mutation SubmitAbsenceRequest($userId: String!, $type: String!, $reason: String!, $startDate: String!, $endDate: String!) {
    submitAbsenceRequest(userId: $userId, type: $type, reason: $reason, startDate: $startDate, endDate: $endDate) {
       id
       status
    }
  }
`;

export const GET_USER_ABSENCE_REQUESTS = gql`
  query GetUserAbsenceRequests($userId: String!) {
    userAbsenceRequests(userId: $userId) {
      id
      type
      reason
      startDate
      endDate
      status
    }
  }
`;

export const GET_MY_SCHEDULE = gql`
  query GetMySchedule($userId: String!) {
    mySchedule(userId: $userId) {
      id
      dayOfWeek
      startTime
      endTime
      isDayOff
    }
  }
`;

export const GET_ATTENDANCE_HISTORY = gql`
  query GetAttendanceHistory($userId: String) {
    attendanceHistory(userId: $userId) {
      id
      type
      timestamp
      status
      latitude
      longitude
    }
  }
`;

export const GET_ALL_USERS = gql`
  query GetAllUsers {
    users {
      id
      name
      email
      role
      avatarUrl
      phone
      isApproved
      createdAt
    }
  }
`;

export const GET_ALL_ABSENCE_REQUESTS = gql`
  query GetAllAbsenceRequests {
    allAbsenceRequests {
      id
      userId
      type
      reason
      startDate
      endDate
      status
      # We might need user details here if not joined in resolver properly
      # but resolver now includes user in result which might not be in schema return type
      # Wait, schema return type for AbsenceRequest does not have user.
      # I need to update Schema for nested User in AbsenceRequest first if I want to query it.
      # For now, I will just query fields present in Schema.
    }
  }
`;

export const APPROVE_ABSENCE_REQUEST = gql`
  mutation ApproveAbsenceRequest($requestId: ID!, $approvedBy: String!) {
    approveAbsenceRequest(requestId: $requestId, approvedBy: $approvedBy) {
      id
      status
    }
  }
`;

export const REJECT_ABSENCE_REQUEST = gql`
  mutation RejectAbsenceRequest($requestId: ID!, $approvedBy: String!) {
    rejectAbsenceRequest(requestId: $requestId, approvedBy: $approvedBy) {
      id
      status
    }
  }
`;

export const APPROVE_USER = gql`
  mutation ApproveUser($userId: ID!) {
     approveUser(userId: $userId) {
       id
       isApproved
     }
  }
`;

export const REJECT_USER = gql`
  mutation RejectUser($userId: ID!) {
     rejectUser(userId: $userId) {
       id
       isApproved
     }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($userId: ID!) {
     deleteUser(userId: $userId) {
       id
     }
  }
`;

export const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($userId: ID!, $role: String!) {
     updateUserRole(userId: $userId, role: $role) {
       id
       role
     }
  }
`;

export const GET_OFFICE_LOCATIONS = gql`
  query GetOfficeLocations {
    officeLocations {
      id
      name
      latitude
      longitude
      radius
    }
  }
`;

export const CREATE_OFFICE_LOCATION = gql`
  mutation CreateOfficeLocation($name: String!, $latitude: Float!, $longitude: Float!, $radius: Float!) {
    createOfficeLocation(name: $name, latitude: $latitude, longitude: $longitude, radius: $radius) {
      id
      name
      latitude
      longitude
      radius
    }
  }
`;

export const UPDATE_OFFICE_LOCATION = gql`
  mutation UpdateOfficeLocation($id: ID!, $name: String, $latitude: Float, $longitude: Float, $radius: Float) {
    updateOfficeLocation(id: $id, name: $name, latitude: $latitude, longitude: $longitude, radius: $radius) {
      id
      name
      latitude
      longitude
      radius
    }
  }
`;

export const DELETE_OFFICE_LOCATION = gql`
  mutation DeleteOfficeLocation($id: ID!) {
    deleteOfficeLocation(id: $id) {
       id
    }
  }
`;

export const GET_ALL_WORK_SCHEDULES = gql`
  query GetAllWorkSchedules {
    allWorkSchedules {
      id
      userId
      dayOfWeek
      startTime
      endTime
      isDayOff
    }
  }
`;

export const UPDATE_WORK_SCHEDULE = gql`
  mutation UpdateWorkSchedule($userId: String!, $days: [WorkScheduleInput!]!) {
    updateWorkSchedule(userId: $userId, days: $days) {
       id
       dayOfWeek
       startTime
       endTime
       isDayOff
    }
  }
`;
