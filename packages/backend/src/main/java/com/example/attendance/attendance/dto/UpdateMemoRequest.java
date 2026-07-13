package com.example.attendance.attendance.dto;

import jakarta.validation.constraints.Size;

public record UpdateMemoRequest(
    @Size(max = 200) String clockInMemo,
    @Size(max = 200) String clockOutMemo
) {}
