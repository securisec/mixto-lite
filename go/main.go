package mixto

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"os"
	"path"
	"strings"
)

// Config config struct for mixto
type Config struct {
	Host        string `json:"host"`
	APIKey      string `json:"api_key"`
	WorkspaceId string `json:"workspace_id"`
}

// MakeRequest generic request builder for mixto api
func (c *Config) MakeRequest(method string, endpoint string, data interface{}, query map[string]string) ([]byte, error) {
	var (
		err  error
		req  *http.Request
		res  *http.Response
		body []byte
	)

	u, err := url.Parse(c.Host)
	if err != nil {
		return body, err
	}
	// construct endpoint url
	u.Path = path.Join(u.Path, endpoint)
	url := u.String()
	j, err := json.Marshal(data)
	if err != nil {
		return body, err
	}

	if j != nil {
		req, err = http.NewRequest(strings.ToUpper(method), url, bytes.NewBuffer(j))
		if err != nil {
			return body, err
		}
		req.Header.Set("Content-Type", "application/json")
	} else {
		req, err = http.NewRequest(strings.ToUpper(method), url, nil)
		if err != nil {
			return body, err
		}
	}
	if query != nil {
		q := req.URL.Query()
		for k, v := range query {
			q.Add(k, v)
		}
		req.URL.RawQuery = q.Encode()
	}
	req.Header.Add("user-agent", "mixto-lite-go")
	req.Header.Add("x-api-key", c.APIKey)

	res, err = http.DefaultClient.Do(req)
	if err != nil {
		return body, err
	}
	defer res.Body.Close()

	if res.StatusCode > 300 {
		bErr, _ := ioutil.ReadAll(res.Body)
		return bErr, errors.New("bad status code")
	}
	body, err = ioutil.ReadAll(res.Body)

	return body, err

}

// GetWorkspaces get an array of all entries in a redacted form
func (c *Config) GetWorkspaces() ([]Workspace, error) {
	var r struct {
		Data []Workspace `json:"data"`
	}
	b, err := c.MakeRequest("GET", "/api/v1/workspace", nil, nil)
	if err != nil {
		return r.Data, err
	}
	err = json.Unmarshal(b, &r)
	return r.Data, err
}

// GetEntryIDs get an array of all entries
// filtered by current workspace
func (c *Config) GetEntryIDs() ([]Entry, error) {
	var res struct {
		Data struct {
			Entries []Entry `json:"entries"`
		} `json:"data"`
	}
	var entries []Entry
	b, err := c.MakeRequest("POST", "/api/v1/workspace", map[string]string{
		"workspace_id": c.WorkspaceId,
	}, nil)
	if err != nil {
		return entries, err
	}
	if err = json.Unmarshal(b, &res); err != nil {
		return entries, err
	}
	return res.Data.Entries, nil
}

// AddCommit add a commit to an entry
func (c *Config) AddCommit(entryID string, data interface{}, title string) (Commit, error) {
	var r Commit
	e := fmt.Sprintf("/api/entry/%s/%s/commit", c.WorkspaceId, entryID)
	body := map[string]interface{}{
		"data":         data,
		"title":        title,
		"commit_type":  "tool",
		"entry_id":     entryID,
		"workspace_id": c.WorkspaceId,
	}
	b, err := c.MakeRequest("POST", e, body, nil)
	if err != nil {
		return r, err
	}
	err = json.Unmarshal(b, &r)
	return r, err
}

// New a new initialized struct for mixto go. If a config
// object is not passed, it will look for environment variables,
// and finally fall back to reading local mixto config file if
// all fails.
// Returns MixtoConfig
func New(config ...*Config) *Config {
	conf := &Config{}
	if len(config) > 0 {
		conf = config[0]
	} else {
		if h, ok := os.LookupEnv("MIXTO_HOST"); ok {
			conf.Host = h
		}
		if a, ok := os.LookupEnv("MIXTO_API_KEY"); ok {
			conf.APIKey = a
		}
	}

	if conf.Host == "" || conf.APIKey == "" {
		h, err := os.UserHomeDir()
		if err != nil {
			panic(err)
		}
		d, err := ioutil.ReadFile(path.Join(h, ".mixto.json"))
		if err != nil {
			panic(err)
		}
		err = json.Unmarshal(d, &conf)
		if err != nil {
			panic(err)
		}
	}
	return conf
}

// Workspace brief information about an entry
type Workspace struct {
	WorkspaceId   string `json:"workspace_id"`
	WorkspaceName string `json:"workspace_name"`
}

type Entry struct {
	EntryID string `json:"entry_id"`
	Title   string `json:"title"`
}

// Commit brief information about a commit
type Commit struct {
	CommitID    string `json:"commit_id"`
	Title       string `json:"title"`
	Type        string `json:"type"`
	TimeUpdated int64  `json:"time_updated"`
}
