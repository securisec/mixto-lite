package mixto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Workspace {
    public String workspace_id;
    public String workspace_name;
}

@JsonIgnoreProperties(ignoreUnknown = true)
class Commit {
    public UUID commit_id;
    public String title;
    public String commit_type;
}

@JsonIgnoreProperties(ignoreUnknown = false)
class Entry {
    public String title;
    public String entry_id;
    public String category;
    public Commit[] commits;
}