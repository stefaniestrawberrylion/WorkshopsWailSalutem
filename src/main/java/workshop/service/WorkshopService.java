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
                                 MultipartFile image, MultipartFile[] media, MultipartFile[] files,
                                 String labelsInput) throws IOException {

        if (!Files.exists(uploadDir)) Files.createDirectories(uploadDir);

        List<String> mediaPaths = new ArrayList<>();
        List<String> filePaths = new ArrayList<>();

        // Hoofdafbeelding
        String imagePath = null;
        if (image != null && !image.isEmpty()) {
            imagePath = saveFile(image);
        }

        // Media (afbeeldingen + video)
        if (media != null) {
            for (MultipartFile m : media) {
                mediaPaths.add(saveFile(m));
            }
        }

        // Documenten
        if (files != null) {
            for (MultipartFile f : files) {
                String original = f.getOriginalFilename().toLowerCase();
                if (original.endsWith(".jpg") || original.endsWith(".png") || original.endsWith(".mp4") || original.endsWith(".webm")) {
                    continue; // skip media bestanden in document sectie
                }
                filePaths.add(saveFile(f));
            }
        }

        Workshop w = new Workshop();
        w.setName(name);
        w.setDescription(description);
        w.setDuration(duration);
        w.setImagePath(imagePath);
        w.setFiles(mediaPaths);
        w.setDocuments(filePaths);
        w.setReviews(new ArrayList<>());

        // Labels als JSON opslaan
        w.setLabelsJson(labelsInput != null ? labelsInput : "[]");

        return workshopRepository.save(w);
    }


    public Workshop updateWorkshop(Long id, String name, String description, double duration,
                                   MultipartFile image, MultipartFile[] media, MultipartFile[] files,
                                   List<String> filesToRemove) throws IOException {

        Workshop w = getWorkshop(id);
        w.setName(name);
        w.setDescription(description);
        w.setDuration(duration);

        if (image != null && !image.isEmpty()) w.setImagePath(saveFile(image));

        if (filesToRemove != null && !filesToRemove.isEmpty()) {
            w.getFiles().removeIf(filesToRemove::contains);
            w.getDocuments().removeIf(filesToRemove::contains);
        }

        if (media != null) {
            for (MultipartFile m : media) w.getFiles().add(saveFile(m));
        }

        if (files != null) {
            for (MultipartFile f : files) w.getDocuments().add(saveFile(f));
        }

        // Labels niet wijzigen bij update tenzij je een aparte param toevoegt
        // w.setLabelsJson(...);

        return workshopRepository.save(w);
    }

    private String saveFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) return null;
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = uploadDir.resolve(fileName);
        file.transferTo(filePath.toFile());
        return "/uploads/" + fileName;
    }

}
