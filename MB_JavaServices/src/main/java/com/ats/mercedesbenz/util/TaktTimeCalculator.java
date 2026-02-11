package com.ats.mercedesbenz.util;

import org.springframework.stereotype.Component;

/**
 * Takt Time Calculator
 * 
 * Takt Time = Available Production Time / Customer Demand
 * 
 * Formula: (Shift Duration in hours - Break Time) × 3600 / Target Production
 * Result is in seconds per unit
 */
@Component
public class TaktTimeCalculator {

    /**
     * Calculate takt time in seconds
     * 
     * @param shiftDurationHours Total shift duration in hours
     * @param breakTimeMinutes   Break time in minutes
     * @param targetProduction   Number of units to produce
     * @return Takt time in seconds per unit
     */
    public double calculateTaktTime(long shiftDurationHours, int breakTimeMinutes, int targetProduction) {
        if (targetProduction <= 0) {
            throw new IllegalArgumentException("Target production must be greater than zero");
        }

        // Convert shift duration to minutes
        long shiftMinutes = shiftDurationHours * 60;

        // Calculate available production time in minutes
        long availableMinutes = shiftMinutes - breakTimeMinutes;

        if (availableMinutes <= 0) {
            throw new IllegalArgumentException("Available production time must be greater than zero");
        }

        // Calculate takt time in seconds
        double taktTimeSeconds = (availableMinutes * 60.0) / targetProduction;

        return taktTimeSeconds;
    }

    /**
     * Calculate cycle time
     * Actual time taken to produce one unit
     * 
     * @param totalUnitsProduced        Total units produced
     * @param actualProductionTimeHours Actual production time in hours
     * @return Cycle time in seconds per unit
     */
    public double calculateCycleTime(int totalUnitsProduced, double actualProductionTimeHours) {
        if (totalUnitsProduced <= 0) {
            return 0;
        }

        double actualProductionTimeSeconds = actualProductionTimeHours * 3600;
        return actualProductionTimeSeconds / totalUnitsProduced;
    }

    /**
     * Calculate line efficiency
     * 
     * @param actualOutput  Actual production output
     * @param plannedOutput Planned production output
     * @return Efficiency percentage
     */
    public double calculateLineEfficiency(int actualOutput, int plannedOutput) {
        if (plannedOutput <= 0) {
            return 0;
        }

        return ((double) actualOutput / plannedOutput) * 100;
    }

    /**
     * Calculate OEE (Overall Equipment Effectiveness)
     * OEE = Availability × Performance × Quality
     * 
     * @param availability Availability percentage
     * @param performance  Performance percentage
     * @param quality      Quality percentage
     * @return OEE percentage
     */
    public double calculateOEE(double availability, double performance, double quality) {
        return (availability / 100) * (performance / 100) * (quality / 100) * 100;
    }

    /**
     * Calculate availability
     * 
     * @param operatingTimeMinutes Actual operating time
     * @param plannedTimeMinutes   Planned production time
     * @return Availability percentage
     */
    public double calculateAvailability(long operatingTimeMinutes, long plannedTimeMinutes) {
        if (plannedTimeMinutes <= 0) {
            return 0;
        }

        return ((double) operatingTimeMinutes / plannedTimeMinutes) * 100;
    }

    /**
     * Calculate performance
     * 
     * @param idealCycleTimeSeconds Ideal cycle time per unit
     * @param totalCount            Total units produced
     * @param operatingTimeMinutes  Operating time in minutes
     * @return Performance percentage
     */
    public double calculatePerformance(double idealCycleTimeSeconds, int totalCount, long operatingTimeMinutes) {
        if (operatingTimeMinutes <= 0) {
            return 0;
        }

        double operatingTimeSeconds = operatingTimeMinutes * 60;
        return ((idealCycleTimeSeconds * totalCount) / operatingTimeSeconds) * 100;
    }

    /**
     * Calculate quality rate
     * 
     * @param goodCount  Number of good units
     * @param totalCount Total units produced
     * @return Quality percentage
     */
    public double calculateQuality(int goodCount, int totalCount) {
        if (totalCount <= 0) {
            return 0;
        }

        return ((double) goodCount / totalCount) * 100;
    }
}
