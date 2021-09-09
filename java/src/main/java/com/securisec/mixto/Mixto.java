package com.securisec.mixto;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.securisec.mixto.types.Config;
import com.securisec.mixto.types.Workspace;
import okhttp3.*;

import java.io.IOException;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

public final class Mixto {
    private final String MIXTO_API_KEY, MIXTO_HOST, MIXTO_WORKSPACE;
    private final HashMap<String, String> EMPTY_QUERY = new HashMap<>();
    private final OkHttpClient client = new OkHttpClient();

    /**
     * @param apiKey    com.securisec.mixto.Mixto API key
     * @param host      com.securisec.mixto.Mixto host URL
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
     * Create a new com.securisec.mixto.Mixto instance from the local config file
     *
     * @throws Exception raised if local config file cannot be read, or parsing fails
     */
    public Mixto() throws Exception {
        var configFile = System.getProperty("user.home") + "/.mixto.json";
        var configMapper = new ObjectMapper();
        configMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        var config = configMapper.readValue(Paths.get(configFile).toFile(), Config.class);
        this.MIXTO_API_KEY = config.api_key;
        this.MIXTO_HOST = config.host;
        this.MIXTO_WORKSPACE = config.workspace;
    }

    private HttpUrl.Builder makeURL(String path) {
        return HttpUrl.parse(this.MIXTO_HOST).newBuilder().addPathSegments(path);
    }

    private Request.Builder makeRequestObject(String uri, HashMap<String, String> query) {
        /* Replace forward slash from uri */
        uri = uri.replaceFirst("^/", "");
        /* Build the request URL */
        var url = this.makeURL(uri);
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

    private boolean hasBadStatus(Response respose) {
        return respose.code() != 200;
    }

    public Response MakeRequest(String uri, HashMap<String, String> query) throws Exception {
        var request = this.makeRequestObject(uri, query);
        var response = client.newCall(request.build()).execute();
        if (response.code() != 200)
            throw new IOException("Bad status code: " + response.code());
        return response;
    }

    public Response MakeRequest(String method, String uri, RequestBody body) throws Exception {
        var request = this.makeRequestObject(uri, EMPTY_QUERY);
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
        query.put("all", "true");
        var response = this.MakeRequest("/api/misc/workspaces", query);
        Workspace[] workspaces = responseMapper.readValue(response.body().byteStream(), Workspace[].class);
        if (MIXTO_WORKSPACE == null) {
            return new Workspace[0];
        }
        return workspaces;
    }

    /**
     * Get an array of entry ids
     *
     * @return String[]
     * @throws Exception exception
     */
    public String[] GetEntryIDs() throws Exception {
        var workspaces = this.GetWorkspaces();
        return Arrays.stream(workspaces)
                .filter(workspace -> workspace.workspace.equals(this.MIXTO_WORKSPACE))
                .map(w -> w.entry_id)
                .toArray(String[]::new);
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
        var entryURL = "/api/entry/" + entryID + "/commit";
        var body = new HashMap<String, String>();
        body.put("type", "tool");
        body.put("title", title);
        body.put("data", data);
        var jsonBody = new ObjectMapper().writeValueAsString(body);
        System.out.println(jsonBody);
        return MakeRequest("POST", entryURL, jsonfromString(jsonBody));
    }

    public RequestBody jsonfromString(String json) {
        var jsonContentTypeHeader = MediaType.parse("application/json; charset=utf-8");
        return RequestBody.create(jsonContentTypeHeader, json);
    }
}
