package com.estn.ilcsagentai.controller;


import com.estn.ilcsagentai.entities.Etudiant;
import com.estn.ilcsagentai.repositories.EudiantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin("*")
@RequestMapping("/etudiants")
public class EtudiantController {

    @Autowired
    private EudiantRepository repo;

    // GET /etudiants — tous les étudiants
    @GetMapping
    public List<Etudiant> getAll() {
        return repo.findAll();
    }

    // GET /etudiants/apogee/{apogee}
    @GetMapping("/apogee/{apogee}")
    public List<Etudiant> getByApogee(@PathVariable String apogee) {
        return repo.findByApogee(apogee);
    }

    // GET /etudiants/filiere/{filiere}
    @GetMapping("/filiere/{filiere}")
    public List<Etudiant> getByFiliere(@PathVariable String filiere) {
        return repo.findByFiliere(filiere);
    }

    // GET /etudiants/niveau/{niveau}
    @GetMapping("/niveau/{niveau}")
    public List<Etudiant> getByNiveau(@PathVariable String niveau) {
        return repo.findByNiveau(niveau);
    }

    // GET /etudiants/search?nom=ALAMI
    @GetMapping("/search")
    public List<Etudiant> searchByNom(@RequestParam String nom) {
        return repo.findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCase(nom, nom);
    }
}