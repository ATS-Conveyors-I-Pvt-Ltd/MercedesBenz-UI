package com.ats.mercedesbenz;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

/**
 * Mercedes-Benz Digital Assembly Platform - Main Application
 * 
 * @author ATS Conveyors I Pvt Ltd
 * @version 1.0.0
 * @since 2026-02-11
 */
@SpringBootApplication
@EnableConfigurationProperties
public class MercedesBenzApplication {

    public static void main(String[] args) {
        SpringApplication.run(MercedesBenzApplication.class, args);
        System.out.println("========================================");
        System.out.println("Mercedes-Benz Digital Assembly Platform");
        System.out.println("Backend Services Started Successfully");
        System.out.println("Developed by: ATS Conveyors I Pvt Ltd");
        System.out.println("========================================");
    }
}
