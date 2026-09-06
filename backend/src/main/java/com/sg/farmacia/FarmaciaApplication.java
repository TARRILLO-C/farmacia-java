package com.sg.farmacia;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = {"com.sg.farmacia", "com.farmacia.sgf"})
@EntityScan(basePackages = {"com.farmacia.sgf.model", "com.sg.farmacia"})
@EnableJpaRepositories(basePackages = {"com.farmacia.sgf.repository", "com.sg.farmacia"})
public class FarmaciaApplication {

	public static void main(String[] args) {
		SpringApplication.run(FarmaciaApplication.class, args);
	}

}
