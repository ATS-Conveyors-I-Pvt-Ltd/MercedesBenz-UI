package com.ats.mercedesbenz.repository;

import com.ats.mercedesbenz.entity.AndonSummaryQueue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Andon Summary Queue Repository
 * Based on iprod IprodAndonSummaryQueueDao pattern
 */
@Repository
public interface AndonSummaryQueueRepository extends JpaRepository<AndonSummaryQueue, Integer> {

    /**
     * Find by current shift (shift start <= now <= shift end)
     */
    @Query("SELECT a FROM AndonSummaryQueue a WHERE a.shiftStartTime <= :now AND a.shiftStopTime >= :now")
    List<AndonSummaryQueue> findCurrentShiftData(@Param("now") LocalDateTime now);

    /**
     * Find by line ID and current shift
     */
    @Query("SELECT a FROM AndonSummaryQueue a WHERE a.lineId = :lineId AND a.shiftStartTime <= :now AND a.shiftStopTime >= :now ORDER BY a.currDatetime")
    List<AndonSummaryQueue> findByLineIdAndCurrentShift(@Param("lineId") Integer lineId,
            @Param("now") LocalDateTime now);

    /**
     * Find by line ID and specific date
     */
    @Query("SELECT a FROM AndonSummaryQueue a WHERE a.lineId = :lineId AND CAST(a.currDatetime AS date) = CAST(:targetDate AS date)")
    List<AndonSummaryQueue> findByLineIdAndDate(@Param("lineId") Integer lineId,
            @Param("targetDate") LocalDateTime targetDate);

    /**
     * Find by date range
     */
    @Query("SELECT a FROM AndonSummaryQueue a WHERE CAST(a.currDatetime AS date) BETWEEN CAST(:fromDate AS date) AND CAST(:toDate AS date) ORDER BY a.currDatetime DESC")
    List<AndonSummaryQueue> findByDateRange(@Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate);

    /**
     * Update shift actuals
     */
    @Modifying
    @Query("UPDATE AndonSummaryQueue a SET a.shiftActuals = :actuals, a.updatedAt = :updatedAt WHERE a.andonStationSummaryQueueId = :id")
    int updateShiftActuals(@Param("id") Integer id, @Param("actuals") Integer actuals,
            @Param("updatedAt") LocalDateTime updatedAt);

    /**
     * Find time lost for current shift by line
     */
    @Query(value = "SELECT SUM(DATEDIFF(MINUTE, breakdown_start_time, ISNULL(breakdown_end_time, GETDATE()))) " +
            "FROM iprod_andon_summary_queue " +
            "WHERE line_id = :lineId " +
            "AND shift_start_time <= GETDATE() " +
            "AND shift_stop_time >= GETDATE() " +
            "AND breakdown_start_time IS NOT NULL", nativeQuery = true)
    Integer calculateTimeLostByLine(@Param("lineId") Integer lineId);
}
