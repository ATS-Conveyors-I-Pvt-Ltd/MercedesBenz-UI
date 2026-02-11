package com.ats.mercedesbenz.service;

import com.ats.mercedesbenz.dto.AndonSummaryQueueDto;
import com.ats.mercedesbenz.dto.JsonResponseDto;
import com.ats.mercedesbenz.entity.AndonSummaryQueue;
import com.ats.mercedesbenz.exception.ResourceNotFoundException;
import com.ats.mercedesbenz.repository.AndonSummaryQueueRepository;
import com.ats.mercedesbenz.util.TaktTimeCalculator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Andon Service - Business Logic
 * Based on iprod IprodAndonSummaryQueueAction pattern
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AndonService {

    private final AndonSummaryQueueRepository repository;
    private final TaktTimeCalculator taktTimeCalculator;

    /**
     * Get all day-wise andon data for a specific line
     * Maps to: getAllDayWiseAndonDataDetails()
     */
    public JsonResponseDto<List<AndonSummaryQueueDto>> getDayWiseAndonData(Integer lineId, LocalDateTime date) {
        try {
            log.info("Fetching day-wise andon data for lineId: {} on date: {}", lineId, date);

            List<AndonSummaryQueue> data = repository.findByLineIdAndDate(lineId, date);

            if (data.isEmpty()) {
                return JsonResponseDto.error("There is no Andon Summary Queue to be displayed.");
            }

            List<AndonSummaryQueueDto> dtoList = data.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());

            return JsonResponseDto.success(dtoList);

        } catch (Exception e) {
            log.error("Error in getDayWiseAndonData: {}", e.getMessage(), e);
            return JsonResponseDto
                    .error("iPROD Web App have some problems during function call. Please contact iPROD Administrator");
        }
    }

    /**
     * Get current shift details
     * Maps to: getCurrentShiftDetails()
     */
    public JsonResponseDto<List<AndonSummaryQueueDto>> getCurrentShiftDetails() {
        try {
            log.info("Fetching current shift details");

            LocalDateTime now = LocalDateTime.now();
            List<AndonSummaryQueue> data = repository.findCurrentShiftData(now);

            if (data.isEmpty()) {
                return JsonResponseDto.error("There is no data to be displayed.");
            }

            List<AndonSummaryQueueDto> dtoList = data.stream()
                    .map(this::convertToDto)
                    .map(this::enrichWithTaktTime)
                    .collect(Collectors.toList());

            return JsonResponseDto.success(dtoList);

        } catch (Exception e) {
            log.error("Error in getCurrentShiftDetails: {}", e.getMessage(), e);
            return JsonResponseDto
                    .error("iPROD Web App have some problems during function call. Please contact iPROD Administrator");
        }
    }

    /**
     * Update andon summary queue details (actuals)
     * Maps to: updateAndonSummaryQueueDetails()
     */
    @Transactional
    public JsonResponseDto<String> updateAndonSummaryQueueDetails(Integer id, Integer shiftActuals) {
        try {
            log.info("Updating actuals for id: {} with value: {}", id, shiftActuals);

            int updated = repository.updateShiftActuals(id, shiftActuals, LocalDateTime.now());

            if (updated > 0) {
                return JsonResponseDto.success("Actual successfully updated", null);
            } else {
                return JsonResponseDto.error("Record not found or update failed");
            }

        } catch (Exception e) {
            log.error("Error in updateAndonSummaryQueueDetails: {}", e.getMessage(), e);
            return JsonResponseDto.error("Update Actual operation not completed. Please try again.");
        }
    }

    /**
     * Get filtered actuals data
     * Maps to: getActualFilterWise()
     */
    public JsonResponseDto<List<AndonSummaryQueueDto>> getFilteredData(LocalDateTime fromDate, LocalDateTime toDate) {
        try {
            log.info("Fetching filtered data from {} to {}", fromDate, toDate);

            List<AndonSummaryQueue> data = repository.findByDateRange(fromDate, toDate);

            List<AndonSummaryQueueDto> dtoList = data.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());

            return JsonResponseDto.success(dtoList);

        } catch (Exception e) {
            log.error("Error in getFilteredData: {}", e.getMessage(), e);
            return JsonResponseDto
                    .error("iPROD Web App have some problems during function call. Please contact iPROD Administrator");
        }
    }

    /**
     * Get line time lost
     * Maps to: getLineTimeLost()
     */
    public JsonResponseDto<Integer> getLineTimeLost(Integer lineId) {
        try {
            log.info("Calculating time lost for lineId: {}", lineId);

            Integer timeLost = repository.calculateTimeLostByLine(lineId);

            if (timeLost == null || timeLost == 0) {
                return JsonResponseDto.error("There is no data to be displayed.");
            }

            return JsonResponseDto.success(timeLost);

        } catch (Exception e) {
            log.error("Error in getLineTimeLost: {}", e.getMessage(), e);
            return JsonResponseDto
                    .error("iPROD Web App have some problems during function call. Please contact iPROD Administrator");
        }
    }

    /**
     * Calculate takt time for a line
     */
    public JsonResponseDto<AndonSummaryQueueDto> calculateTaktTime(Integer lineId) {
        try {
            log.info("Calculating takt time for lineId: {}", lineId);

            LocalDateTime now = LocalDateTime.now();
            List<AndonSummaryQueue> data = repository.findByLineIdAndCurrentShift(lineId, now);

            if (data.isEmpty()) {
                throw new ResourceNotFoundException("No data found for line: " + lineId);
            }

            AndonSummaryQueue entity = data.get(0);
            AndonSummaryQueueDto dto = convertToDto(entity);
            dto = enrichWithTaktTime(dto);

            return JsonResponseDto.success(dto);

        } catch (Exception e) {
            log.error("Error in calculateTaktTime: {}", e.getMessage(), e);
            return JsonResponseDto.error("Error calculating takt time");
        }
    }

    /**
     * Convert Entity to DTO
     */
    private AndonSummaryQueueDto convertToDto(AndonSummaryQueue entity) {
        return AndonSummaryQueueDto.builder()
                .andonStationSummaryQueueId(entity.getAndonStationSummaryQueueId())
                .lineId(entity.getLineId())
                .stationId(entity.getStationId())
                .shiftId(entity.getShiftId())
                .shiftStartTime(entity.getShiftStartTime())
                .shiftStopTime(entity.getShiftStopTime())
                .currDatetime(entity.getCurrDatetime())
                .shiftTarget(entity.getShiftTarget())
                .shiftActuals(entity.getShiftActuals())
                .breakTime(entity.getBreakTime())
                .targetCount(entity.getTargetCount())
                .breakdownStartTime(entity.getBreakdownStartTime())
                .breakdownEndTime(entity.getBreakdownEndTime())
                .breakdownReason(entity.getBreakdownReason())
                .build();
    }

    /**
     * Enrich DTO with takt time calculations
     */
    private AndonSummaryQueueDto enrichWithTaktTime(AndonSummaryQueueDto dto) {
        if (dto.getShiftStartTime() != null && dto.getShiftStopTime() != null && dto.getShiftTarget() != null) {
            Duration shiftDuration = Duration.between(dto.getShiftStartTime(), dto.getShiftStopTime());
            long shiftHours = shiftDuration.toHours();
            int breakTime = dto.getBreakTime() != null ? dto.getBreakTime() : 0;

            double taktTime = taktTimeCalculator.calculateTaktTime(shiftHours, breakTime, dto.getShiftTarget());
            dto.setTaktTimeSeconds(taktTime);

            // Calculate line efficiency
            if (dto.getShiftActuals() != null && dto.getShiftTarget() > 0) {
                double efficiency = ((double) dto.getShiftActuals() / dto.getShiftTarget()) * 100;
                dto.setLineEfficiency(efficiency);
            }
        }

        return dto;
    }
}
