package com.ats.mercedesbenz.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Andon Summary Queue DTO
 * Based on iprod IprodAndonSummaryQueue
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AndonSummaryQueueDto {

    private Integer andonStationSummaryQueueId;
    private Integer lineId;
    private String lineName;
    private Integer stationId;
    private String stationName;
    private Integer shiftId;
    private String shiftName;

    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime shiftStartTime;

    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime shiftStopTime;

    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime currDatetime;

    private Integer shiftTarget;
    private Integer shiftActuals;
    private Integer breakTime;
    private Integer targetCount;

    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime breakdownStartTime;

    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime breakdownEndTime;

    private String breakdownReason;

    // Filter fields
    @JsonFormat(pattern = "dd-MM-yyyy")
    private String fromDate;

    @JsonFormat(pattern = "dd-MM-yyyy")
    private String toDate;

    // Calculated fields
    private Double taktTimeSeconds;
    private Double cycleTimeSeconds;
    private Double lineEfficiency;
    private Integer timeLostMinutes;
}
