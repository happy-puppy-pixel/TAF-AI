package com.estn.ilcsagentai.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.*;

@Entity
@AllArgsConstructor @NoArgsConstructor
@Getter @Setter
@Builder
public class Etudiant {
    @Id
    private String apogee;
    private String nom;
    private String prenom;
    private String filiere;
    private String niveau;
    private double note;
}
