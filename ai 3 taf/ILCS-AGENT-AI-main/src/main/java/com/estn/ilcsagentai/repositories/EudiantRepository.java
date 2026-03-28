package com.estn.ilcsagentai.repositories;

import com.estn.ilcsagentai.entities.Etudiant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EudiantRepository extends JpaRepository<Etudiant,String> {
    List<Etudiant> findByApogee(String apogee);
    List<Etudiant> findByFiliere(String filiere);
    List<Etudiant> findByNiveau(String niveau);
    List<Etudiant> findByFiliereAndNiveau(String filiere, String niveau);
    List<Etudiant> findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCase(String nom, String prenom);
}
