package wailSalutem.workshop.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import wailSalutem.workshop.data.WorkshopRepository;
import wailSalutem.workshop.domain.DocumentInfo;
import wailSalutem.workshop.domain.Workshop;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class WorkshopService {

    private final WorkshopRepository workshopRepository;
    private final Path uploadDir = Paths.get(System.getProperty("user.home"), "wailSalutem.workshop-uploads");

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
        Workshop w = getWorkshop(id);
        workshopRepository.delete(w);
    }

    public Workshop saveWorkshop(
            String name,
            String description,
            String duration,
            MultipartFile image,
            MultipartFile[] media,
            MultipartFile[] instructionsFiles,
            MultipartFile[] manualsFiles,
            MultipartFile[] demoFiles,
            MultipartFile[] worksheetsFiles,
            String labelsJson
    ) throws IOException {

        if (!Files.exists(uploadDir)) Files.createDirectories(uploadDir);

        String imagePath = (image != null && !image.isEmpty()) ? saveFile(image) : null;

        List<String> mediaPaths = new ArrayList<>();
        if (media != null) {
            for (MultipartFile m : media) {
                mediaPaths.add(saveFile(m));
            }
        }

        // Documenten per categorie
        List<DocumentInfo> documents = new ArrayList<>();
        if (instructionsFiles != null) {
            for (MultipartFile f : instructionsFiles) {
                documents.add(new DocumentInfo(f.getOriginalFilename(), saveFile(f), "instructions"));
            }
        }
        if (manualsFiles != null) {
            for (MultipartFile f : manualsFiles) {
                documents.add(new DocumentInfo(f.getOriginalFilename(), saveFile(f), "manuals"));
            }
        }
        if (demoFiles != null) {
            for (MultipartFile f : demoFiles) {
                documents.add(new DocumentInfo(f.getOriginalFilename(), saveFile(f), "demo"));
            }
        }
        if (worksheetsFiles != null) {
            for (MultipartFile f : worksheetsFiles) {
                documents.add(new DocumentInfo(f.getOriginalFilename(), saveFile(f), "worksheets"));
            }
        }

        Workshop w = new Workshop();
        w.setName(name);
        w.setDescription(description);
        w.setDuration(duration);
        w.setImagePath(imagePath);
        w.setFiles(mediaPaths);           // Afbeeldingen + video
        w.setDocuments(documents);        // **Echte objecten**
        w.setLabelsJson(labelsJson != null ? labelsJson : "[]");

        return workshopRepository.save(w);
    }

    public Workshop updateWorkshop(Long id,
                                   String name,
                                   String description,
                                   String duration,
                                   MultipartFile image,
                                   MultipartFile[] media,
                                   MultipartFile[] files,
                                   List<String> filesToRemove) throws IOException {

        Workshop w = getWorkshop(id);
        w.setName(name);
        w.setDescription(description);
        w.setDuration(duration);

        if (image != null && !image.isEmpty()) w.setImagePath(saveFile(image));

        // Verwijder geselecteerde bestanden
        if (filesToRemove != null && !filesToRemove.isEmpty()) {
            w.getFiles().removeIf(filesToRemove::contains);
            w.getDocuments().removeIf(d -> filesToRemove.contains(d.getName()));
        }

        // Nieuwe media toevoegen
        if (media != null) {
            for (MultipartFile m : media) {
                w.getFiles().add(saveFile(m));
            }
        }

        // Nieuwe documenten toevoegen
        if (files != null) {
            for (MultipartFile f : files) {
                // Default category "other" als geen categorie meegegeven
                w.getDocuments().add(new DocumentInfo(f.getOriginalFilename(), saveFile(f), "other"));
            }
        }

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
