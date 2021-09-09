package com.securisec.mixto.types;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Workspace {
    public String workspace;
    public String title;
    public String category;
    public String entry_id;
    public long commit_count;
    public long flags_count;
    public String priority;
    public long time_updated;
    public long time_created;
    public Commit[] commits;
    public Notice notice;
    public String avatar;
}

@JsonIgnoreProperties(ignoreUnknown = true)
class Notice {
    public String text;
    public String priority;
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
