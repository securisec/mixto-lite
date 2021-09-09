# Mixto lite SDK for Java

## Build
Build jar file by opening the project in intellij idea and selecting build.

## Example
```java
import mixto.Mixto;

public class Main {
    public static void main(String[] args) {
        try {
            // Init with config file
            var mixto = new Mixto();
            // Get all entry ids
            var entryIDs = mixto.GetEntryIDs();
            // Get workspaces
            var workspaces = mixto.GetWorkspaces();
            // Add a commit to Mixto
           var res = mixto.AddCommit(
             "hello from java sdk", 
             "empty-abcde123", 
             "from java");
        } catch (Exception err) {
            err.printStackTrace();
        }
    }
}

```