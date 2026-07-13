package com.example.attendance.attendance.service;

import com.example.attendance.attendance.dto.AttendanceHistoryResponse;
import com.example.attendance.attendance.dto.AttendanceRecordResponse;
import com.example.attendance.attendance.dto.ClockInRequest;
import com.example.attendance.attendance.dto.ClockOutRequest;
import com.example.attendance.attendance.dto.TeamMemberSummaryResponse;
import com.example.attendance.attendance.dto.TodayStatusResponse;
import com.example.attendance.attendance.dto.UpdateMemoRequest;

import java.util.List;
import java.util.UUID;

public interface AttendanceService {

    AttendanceRecordResponse clockIn(ClockInRequest request);

    AttendanceRecordResponse clockOut(ClockOutRequest request);

    AttendanceRecordResponse updateMemo(UUID recordId, UpdateMemoRequest request, UUID currentUserId);

    TodayStatusResponse getTodayStatus(UUID employeeId);

    AttendanceHistoryResponse getHistory(UUID employeeId, String month);

    List<TeamMemberSummaryResponse> getTeamAttendance(UUID managerId, String month);

    List<TeamMemberSummaryResponse> getAllAttendance(String month, UUID departmentId);
}
