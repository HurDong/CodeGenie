package com.codetest.agent.controller;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ProblemController {

    @GetMapping("/parse")
    public ResponseEntity<Map<String, String>> parseProblem(@RequestParam String url, @RequestParam String platform) {
        Map<String, String> response = new HashMap<>();
        try {
            String content = "";
            if ("baekjoon".equalsIgnoreCase(platform)) {
                content = parseBaekjoon(url);
            } else if ("programmers".equalsIgnoreCase(platform)) {
                content = parseProgrammers(url);
            } else {
                response.put("error", "Unsupported platform: " + platform);
                return ResponseEntity.badRequest().body(response);
            }

            response.put("content", content);
            return ResponseEntity.ok(response);

        } catch (Throwable e) {
            e.printStackTrace();
            response.put("error", "Failed to parse problem: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    private String parseBaekjoon(String url) throws IOException {
        // Basic validation for BOJ URL
        if (!url.contains("acmicpc.net/problem/")) {
             // Handle case where user just inputs the problem ID
             if (url.matches("\\d+")) {
                 url = "https://www.acmicpc.net/problem/" + url;
             } else {
                 throw new IllegalArgumentException("Invalid Baekjoon URL or Problem ID");
             }
        }

        Document doc = Jsoup.connect(url)
                .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
                .get();

        StringBuilder sb = new StringBuilder();
        
        Element titleElement = doc.selectFirst("#problem_title");
        if (titleElement != null) {
            sb.append("Title: ").append(titleElement.text()).append("\n\n");
        }

        Element description = doc.selectFirst("#problem_description");
        if (description != null) {
            sb.append("Description:\n").append(description.text()).append("\n\n");
        }

        Element inputDesc = doc.selectFirst("#problem_input");
        if (inputDesc != null) {
            sb.append("Input:\n").append(inputDesc.text()).append("\n\n");
        }

        Element outputDesc = doc.selectFirst("#problem_output");
        if (outputDesc != null) {
            sb.append("Output:\n").append(outputDesc.text()).append("\n\n");
        }
        
        // Sample inputs and outputs
        Elements sampleInputs = doc.select("[id^=sample-input-]");
        Elements sampleOutputs = doc.select("[id^=sample-output-]");
        
        for (int i = 0; i < sampleInputs.size(); i++) {
            sb.append("Sample Input ").append(i + 1).append(":\n");
            sb.append(sampleInputs.get(i).text()).append("\n");
            if (i < sampleOutputs.size()) {
                sb.append("Sample Output ").append(i + 1).append(":\n");
                sb.append(sampleOutputs.get(i).text()).append("\n");
            }
            sb.append("\n");
        }

        return sb.toString();
    }

    private String parseProgrammers(String url) throws IOException {
        // Programmers parsing is more complex due to dynamic content, 
        // but let's try to get what we can from the meta tags or basic structure if possible.
        // Note: Programmers often renders content via JS, so Jsoup might not get everything.
        // However, for this task, we will try a best-effort approach.
        
        Document doc = Jsoup.connect(url)
                .userAgent("Mozilla/5.0")
                .get();
        
        // This is a placeholder as Programmers structure varies and is JS-heavy.
        // We might just return the title and a note.
        
        StringBuilder sb = new StringBuilder();
        String title = doc.title();
        sb.append("Title: ").append(title).append("\n\n");
        
        // Try to find the problem description container
        // Programmers usually has a div with class 'guide-section-description' or similar
        Element description = doc.selectFirst(".guide-section-description");
        if (description != null) {
             sb.append("Description:\n").append(description.text()).append("\n\n");
        } else {
            sb.append("Could not retrieve full description (Programmers problems may require a browser to view).\n");
        }
        
        return sb.toString();
    }
}
