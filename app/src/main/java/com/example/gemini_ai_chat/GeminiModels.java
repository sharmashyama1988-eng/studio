
package com.example.gemini_ai_chat;

import java.util.Collections;
import java.util.List;

public class GeminiModels {

    public static class Request {
        public List<Content> contents;

        public Request(String text) {
            this.contents = Collections.singletonList(new Content(Collections.singletonList(new Part(text))));
        }
    }

    public static class Content {
        public List<Part> parts;

        public Content(List<Part> parts) {
            this.parts = parts;
        }
    }

    public static class Part {
        public String text;

        public Part(String text) {
            this.text = text;
        }
    }

    public static class Response {
        public List<Candidate> candidates;
    }

    public static class Candidate {
        public Content content;
    }
}
