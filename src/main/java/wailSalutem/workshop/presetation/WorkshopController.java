package wailSalutem.workshop.presetation;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import wailSalutem.workshop.domain.DocumentInfo;
import wailSalutem.workshop.service.WorkshopService;
import wailSalutem.workshop.domain.Workshop;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/workshops")
public class WorkshopController {
    private final WorkshopService service;
    private static final Logger logger = LoggerFactory.getLogger(WorkshopController.class);

    public WorkshopController(WorkshopService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<WorkshopDTO> getAllWorkshops() {
        return service.getAllWorkshops().stream()
                .map(this::toDTO)
                .toList();
    }


    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public WorkshopDTO getWorkshop(@PathVariable Long id) {
        Workshop w = service.getWorkshop(id);
        return toDTO(w);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<WorkshopDTO> createWorkshop(
            @RequestParam String name,
            @RequestParam String description,
            @RequestParam String duration,
            @RequestParam(required = false) MultipartFile image,
            @RequestParam(required = false) MultipartFile[] media,
            @RequestParam(required = false) MultipartFile[] instructionsFiles,
            @RequestParam(required = false) MultipartFile[] manualsFiles,
            @RequestParam(required = false) MultipartFile[] demoFiles,
            @RequestParam(required = false) MultipartFile[] worksheetsFiles,
            @RequestParam(required = false) String labels
    ) throws IOException {

        Workshop workshop = service.saveWorkshop(
                name,
                description,
                duration,
                image,
                media,
                instructionsFiles,
                manualsFiles,
                demoFiles,
                worksheetsFiles,
                labels
        );

        return ResponseEntity.ok(toDTO(workshop));
    }



    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public WorkshopDTO updateWorkshop(
            @PathVariable Long id,
            @RequestParam String name,
            @RequestParam String description,
            @RequestParam String duration,
            @RequestParam(required = false) MultipartFile image,
            @RequestParam(required = false) MultipartFile[] media,
            @RequestParam(required = false) MultipartFile[] files,
            @RequestParam(required = false) List<String> filesToRemove
    ) throws IOException {
        Workshop updatedWorkshop = service.updateWorkshop(id, name, description, duration, image, media, files, filesToRemove);
        return toDTO(updatedWorkshop);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteWorkshop(@PathVariable Long id) {
        service.deleteWorkshop(id);
    }


    private WorkshopDTO toDTO(Workshop w) {
        WorkshopDTO dto = new WorkshopDTO();
        dto.setId(w.getId());
        dto.setName(w.getName());
        dto.setDescription(w.getDescription());
        dto.setDuration(w.getDuration());
        dto.setImageUrl(w.getImagePath());

        // Media files (images & video)
        dto.setFiles(w.getFiles() != null ? w.getFiles().stream()
                .map(f -> {
                    String fileLower = f.toLowerCase();
                    String type = fileLower.endsWith(".mp4") || fileLower.endsWith(".webm") ? "video" : "image";
                    return new FileDTO(f.substring(f.lastIndexOf("/") + 1), f, type);
                })
                .toList() : List.of());

        // Documenten
        dto.setDocuments(
                w.getDocuments() != null ? w.getDocuments().stream()
                        .map(doc -> new FileDTO(doc.getName(), doc.getUrl(), doc.getCategory()))
                        .toList() : List.of()
        );

        // Labels vanuit JSON
        try {
            ObjectMapper mapper = new ObjectMapper();
            List<LabelDTO> labels = w.getLabelsJson() != null ?
                    Arrays.asList(mapper.readValue(w.getLabelsJson(), LabelDTO[].class)) : List.of();
            dto.setLabels(labels);
        } catch (Exception e) {
            dto.setLabels(List.of());
        }

        return dto;
    }



}
