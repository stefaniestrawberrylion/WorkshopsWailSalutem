package workshop.presetation;

public class FileDTO {
    private String name;
    private String url;

    public FileDTO(String name, String url) {
        this.name = name;
        this.url = url;
    }

    public String getName() { return name; }
    public String getUrl() { return url; }
    public void setName(String name) { this.name = name; }
    public void setUrl(String url) { this.url = url; }
}
