package mixto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Config {
    public String api_key;
    public String host;
    public String workspace_id;
}
