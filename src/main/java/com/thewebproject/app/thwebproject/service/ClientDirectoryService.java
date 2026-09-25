package com.thewebproject.app.thwebproject.service;

import com.thewebproject.app.thwebproject.model.Client;
import jakarta.annotation.PostConstruct;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Loads the demo-site client roster from clients.csv (resources/clients.csv)
 * once at startup and serves lookups by numeric id.
 *
 * clients.csv columns: id,businessName,tagline,phone,email,address
 * To add/update clients, just edit clients.csv — no code changes needed.
 */
@Service
public class ClientDirectoryService {

    private final Map<Integer, Client> clientsById = new HashMap<>();

    @PostConstruct
    public void loadClients() {
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(new ClassPathResource("clients.csv").getInputStream(), StandardCharsets.UTF_8))) {

            String line = reader.readLine(); // header row, skip it
            while ((line = reader.readLine()) != null) {
                if (line.isBlank()) continue;
                String[] fields = parseCsvLine(line);
                if (fields.length < 6) continue;

                Client client = new Client(
                        Integer.parseInt(fields[0].trim()),
                        fields[1].trim(),
                        fields[2].trim(),
                        fields[3].trim(),
                        fields[4].trim(),
                        fields[5].trim()
                );
                clientsById.put(client.getId(), client);
            }
        } catch (IOException e) {
            throw new IllegalStateException("Failed to load clients.csv", e);
        }
    }

    public Optional<Client> findById(int id) {
        return Optional.ofNullable(clientsById.get(id));
    }

    // Minimal CSV parser that respects double-quoted fields (handles commas inside addresses).
    private String[] parseCsvLine(String line) {
        java.util.List<String> fields = new java.util.ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;

        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                fields.add(current.toString());
                current.setLength(0);
            } else {
                current.append(c);
            }
        }
        fields.add(current.toString());
        return fields.toArray(new String[0]);
    }
}
