package mixto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Workspace {
    public String workspace_id;
    public String category;
    public long entries_count;
    public long commits_count;
    public long flags_count;
    public long time_updated;
    public long time_created;
}

@JsonIgnoreProperties(ignoreUnknown = true)
class Commit {
    public UUID commit_id;
    public String title;
    public String type;
    public String workspace;
    public long time_updated;
    public long time_created;
    public String avatar;
    public String username;
}
