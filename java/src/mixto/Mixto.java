package mixto;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.*;

import java.io.IOException;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

// TODO 🔥 update for v2

public final class Mixto {
    private final String MIXTO_API_KEY, MIXTO_HOST, MIXTO_WORKSPACE;
    private final HashMap<String, String> EMPTY_QUERY = new HashMap<>();
    private final OkHttpClient client = new OkHttpClient();

    /**
     * @param apiKey    Mixto API key
     * @param host      Mixto host URL
     * @param workspace Current workspace
     * @throws IllegalArgumentException Throws error if API key or Host is not defined
     */
    public Mixto(String apiKey, String host, String workspace) throws IllegalArgumentException {
        this.MIXTO_API_KEY = apiKey;
        this.MIXTO_HOST = host;
        this.MIXTO_WORKSPACE = workspace;
        if (apiKey.equals("") || host.equals("")) {
            throw new IllegalArgumentException("Missing required parameters");
        }
    }

    /**
     * Create a new Mixto instance from the local config file. If valid environment variables are set,
     * this class is initialized with the environment variables instead.
     *
     * @throws Exception raised if local config file cannot be read, or parsing fails
     */
    public Mixto() throws Exception {
        /* Check envars for values first */
        var envApiKey = System.getenv("MIXTO_API_KEY");
        var envHost = System.getenv("MIXTO_HOST");
        var envWorkspace = System.getenv("MIXTO_WORKSPACE");
        if (envApiKey == null || envHost == null || envWorkspace == null) {
            var configFile = System.getProperty("user.home") + "/.mixto.json";
            var configMapper = new ObjectMapper();
            configMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            var config = configMapper.readValue(Paths.get(configFile).toFile(), Config.class);
            this.MIXTO_API_KEY = config.api_key;
            this.MIXTO_HOST = config.host;
            this.MIXTO_WORKSPACE = config.workspace_id;
        } else {
            this.MIXTO_API_KEY = envApiKey;
            this.MIXTO_HOST = envHost;
            this.MIXTO_WORKSPACE = envWorkspace;
        }
    }

    /**
     * Make a new URL with the provided path and host from config
     * @param path to join
     * @return HttpUrl.Builder object
     */
    private HttpUrl.Builder makeURL(String path) {
        return HttpUrl.parse(this.MIXTO_HOST).newBuilder().addPathSegments(path);
    }

    /**
     * Make a request object
     * @param endpoint for api
     * @param query params. Can be empty
     * @return Request.Builder object
     */
    private Request.Builder makeRequestObject(String endpoint, HashMap<String, String> query) {
        /* Replace forward slash from endpoint */
        endpoint = endpoint.replaceFirst("^/", "");
        /* Build the request URL */
        var url = this.makeURL(endpoint);
        /* Add query parameters */
        for (Map.Entry<String, String> q : query.entrySet()) {
            url.addQueryParameter(q.getKey(), q.getValue());
        }
        var apiUrl = url.build().url();
        /* Make request object */
        var request = new Request.Builder().url(apiUrl);
        request.header("x-api-key", this.MIXTO_API_KEY);
        return request;

    }

    /**
     * Check is status code is 200
     * @param response object
     * @return true if not 200
     */
    private boolean hasBadStatus(Response response) {
        return response.code() != 200;
    }

    /**
     * Make a GET request
     * @param endpoint to the api endpoint
     * @param query any query parameters
     * @return Response object
     * @throws Exception If status code is not 200
     */
    public Response MakeRequest(String endpoint, HashMap<String, String> query) throws Exception {
        var request = this.makeRequestObject(endpoint, query);
        var response = client.newCall(request.build()).execute();
        if (response.code() != 200)
            throw new IOException("Bad status code: " + response.code());
        return response;
    }

    /**
     * Make requests that are not GET requests. Use `jsonfromString` to easily build the optional json body
     *
     * @param method for request
     * @param endpoint for api request
     * @param body request json body
     * @return Response object
     * @throws Exception If status is not 200
     */
    public Response MakeRequest(String method, String endpoint, RequestBody body) throws Exception {
        var request = this.makeRequestObject(endpoint, EMPTY_QUERY);
        var response = client.newCall(request.method(method, body).build()).execute();
        if (hasBadStatus(response))
            throw new IOException("Bad status code: " + response.code());
        return response;
    }

    /**
     * Get an array of all workspaces
     *
     * @return Workspace[]
     * @throws Exception exception
     */
    public Workspace[] GetWorkspaces() throws Exception {
        var query = new HashMap<String, String>();
        var responseMapper = new ObjectMapper();
        var response = this.MakeRequest("/api/v1/workspace", query);
        Workspace[] workspaces = responseMapper.readValue(response.body().byteStream(), Workspace[].class);
        if (MIXTO_WORKSPACE == null) {
            return new Workspace[0];
        }
        return workspaces;
    }

    public Entry[] GetEntries(Boolean includeCommits) throws Exception {
        var body = new HashMap<String, Object>();
        var responseMapper = new ObjectMapper();
        body.put("workspace_id", this.MIXTO_WORKSPACE);
        body.put("include_commits", includeCommits);
        var jsonBody = new ObjectMapper().writeValueAsString(body);
        var resp = this.MakeRequest("POST", "/api/v1/workspace", jsonfromString(jsonBody));
        assert resp.body() != null;
        return responseMapper.readValue(resp.body().byteStream(), Entry[].class);
    }

    /**
     * Add a commit to Mixto
     *
     * @param data    to commit
     * @param entryID id
     * @param title   for commit
     * @return Response object
     * @throws Exception if status code is not 200
     */
    public Response AddCommit(String data, String entryID, String title) throws Exception {
        var entryURL = "/api/v1/commit";
        var body = new HashMap<String, String>();
        body.put("commit_type", "tool");
        body.put("title", title);
        body.put("data", data);
        body.put("entry_id", entryID);
        body.put("workspace_id", this.MIXTO_WORKSPACE);
        var jsonBody = new ObjectMapper().writeValueAsString(body);
        return MakeRequest("POST", entryURL, jsonfromString(jsonBody));
    }

    /**
     * Convert JSON string to RequestBody for non GET requests
     * @param jsonString json as string
     * @return RequestBody to be used in MakeRequest method
     */
    public RequestBody jsonfromString(String jsonString) {
        var jsonContentTypeHeader = MediaType.parse("application/json; charset=utf-8");
        return RequestBody.create(jsonContentTypeHeader, jsonString);
    }
}
