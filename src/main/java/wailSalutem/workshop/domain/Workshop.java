package wailSalutem.workshop.domain;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
public class Workshop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;

    private String duration;

    private String imagePath;

    @ElementCollection
    @CollectionTable(name = "workshop_file_paths", joinColumns = @JoinColumn(name = "workshop_id"))
    @Column(name = "file_paths")
    private List<String> files;

    @ElementCollection
    @CollectionTable(name = "workshop_labels", joinColumns = @JoinColumn(name = "workshop_id"))
    @Column(name = "label")
    private List<String> labels;

    @ElementCollection
    @CollectionTable(name = "workshop_reviews", joinColumns = @JoinColumn(name = "workshop_id"))
    @Column(name = "review")
    private List<String> reviews;

    @ElementCollection
    @CollectionTable(name = "workshop_documents", joinColumns = @JoinColumn(name = "workshop_id"))
    private List<DocumentInfo> documents = new ArrayList<>();

    @Lob
    @Column(columnDefinition = "TEXT")
    private String labelsJson;


    // ======= getters & setters =======
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) {
        this.duration = duration;
    }

    public String getImagePath() { return imagePath; }
    public void setImagePath(String imagePath) { this.imagePath = imagePath; }

    public List<String> getFiles() { return files; }
    public void setFiles(List<String> files) { this.files = files; }
    public List<String> getLabels() { return labels; }
    public void setLabels(List<String> labels) { this.labels = labels; }

    public List<String> getReviews() { return reviews; }
    public void setReviews(List<String> reviews) { this.reviews = reviews; }


    public List<DocumentInfo> getDocuments() { return documents; }
    public void setDocuments(List<DocumentInfo> documents) { this.documents = documents; }
    public String getLabelsJson() { return labelsJson; }
    public void setLabelsJson(String labelsJson) { this.labelsJson = labelsJson; }

}