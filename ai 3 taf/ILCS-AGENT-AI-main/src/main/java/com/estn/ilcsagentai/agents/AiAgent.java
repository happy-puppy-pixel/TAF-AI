package com.estn.ilcsagentai.agents;

import com.estn.ilcsagentai.tools.AgentTools;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.client.advisor.SimpleLoggerAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestParam;
import reactor.core.publisher.Flux;

@Service
public class AiAgent {
    private ChatClient chatClient;

    public AiAgent(ChatClient.Builder chatClient,
                   ChatMemory memory,
                   AgentTools agentTools) {
        this.chatClient = chatClient
                .defaultAdvisors(
                        MessageChatMemoryAdvisor.builder(memory).build())
                .defaultAdvisors(new SimpleLoggerAdvisor())
                .defaultTools(agentTools)
                .build();
    }

    public Flux<String> onQuestion(String question) {
        return chatClient.prompt()
                .user(question)
                .stream()
                .content();

    }
}
