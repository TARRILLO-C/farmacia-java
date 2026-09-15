package com.farmacia.sgf.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "configuracion")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Configuracion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 255)
    private String logoUrl;

    @Column(columnDefinition = "TEXT")
    private String sliderJson;
}
