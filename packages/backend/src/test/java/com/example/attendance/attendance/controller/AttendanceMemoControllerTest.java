package com.example.attendance.attendance.controller;

import com.example.attendance.attendance.dto.AttendanceRecordResponse;
import com.example.attendance.attendance.dto.ClockInRequest;
import com.example.attendance.attendance.dto.ClockOutRequest;
import com.example.attendance.attendance.dto.UpdateMemoRequest;
import com.example.attendance.attendance.service.AttendanceService;
import com.example.attendance.common.config.CorsConfig;
import com.example.attendance.common.config.SecurityConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
    controllers = AttendanceController.class,
    excludeFilters = @ComponentScan.Filter(
        type = FilterType.ASSIGNABLE_TYPE,
        classes = {SecurityConfig.class, CorsConfig.class}
    )
)
@Import(AttendanceMemoControllerTest.TestSecurityConfig.class)
@ActiveProfiles("test")
class AttendanceMemoControllerTest {

    @org.springframework.boot.test.context.TestConfiguration
    static class TestSecurityConfig {
        @Bean
        public SecurityFilterChain testSecurityFilterChain(HttpSecurity http) throws Exception {
            http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
            return http.build();
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AttendanceService attendanceService;

    private static final UUID EMPLOYEE_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");
    private static final UUID RECORD_ID = UUID.fromString("00000000-0000-0000-0000-000000000099");

    @Nested
    @DisplayName("POST /api/attendance/clock-in (メモ付き)")
    class ClockInWithMemo {

        @Test
        @DisplayName("メモ付きリクエストボディで出勤打刻するとメモが返される")
        void clockIn_withMemoBody_returns201WithMemo() throws Exception {
            // Arrange
            var request = new ClockInRequest(EMPLOYEE_ID, "在宅勤務");
            var response = new AttendanceRecordResponse(
                    RECORD_ID,
                    LocalDate.of(2025, 1, 15),
                    Instant.parse("2025-01-15T00:00:00Z"),
                    null,
                    "在宅勤務",
                    null,
                    false
            );
            when(attendanceService.clockIn(any(ClockInRequest.class))).thenReturn(response);

            // Act & Assert
            mockMvc.perform(post("/api/attendance/clock-in")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.clockInMemo").value("在宅勤務"))
                    .andExpect(jsonPath("$.clockOutMemo").doesNotExist());
        }

        @Test
        @DisplayName("メモなしでも出勤打刻できる")
        void clockIn_withoutMemo_returns201() throws Exception {
            // Arrange
            var request = new ClockInRequest(EMPLOYEE_ID, null);
            var response = new AttendanceRecordResponse(
                    RECORD_ID,
                    LocalDate.of(2025, 1, 15),
                    Instant.parse("2025-01-15T00:00:00Z"),
                    null,
                    null,
                    null,
                    false
            );
            when(attendanceService.clockIn(any(ClockInRequest.class))).thenReturn(response);

            // Act & Assert
            mockMvc.perform(post("/api/attendance/clock-in")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.clockInMemo").doesNotExist());
        }
    }

    @Nested
    @DisplayName("POST /api/attendance/clock-out (メモ付き)")
    class ClockOutWithMemo {

        @Test
        @DisplayName("メモ付きで退勤打刻するとメモが返される")
        void clockOut_withMemoBody_returns200WithMemo() throws Exception {
            // Arrange
            var request = new ClockOutRequest(EMPLOYEE_ID, "明日は客先直行");
            var response = new AttendanceRecordResponse(
                    RECORD_ID,
                    LocalDate.of(2025, 1, 15),
                    Instant.parse("2025-01-14T23:00:00Z"),
                    Instant.parse("2025-01-15T08:00:00Z"),
                    null,
                    "明日は客先直行",
                    false
            );
            when(attendanceService.clockOut(any(ClockOutRequest.class))).thenReturn(response);

            // Act & Assert
            mockMvc.perform(post("/api/attendance/clock-out")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.clockOutMemo").value("明日は客先直行"));
        }
    }

    @Nested
    @DisplayName("PATCH /api/attendance/{id}/memo")
    class UpdateMemo {

        @Test
        @DisplayName("メモ編集が成功すると更新後のレコードが返される")
        void updateMemo_validRequest_returns200() throws Exception {
            // Arrange
            var request = new UpdateMemoRequest("本社出勤に変更", "早退予定");
            var response = new AttendanceRecordResponse(
                    RECORD_ID,
                    LocalDate.of(2025, 1, 15),
                    Instant.parse("2025-01-15T00:00:00Z"),
                    Instant.parse("2025-01-15T08:00:00Z"),
                    "本社出勤に変更",
                    "早退予定",
                    false
            );
            when(attendanceService.updateMemo(eq(RECORD_ID), any(UpdateMemoRequest.class), any(UUID.class)))
                    .thenReturn(response);

            // Act & Assert
            mockMvc.perform(patch("/api/attendance/{id}/memo", RECORD_ID)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.clockInMemo").value("本社出勤に変更"))
                    .andExpect(jsonPath("$.clockOutMemo").value("早退予定"));
        }

        @Test
        @DisplayName("メモが201文字を超えるとバリデーションエラー")
        void updateMemo_tooLongMemo_returns400() throws Exception {
            // Arrange
            var longMemo = "あ".repeat(201);
            var request = new UpdateMemoRequest(longMemo, null);

            // Act & Assert
            mockMvc.perform(patch("/api/attendance/{id}/memo", RECORD_ID)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }
    }
}
