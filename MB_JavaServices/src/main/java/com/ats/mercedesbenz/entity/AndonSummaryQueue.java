package com.ats.mercedesbenz.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Andon Summary Queue Entity
 * Maps to iprod_andon_summary_queue table
 */
@Entity
@Table(name = "iprod_andon_summary_queue")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AndonSummaryQueue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "andon_station_summary_queue_id")
    private Integer andonStationSummaryQueueId;

    @Column(name = "line_id")
    private Integer lineId;

    @Column(name = "station_id")
    private Integer stationId;

    @Column(name = "shift_id")
    private Integer shiftId;

    @Column(name = "shift_start_time")
    private LocalDateTime shiftStartTime;

    @Column(name = "shift_stop_time")
    private LocalDateTime shiftStopTime;

    @Column(name = "curr_datetime")
    private LocalDateTime currDatetime;

    @Column(name = "shift_target")
    private Integer shiftTarget;

    @Column(name = "shift_actuals")
    private Integer shiftActuals;

    @Column(name = "break_time")
    private Integer breakTime;

    @Column(name = "target_count")
    private Integer targetCount;

    @Column(name = "breakdown_start_time")
    private LocalDateTime breakdownStartTime;

    @Column(name = "breakdown_end_time")
    private LocalDateTime breakdownEndTime;

    @Column(name = "breakdown_reason")
    private String breakdownReason;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
