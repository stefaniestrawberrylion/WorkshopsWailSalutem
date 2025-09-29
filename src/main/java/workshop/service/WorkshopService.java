package workshop.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import workshop.data.WorkshopRepository;
import workshop.domain.Workshop;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Arrays;
import java.util.stream.Collectors;


@Service
public class WorkshopService {

    private final WorkshopRepository workshopRepository;

    private final Path uploadDir = Paths.get(System.getProperty("user.home"), "workshop-uploads");

    public WorkshopService(WorkshopRepository workshopRepository) {
        this.workshopRepository = workshopRepository;
    }

    public List<Workshop> getAllWorkshops() {
        return workshopRepository.findAll();
    }

    public Workshop getWorkshop(Long id) {
        return workshopRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workshop not found with id: " + id));
    }
    public void deleteWorkshop(Long id) {
        Workshop w = workshopRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workshop niet gevonden"));
        workshopRepository.delete(w);
    }

    public Workshop saveWorkshop(String name, String description, double duration,
                                 MultipartFile image, MultipartFile[] files,
                                 String labelsInput) throws IOException {

        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        // Afbeelding opslaan
        String imageFileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();
        Path imagePath = uploadDir.resolve(imageFileName);
        image.transferTo(imagePath.toFile());

        // Bestanden opslaan
        List<String> filePaths = new ArrayList<>();
        if (files != null) {
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    String extraFileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                    Path extraPath = uploadDir.resolve(extraFileName);
                    file.transferTo(extraPath.toFile());
                    filePaths.add("/uploads/" + extraFileName);
                }
            }
        }

        // Labels verwerken
        List<String> labels = new ArrayList<>();
        if (labelsInput != null && !labelsInput.trim().isEmpty()) {
            labels = Arrays.stream(labelsInput.split(","))
                    .map(String::trim)
                    .collect(Collectors.toList());
        }

        // Workshop object vullen
        Workshop workshop = new Workshop();
        workshop.setName(name);
        workshop.setDescription(description);
        workshop.setDuration(duration);
        workshop.setImagePath("/uploads/" + imageFileName);
        workshop.setFiles(filePaths);
        workshop.setLabels(labels);
        workshop.setReviews(new ArrayList<>()); // lege lijst initieel

        return workshopRepository.save(workshop);
    }

    private String saveImage(MultipartFile image) throws IOException {
        if (image == null || image.isEmpty()) return null;
        String imageFileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();
        Path imagePath = uploadDir.resolve(imageFileName);
        image.transferTo(imagePath.toFile());
        return "/uploads/" + imageFileName;
    }

    private String saveFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) return null;
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = uploadDir.resolve(fileName);
        file.transferTo(filePath.toFile());
        return "/uploads/" + fileName;
    }

    public Workshop updateWorkshop(Long id, String name, String description, double duration,
                                   MultipartFile image, MultipartFile[] files, String filesToRemove) throws IOException {
        Workshop workshop = getWorkshop(id);
        workshop.setName(name);
        workshop.setDescription(description);
        workshop.setDuration(duration);

        // Nieuwe afbeelding opslaan als er een is
        if (image != null && !image.isEmpty()) {
            String imagePath = saveImage(image);
            workshop.setImagePath(imagePath);
        }

        // Verwijder bestanden die verwijderd moeten worden
        if (filesToRemove != null && !filesToRemove.isEmpty()) {
            List<String> removeList = new ObjectMapper().readValue(filesToRemove, List.class);
            workshop.getFiles().removeIf(f -> removeList.contains(f));
            // eventueel ook fysiek verwijderen van disk
        }

        // Nieuwe bestanden toevoegen
        if (files != null && files.length > 0) {
            for (MultipartFile f : files) {
                String path = saveFile(f);
                workshop.getFiles().add(path);
            }
        }

        return workshopRepository.save(workshop);
    }

}
