package com.estn.ilcsagentai.tools;

import com.estn.ilcsagentai.entities.Etudiant;
import com.estn.ilcsagentai.repositories.EudiantRepository;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AgentTools {
    @Autowired
    private EudiantRepository repo;

    @Tool(description = "récuperer les informations sur un étudiant par son apogee")
    List<Etudiant> getEtudiantParApogee(
            @ToolParam(description = "le apogée de l'étudiant") String apogee) {
        return repo.findByApogee(apogee);
    }

    @Tool(description = "récuperer les informations sur un étudiant par filière")
    List<Etudiant> getEtudiantParFiliere(
            @ToolParam(description = "le nom de la filière") String filiere) {
        return repo.findByFiliere(filiere);
    }

    @Tool(description = "récuperer les informations sur un étudiant par son nom ou prénom")
    List<Etudiant> getEtudiants(
            @ToolParam(description = "nom ou prénom d'un étudiant") String nomOuPrenom) {
        return repo.findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCase(nomOuPrenom, nomOuPrenom);
    }
}
