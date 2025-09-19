package workshop.presetation;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import workshop.service.WorkshopService;
import workshop.domain.Workshop;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/workshops")
public class WorkshopController {
    private final WorkshopService service;

    public WorkshopController(WorkshopService service) {
        this.service = service;
    }

    @GetMapping
    public List<WorkshopDTO> getAllWorkshops() {
        return service.getAllWorkshops().stream()
                .map(this::toDTO)
                .toList();
    }

    @GetMapping("/{id}")
    public WorkshopDTO getWorkshop(@PathVariable Long id) {
        Workshop w = service.getWorkshop(id);
        return toDTO(w);
    }
    @PostMapping
    public WorkshopDTO createWorkshop(
            @RequestParam String name,
            @RequestParam String description,
            @RequestParam double duration,
            @RequestParam MultipartFile image,
            @RequestParam(required = false) MultipartFile[] files
    ) throws IOException {
        Workshop workshop = service.saveWorkshop(name, description, duration, image, files);
        return toDTO(workshop);
    }

    @DeleteMapping("/{id}")
    public void deleteWorkshop(@PathVariable Long id) {
        service.deleteWorkshop(id);
    }
    @PutMapping("/{id}")
    public WorkshopDTO updateWorkshop(
            @PathVariable Long id,
            @RequestParam String name,
            @RequestParam String description,
            @RequestParam double duration,
            @RequestParam(required = false) MultipartFile image,
            @RequestParam(required = false) MultipartFile[] files,
            @RequestParam(required = false) String filesToRemove
    ) throws IOException {

        Workshop updatedWorkshop = service.updateWorkshop(id, name, description, duration, image, files, filesToRemove);
        return toDTO(updatedWorkshop);
    }

    private WorkshopDTO toDTO(Workshop w) {
        WorkshopDTO dto = new WorkshopDTO();
        dto.setId(w.getId());
        dto.setName(w.getName());
        dto.setDescription(w.getDescription());
        dto.setDuration(w.getDuration());
        dto.setImageUrl(w.getImagePath()); // gebruik imagePath direct
        dto.setFiles(w.getFiles() != null ? w.getFiles().stream()
                .map(f -> new FileDTO(f.substring(f.lastIndexOf("/") + 1), f)) // naam + url
                .toList() : List.of());
        return dto;
    }


}
