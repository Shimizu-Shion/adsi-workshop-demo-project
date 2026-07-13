package com.example.attendance.attendance.service;

import com.example.attendance.attendance.dto.AttendanceRecordResponse;
import com.example.attendance.attendance.dto.ClockInRequest;
import com.example.attendance.attendance.dto.ClockOutRequest;
import com.example.attendance.attendance.dto.UpdateMemoRequest;
import com.example.attendance.attendance.entity.AttendanceRecord;
import com.example.attendance.attendance.repository.AttendanceRecordRepository;
import com.example.attendance.department.entity.Department;
import com.example.attendance.employee.entity.Employee;
import com.example.attendance.employee.entity.Role;
import com.example.attendance.employee.repository.EmployeeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AttendanceMemoServiceTest {

    private static final Instant FIXED_INSTANT = Instant.parse("2025-01-15T00:00:00Z");
    private static final ZoneId ZONE_TOKYO = ZoneId.of("Asia/Tokyo");
    private static final LocalDate TODAY_TOKYO = LocalDate.of(2025, 1, 15);

    @Mock
    private AttendanceRecordRepository attendanceRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    private AttendanceServiceImpl service;

    private Employee employee;
    private Employee otherEmployee;

    @BeforeEach
    void setUp() {
        var clock = Clock.fixed(FIXED_INSTANT, ZONE_TOKYO);
        service = new AttendanceServiceImpl(attendanceRepository, employeeRepository, clock);

        var department = Department.builder()
                .id(UUID.randomUUID())
                .name("Engineering")
                .build();

        employee = Employee.builder()
                .id(UUID.randomUUID())
                .name("田中太郎")
                .email("tanaka@example.com")
                .password("hashed")
                .department(department)
                .role(Role.EMPLOYEE)
                .isManager(false)
                .hireDate(LocalDate.of(2024, 4, 1))
                .build();

        otherEmployee = Employee.builder()
                .id(UUID.randomUUID())
                .name("佐藤花子")
                .email("sato@example.com")
                .password("hashed")
                .department(department)
                .role(Role.EMPLOYEE)
                .isManager(false)
                .hireDate(LocalDate.of(2024, 4, 1))
                .build();
    }

    @Nested
    @DisplayName("出勤打刻 - メモ付き")
    class ClockInWithMemo {

        @Test
        @DisplayName("出勤メモ付きで打刻するとメモが記録される")
        void clockIn_withMemo_savesMemo() {
            // Arrange
            var request = new ClockInRequest(employee.getId(), "在宅勤務");
            when(employeeRepository.findById(employee.getId())).thenReturn(Optional.of(employee));
            when(attendanceRepository.save(any(AttendanceRecord.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            // Act
            var result = service.clockIn(request);

            // Assert
            assertThat(result.clockInMemo()).isEqualTo("在宅勤務");

            var captor = ArgumentCaptor.forClass(AttendanceRecord.class);
            verify(attendanceRepository).save(captor.capture());
            assertThat(captor.getValue().getClockInMemo()).isEqualTo("在宅勤務");
        }

        @Test
        @DisplayName("メモなしで出勤打刻するとメモがnullになる")
        void clockIn_withoutMemo_memoIsNull() {
            // Arrange
            var request = new ClockInRequest(employee.getId(), null);
            when(employeeRepository.findById(employee.getId())).thenReturn(Optional.of(employee));
            when(attendanceRepository.save(any(AttendanceRecord.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            // Act
            var result = service.clockIn(request);

            // Assert
            assertThat(result.clockInMemo()).isNull();
        }
    }

    @Nested
    @DisplayName("退勤打刻 - メモ付き")
    class ClockOutWithMemo {

        @Test
        @DisplayName("退勤メモ付きで打刻するとメモが記録される")
        void clockOut_withMemo_savesMemo() {
            // Arrange
            var request = new ClockOutRequest(employee.getId(), "明日は客先直行");
            var openRecord = AttendanceRecord.builder()
                    .id(UUID.randomUUID())
                    .employee(employee)
                    .workDate(TODAY_TOKYO)
                    .clockIn(Instant.parse("2025-01-14T23:00:00Z"))
                    .build();
            when(attendanceRepository.findByEmployeeIdAndWorkDateAndClockOutIsNull(employee.getId(), TODAY_TOKYO))
                    .thenReturn(Optional.of(openRecord));
            when(attendanceRepository.save(any(AttendanceRecord.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            // Act
            var result = service.clockOut(request);

            // Assert
            assertThat(result.clockOutMemo()).isEqualTo("明日は客先直行");

            var captor = ArgumentCaptor.forClass(AttendanceRecord.class);
            verify(attendanceRepository).save(captor.capture());
            assertThat(captor.getValue().getClockOutMemo()).isEqualTo("明日は客先直行");
        }

        @Test
        @DisplayName("メモなしで退勤打刻するとメモがnullになる")
        void clockOut_withoutMemo_memoIsNull() {
            // Arrange
            var request = new ClockOutRequest(employee.getId(), null);
            var openRecord = AttendanceRecord.builder()
                    .id(UUID.randomUUID())
                    .employee(employee)
                    .workDate(TODAY_TOKYO)
                    .clockIn(Instant.parse("2025-01-14T23:00:00Z"))
                    .build();
            when(attendanceRepository.findByEmployeeIdAndWorkDateAndClockOutIsNull(employee.getId(), TODAY_TOKYO))
                    .thenReturn(Optional.of(openRecord));
            when(attendanceRepository.save(any(AttendanceRecord.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            // Act
            var result = service.clockOut(request);

            // Assert
            assertThat(result.clockOutMemo()).isNull();
        }
    }

    @Nested
    @DisplayName("メモ編集")
    class UpdateMemo {

        @Test
        @DisplayName("本人のレコードのメモを編集できる")
        void updateMemo_ownRecord_updatesSuccessfully() {
            // Arrange
            var recordId = UUID.randomUUID();
            var record = AttendanceRecord.builder()
                    .id(recordId)
                    .employee(employee)
                    .workDate(TODAY_TOKYO)
                    .clockIn(FIXED_INSTANT)
                    .clockInMemo("在宅勤務")
                    .build();
            var request = new UpdateMemoRequest("本社出勤に変更", "早退予定");
            when(attendanceRepository.findById(recordId)).thenReturn(Optional.of(record));
            when(attendanceRepository.save(any(AttendanceRecord.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            // Act
            var result = service.updateMemo(recordId, request, employee.getId());

            // Assert
            assertThat(result.clockInMemo()).isEqualTo("本社出勤に変更");
            assertThat(result.clockOutMemo()).isEqualTo("早退予定");
        }

        @Test
        @DisplayName("他人のレコードを編集しようとすると403エラー")
        void updateMemo_otherRecord_throwsForbidden() {
            // Arrange
            var recordId = UUID.randomUUID();
            var record = AttendanceRecord.builder()
                    .id(recordId)
                    .employee(employee)
                    .workDate(TODAY_TOKYO)
                    .clockIn(FIXED_INSTANT)
                    .build();
            var request = new UpdateMemoRequest("悪意のある編集", null);
            when(attendanceRepository.findById(recordId)).thenReturn(Optional.of(record));

            // Act & Assert
            assertThatThrownBy(() -> service.updateMemo(recordId, request, otherEmployee.getId()))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("403");
        }

        @Test
        @DisplayName("存在しないレコードを編集しようとすると404エラー")
        void updateMemo_notFound_throwsNotFound() {
            // Arrange
            var recordId = UUID.randomUUID();
            var request = new UpdateMemoRequest("メモ", null);
            when(attendanceRepository.findById(recordId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> service.updateMemo(recordId, request, employee.getId()))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("404");
        }
    }

    @Nested
    @DisplayName("退勤後の再出勤")
    class ReClockIn {

        @Test
        @DisplayName("退勤済みの状態で再出勤できる（新レコードが作成される）")
        void clockIn_afterClockOut_createsNewRecord() {
            // Arrange
            var request = new ClockInRequest(employee.getId(), "午後出勤");
            when(employeeRepository.findById(employee.getId())).thenReturn(Optional.of(employee));
            when(attendanceRepository.findByEmployeeIdAndWorkDateAndClockOutIsNull(employee.getId(), TODAY_TOKYO))
                    .thenReturn(Optional.empty());
            when(attendanceRepository.save(any(AttendanceRecord.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            // Act
            var result = service.clockIn(request);

            // Assert
            assertThat(result.workDate()).isEqualTo(TODAY_TOKYO);
            assertThat(result.clockIn()).isEqualTo(FIXED_INSTANT);
            assertThat(result.clockInMemo()).isEqualTo("午後出勤");

            var captor = ArgumentCaptor.forClass(AttendanceRecord.class);
            verify(attendanceRepository).save(captor.capture());
            assertThat(captor.getValue().getEmployee().getId()).isEqualTo(employee.getId());
        }
    }
}
