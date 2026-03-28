package com.estn.ilcsagentai.controller;

import com.estn.ilcsagentai.agents.AiAgent;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Flux;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

@RestController
@CrossOrigin("*")
public class AiAgentController {

    @Autowired
    private AiAgent aiAgent;

    @GetMapping(value = "/askAgent", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> askAgent(@RequestParam(defaultValue = "Bonjour") String question) {
        return aiAgent.onQuestion(question);
    }

    @PostMapping(value = "/askAgentWithFile", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> askAgentWithFile(
            @RequestParam String question,
            @RequestParam(required = false) MultipartFile file) throws IOException {

        String fullQuestion = question;

        if (file != null && !file.isEmpty()) {
            String fileName = file.getOriginalFilename();
            String extractedText = "";

            if (fileName != null && fileName.toLowerCase().endsWith(".pdf")) {
                try (PDDocument document = Loader.loadPDF(file.getBytes())) {
                    PDFTextStripper stripper = new PDFTextStripper();
                    extractedText = stripper.getText(document);
                }
            }
            else {
                extractedText = new String(file.getBytes(), StandardCharsets.UTF_8);
            }

            fullQuestion = question + "\n\nContenu du fichier (" + fileName + "):\n" + extractedText;
        }

        return aiAgent.onQuestion(fullQuestion);
    }
}