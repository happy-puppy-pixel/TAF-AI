package com.estn.ilcsagentai;

import com.estn.ilcsagentai.entities.Etudiant;
import com.estn.ilcsagentai.repositories.EudiantRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class IlcsAgentAiApplication {

    public static void main(String[] args) {
        SpringApplication.run(IlcsAgentAiApplication.class, args);
    }

    @Bean
    CommandLineRunner init(EudiantRepository repo) {
        return args -> {
            repo.save(
                    new Etudiant().builder()
                            .apogee("123456")
                            .nom("ALAMI")
                            .prenom("KARIM")
                            .filiere("ILCS")
                            .niveau("1A")
                            .note(15.5)
                            .build()
            );
            repo.save(
                    new Etudiant().builder()
                            .apogee("123457")
                            .nom("AYDAR")
                            .prenom("OUSSAMA")
                            .filiere("ILCS")
                            .niveau("2A")
                            .note(16.5)
                            .build()
            );
            repo.save(
                    new Etudiant().builder()
                            .apogee("123458")
                            .nom("ESSALHI")
                            .prenom("YAHYA")
                            .filiere("ILCS")
                            .niveau("2A")
                            .note(17.5)
                            .build()
            );
            repo.save(
                    new Etudiant().builder()
                            .apogee("123459")
                            .nom("MAJJATI")
                            .prenom("ALAE")
                            .filiere("ILCS")
                            .niveau("2A")
                            .note(15.0)
                            .build()
            );
            repo.save(
                    new Etudiant().builder()
                            .apogee("123460")
                            .nom("BENNANI")
                            .prenom("MOHAMED")
                            .filiere("ILCS")
                            .niveau("1A")
                            .note(10.0)
                            .build()
            );
        };
    }
}
