package workshop.presetation;

import java.util.List;

public class WorkshopDTO {
    private Long id;
    private String name;
    private String description;
    private double duration;
    private String imageUrl;
    private List<FileDTO> files;
    private List<String> labels;
    private List<String> reviews;

    // Getters & setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public double getDuration() { return duration; }
    public void setDuration(double duration) { this.duration = duration; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public List<FileDTO> getFiles() { return files; }
    public void setFiles(List<FileDTO> files) { this.files = files; }

    public List<String> getLabels() { return labels; }
    public void setLabels(List<String> labels) { this.labels = labels; }

    public List<String> getReviews() { return reviews; }
    public void setReviews(List<String> reviews) { this.reviews = reviews; }
}
