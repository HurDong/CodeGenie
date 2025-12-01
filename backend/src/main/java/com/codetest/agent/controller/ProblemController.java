package com.codetest.agent.controller;

import com.codetest.agent.dto.Example;
import com.codetest.agent.dto.ProblemSpec;
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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ProblemController {

    @GetMapping("/parse")
    public ResponseEntity<?> parseProblem(@RequestParam String url, @RequestParam String platform) {
        try {
            ProblemSpec spec;
            if ("baekjoon".equalsIgnoreCase(platform)) {
                spec = parseBaekjoon(url);
            } else if ("programmers".equalsIgnoreCase(platform)) {
                spec = parseProgrammers(url);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Unsupported platform: " + platform);
                return ResponseEntity.badRequest().body(error);
            }

            return ResponseEntity.ok(spec);

        } catch (Throwable e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to parse problem: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    private ProblemSpec parseBaekjoon(String url) throws IOException {
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
                .userAgent(
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
                .get();

        ProblemSpec spec = new ProblemSpec();
        spec.setSource("BAEKJOON");
        spec.setSourceId(url.substring(url.lastIndexOf("/") + 1));

        Element titleElement = doc.selectFirst("#problem_title");
        if (titleElement != null) {
            spec.setTitle(titleElement.text());
        }

        // Parse Time/Memory Limits from the table
        Element infoTable = doc.selectFirst("#problem-info");
        if (infoTable != null) {
            Elements rows = infoTable.select("tr");
            if (!rows.isEmpty()) {
                // Usually the first row has headers, second row has values
                // Or headers are th, values are td
                // BOJ structure:
                // <thead><tr><th>시간 제한</th><th>메모리 제한</th>...</tr></thead>
                // <tbody><tr><td>1 초</td><td>128 MB</td>...</tr></tbody>
                Element timeLimit = infoTable.selectFirst("td:nth-child(1)");
                if (timeLimit != null)
                    spec.setTimeLimit(timeLimit.text());

                Element memoryLimit = infoTable.selectFirst("td:nth-child(2)");
                if (memoryLimit != null)
                    spec.setMemoryLimit(memoryLimit.text());
            }
        }

        Element description = doc.selectFirst("#problem_description");
        if (description != null) {
            spec.setDescription(getFormattedText(description));
        }

        Element inputDesc = doc.selectFirst("#problem_input");
        if (inputDesc != null) {
            spec.setInputFormat(getFormattedText(inputDesc));
        }

        Element outputDesc = doc.selectFirst("#problem_output");
        if (outputDesc != null) {
            spec.setOutputFormat(getFormattedText(outputDesc));
        }

        // Constraints (Hint or Limit) - BOJ usually puts limits in the table, but
        // sometimes there are specific constraints in text
        // Usually 'problem_limit' doesn't exist as a standard ID, constraints are often
        // in Description or Input section.
        // But let's check if there is a specific section.
        // Sometimes there is a 'hint' section
        Element hint = doc.selectFirst("#problem_hint");
        if (hint != null) {
            spec.setConstraints(getFormattedText(hint)); // Using constraints field for hint/notes if available
        }

        // Sample inputs and outputs
        List<Example> examples = new ArrayList<>();
        Elements sampleInputs = doc.select("[id^=sample-input-]");
        Elements sampleOutputs = doc.select("[id^=sample-output-]");

        for (int i = 0; i < sampleInputs.size(); i++) {
            Example example = new Example();
            example.setInput(sampleInputs.get(i).text());

            if (i < sampleOutputs.size()) {
                example.setOutput(sampleOutputs.get(i).text());
            }
            examples.add(example);
        }
        spec.setExamples(examples);

        return spec;
    }

    private ProblemSpec parseProgrammers(String url) throws IOException {
        Document doc = Jsoup.connect(url)
                .userAgent(
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
                .referrer("https://school.programmers.co.kr/")
                .get();

        ProblemSpec spec = new ProblemSpec();
        spec.setSource("PROGRAMMERS");
        spec.setTitle(doc.title());

        Element container = doc.selectFirst(".guide-section-description");
        if (container != null) {
            // 1. Try to parse Examples table first (it's usually reliable)
            List<Example> examples = new ArrayList<>();
            Element table = container.selectFirst("table");
            if (table != null) {
                examples.addAll(parseProgrammersExamples(table));
            }
            spec.setExamples(examples);
            if (!examples.isEmpty()) {
                spec.setInputFormat("See examples below.");
                spec.setOutputFormat("See examples below.");
            }

            // 2. Try structured parsing for Description and Constraints
            StringBuilder descriptionBuilder = new StringBuilder();
            StringBuilder constraintsBuilder = new StringBuilder();

            boolean foundConstraints = false;
            String currentSection = "DESCRIPTION";

            for (Element child : container.children()) {
                String text = child.text().trim();

                // Skip the table if we already parsed it
                if (child.tagName().equals("table"))
                    continue;

                // Header detection
                boolean isHeader = child.tagName().matches("h[1-6]") || child.tagName().equals("strong")
                        || text.equals("제한사항") || text.equals("제한 사항")
                        || text.startsWith("입출력 예");

                if (isHeader) {
                    if (text.contains("제한사항") || text.contains("제한 사항")) {
                        currentSection = "CONSTRAINTS";
                        foundConstraints = true;
                        continue;
                    } else if (text.contains("입출력 예")) {
                        currentSection = "EXAMPLES"; // We already parsed table, so just ignore or capture text
                        continue;
                    } else if (text.contains("문제 설명")) {
                        currentSection = "DESCRIPTION";
                        continue;
                    }
                }

                if ("DESCRIPTION".equals(currentSection)) {
                    descriptionBuilder.append(getFormattedText(child)).append("\n");
                } else if ("CONSTRAINTS".equals(currentSection)) {
                    String formatted = getFormattedText(child);
                    if (!formatted.startsWith("-") && !formatted.isEmpty()) {
                        constraintsBuilder.append("- ").append(formatted).append("\n");
                    } else {
                        constraintsBuilder.append(formatted).append("\n");
                    }
                }
            }

            spec.setDescription(descriptionBuilder.toString().trim());
            spec.setConstraints(constraintsBuilder.toString().trim());

            // 3. Fallback: If constraints are empty, try splitting the full text
            if (!foundConstraints || spec.getConstraints().isEmpty()) {
                String fullText = getFormattedText(container);

                // Simple regex split
                String[] parts = fullText.split("제한사항|제한 사항");
                if (parts.length > 1) {
                    spec.setDescription(parts[0].trim());

                    String rest = parts[1];
                    String[] constraintParts = rest.split("입출력 예");
                    if (constraintParts.length > 0) {
                        spec.setConstraints(constraintParts[0].trim());
                    }
                }
            }

        } else {
            spec.setDescription(
                    "Could not retrieve full description (Programmers problems may require a browser to view).");
        }

        return spec;
    }

    private List<Example> parseProgrammersExamples(Element table) {
        List<Example> examples = new ArrayList<>();
        Elements rows = table.select("tr");

        if (rows.size() > 1) {
            for (int i = 1; i < rows.size(); i++) {
                Element row = rows.get(i);
                Elements cols = row.select("td");

                if (cols.isEmpty())
                    continue;

                Example example = new Example();

                String output = cols.last().text();
                example.setOutput(output);

                StringBuilder inputBuilder = new StringBuilder();
                for (int j = 0; j < cols.size() - 1; j++) {
                    if (j > 0)
                        inputBuilder.append(", ");
                    inputBuilder.append(cols.get(j).text());
                }
                example.setInput(inputBuilder.toString());

                examples.add(example);
            }
        }
        return examples;
    }

    private String getFormattedText(Element element) {
        if (element == null)
            return "";
        Element clone = element.clone();

        // Use placeholders for formatting
        clone.select("br").after("{{NEWLINE}}");
        clone.select("p").before("{{NEWLINE}}{{NEWLINE}}");
        clone.select("pre").before("{{NEWLINE}}```{{NEWLINE}}").after("{{NEWLINE}}```{{NEWLINE}}");
        clone.select("li").before("{{NEWLINE}}- ");
        clone.select("tr").before("{{NEWLINE}}");
        clone.select("td, th").after(" ");

        // Handle images
        for (Element img : clone.select("img")) {
            img.replaceWith(new org.jsoup.nodes.TextNode("[Image]"));
        }

        String text = clone.text();
        return text.replace("{{NEWLINE}}", "\n").trim();
    }
}
