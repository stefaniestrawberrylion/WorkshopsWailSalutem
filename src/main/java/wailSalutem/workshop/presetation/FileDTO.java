package wailSalutem.workshop.presetation;

public class FileDTO {
    private String name;
    private String url;
    private String type; // "image" of "video"

    public FileDTO(String name, String url, String type) {
        this.name = name;
        this.url = url;
        this.type = type;
    }

    public String getName() { return name; }
    public String getUrl() { return url; }
    public String getType() { return type; }

    public void setName(String name) { this.name = name; }
    public void setUrl(String url) { this.url = url; }
    public void setType(String type) { this.type = type; }
}
