# Mixto python2 lite lib for integrations without any dependencies

from urllib2 import Request, urlopen, HTTPError
from urllib import urlencode
from urlparse import urljoin
import os
import json

MIXTO_ENTRY_ID = os.getenv("MIXTO_ENTRY_ID")
MIXTO_HOST = os.getenv("MIXTO_HOST")
MIXTO_API_KEY = os.getenv("MIXTO_API_KEY")


class MissingRequired(Exception):
    """Missing params"""

    pass


class BadResponse(Exception):
    """Bad response from Mixto API"""

    pass


class MixtoLite:
    def __init__(self, host = None, api_key = None):
        self.host = host
        self.api_key = api_key
        self.worksapce = None
        self.status = 0
        self.commit_type = "tool"

        # if envars are set, always use those values
        if MIXTO_HOST is not None and self.host is None:
            self.host = MIXTO_HOST
        if MIXTO_API_KEY is not None and self.api_key is None:
            self.api_key = MIXTO_API_KEY

        # if host or apikey is not available, read config file
        if self.host == None or self.api_key == None:
            try:
                conf_path = str(os.path.expanduser('~/.mixto.json'))
                with open(conf_path) as f:
                    j = json.loads(f.read())
                    self.host = j["host"]
                    self.api_key = j["api_key"]
                    self.worksapce = j["workspace"]
            except:
                print("Cannot read mixto config file")
                raise

    def MakeRequest(
        self,
        uri,
        data = {},
        is_query = False,
    ):
        """Generic method helpful in extending this lib for other Mixto 
        API calls. Refer to Mixto docs for all available API endpoints. 

        Args:
            method (str): Request method
            uri (str): Mixto URI. 
            data (dict, optional): Body or query params. Defaults to {}.
            is_query (bool, optional): True if query params. Defaults to False.

        Raises:
            BadResponse: If status code is not 200, raises exception

        Returns:
            None: None
        """
        # add base url with endpoint
        url = urljoin(str(self.host), uri)
        # if query params, add data as query params
        if is_query:
            data = urlencode(data)
            url += "?" + data
        else:
            # add as json body
            data = json.dumps(data)
        # create request object
        req = Request(
            url=url,
            headers={"x-api-key": self.api_key, "user-agent": "mixto-lite-py2",},
        )
        # add json content type if post body
        if not is_query:
            req.add_header("Content-Type", "application/json")
            req.add_data(data)

        # send request
        try:
            res = urlopen(req)
            body = res.read().decode()
            self.status = res.getcode()
            if self.status > 300:
                raise BadResponse(self.status, res)
            else:
                return body
        except HTTPError as e:
            raise BadResponse(e.code, e.read())

    def AddCommit(self, data, entry_id = None, title = ""):
        """Add/commit data to an entry. This is the primary functionality of 
        an integration

        Args:
            data (str): Data to add
            entry_id (str, optional): Entry ID. Will use MIXTO_ENTRY_ID as primary. Defaults to None.
            title (str, optional): Title for commit. Defaults to "Untitled".

        Raises:
            MissingRequired: If entry id is missing

        Returns:
            any: Commit added response
        """
        if MIXTO_ENTRY_ID is None and entry_id is None:
            raise MissingRequired("Entry id is missing")

        e_id = MIXTO_ENTRY_ID if MIXTO_ENTRY_ID else entry_id
        return self.MakeRequest(
            "/api/entry/{}/{}/commit".format(self.worksapce, e_id),
            {"data": data, "type": self.commit_type, "title": title},
        )

    def GetWorkspaces(self):
        """Get all workspaces, entries and commits in a compact format. 
        Helpful when trying to populate entry ID and commit ID's or 
        filter by workspace

        Returns:
            List[dict]: Array of workspace items
        """
        return self.MakeRequest(
            "/api/misc/workspaces", {"all": "true"}, True
        )

    def GetEntryIDs(self):
        """Get all entry ids filtered by the current workspace
        
        Returns:
            List[str]: List of entry ids
        """
        # get all workspaces
        workspaces = self.GetWorkspaces()
        # filter workspaces by current workspace
        return [w["entry_id"] for w in workspaces if w["workspace"] == self.workspace]

