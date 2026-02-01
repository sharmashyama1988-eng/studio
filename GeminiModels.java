
import java.util.Collections;
import java.util.List;

public class GeminiModels {
    // भेजने के लिए (Request)
    public static class Request {
        public List<Content> contents;
        public Request(String text) {
            this.contents = Collections.singletonList(new Content(text));
        }
    }

    public static class Content {
        public List<Part> parts;
        public Content(String text) {
            this.parts = Collections.singletonList(new Part(text));
        }
    }

    public static class Part {
        public String text;
        public Part(String text) { this.text = text; }
    }

    // जवाब पाने के लिए (Response)
    public static class Response {
        public List<Candidate> candidates;
    }

    public static class Candidate {
        public Content content;
    }
}
