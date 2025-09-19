package workshop.presetation;

import java.util.List;

public class WorkshopDTO {
    private Long id;
    private String name;
    private String description;
    private double duration;
    private String imageUrl; // frontend kan hier direct <img src="..."> van maken
    private List<FileDTO> files;

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setDuration(double duration) {
        this.duration = duration;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public void setFiles(List<FileDTO> files) {
        this.files = files;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public double getDuration() {
        return duration;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public List<FileDTO> getFiles() {
        return files;
    }
}
