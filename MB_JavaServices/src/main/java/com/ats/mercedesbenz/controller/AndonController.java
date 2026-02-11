package com.ats.mercedesbenz.controller;

import com.ats.mercedesbenz.dto.AndonSummaryQueueDto;
import com.ats.mercedesbenz.dto.JsonResponseDto;
import com.ats.mercedesbenz.service.AndonService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Andon Summary Queue Controller
 * REST API endpoints matching iprod Action methods
 * 
 * @author ATS Conveyors I Pvt Ltd
 */
@RestController
@RequestMapping("/andon")
@RequiredArgsConstructor
@Slf4j
public class AndonController {

    private final AndonService andonService;

    /**
     * GET /api/andon/current-shift
     * Get current shift details for all lines
     */
    @GetMapping("/current-shift")
    public ResponseEntity<JsonResponseDto<List<AndonSummaryQueueDto>>> getCurrentShiftDetails() {
        log.info("API Request: GET /api/andon/current-shift");
        JsonResponseDto<List<AndonSummaryQueueDto>> response = andonService.getCurrentShiftDetails();
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/andon/day-wise
     * Get day-wise andon data for specific line and date
     * 
     * @param lineId Line ID
     * @param date   Date (optional, defaults to today)
     */
    @GetMapping("/day-wise")
    public ResponseEntity<JsonResponseDto<List<AndonSummaryQueueDto>>> getDayWiseAndonData(
            @RequestParam Integer lineId,
            @RequestParam(required = false) @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDateTime date) {

        LocalDateTime targetDate = date != null ? date : LocalDateTime.now();
        log.info("API Request: GET /api/andon/day-wise - lineId: {}, date: {}", lineId, targetDate);

        JsonResponseDto<List<AndonSummaryQueueDto>> response = andonService.getDayWiseAndonData(lineId, targetDate);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/andon/update-actuals
     * Update shift actuals for a specific record
     */
    @PostMapping("/update-actuals")
    public ResponseEntity<JsonResponseDto<String>> updateActuals(@RequestBody UpdateActualsRequest request) {
        log.info("API Request: POST /api/andon/update-actuals - id: {}, actuals: {}",
                request.getAndonStationSummaryQueueId(), request.getShiftActuals());

        JsonResponseDto<String> response = andonService.updateAndonSummaryQueueDetails(
                request.getAndonStationSummaryQueueId(),
                request.getShiftActuals());

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/andon/filter
     * Get filtered data by date range
     */
    @GetMapping("/filter")
    public ResponseEntity<JsonResponseDto<List<AndonSummaryQueueDto>>> getFilteredData(
            @RequestParam @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDateTime fromDate,
            @RequestParam @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDateTime toDate) {

        log.info("API Request: GET /api/andon/filter - fromDate:{}, toDate: {}", fromDate, toDate);

        JsonResponseDto<List<AndonSummaryQueueDto>> response = andonService.getFilteredData(fromDate, toDate);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/andon/time-lost
     * Calculate time lost for a specific line in current shift
     */
    @GetMapping("/time-lost")
    public ResponseEntity<JsonResponseDto<Integer>> getTimeLost(@RequestParam Integer lineId) {
        log.info("API Request: GET /api/andon/time-lost - lineId: {}", lineId);

        JsonResponseDto<Integer> response = andonService.getLineTimeLost(lineId);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/andon/takt-time
     * Calculate takt time for a specific line
     */
    @GetMapping("/takt-time")
    public ResponseEntity<JsonResponseDto<AndonSummaryQueueDto>> getTaktTime(@RequestParam Integer lineId) {
        log.info("API Request: GET /api/andon/takt-time - lineId: {}", lineId);

        JsonResponseDto<AndonSummaryQueueDto> response = andonService.calculateTaktTime(lineId);
        return ResponseEntity.ok(response);
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Andon Service is running!");
    }

    // DTO for update request
    @lombok.Data
    public static class UpdateActualsRequest {
        private Integer andonStationSummaryQueueId;
        private Integer shiftActuals;
    }
}
