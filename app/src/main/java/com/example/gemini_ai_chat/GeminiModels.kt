
package com.example.gemini_ai_chat

object GeminiModels {
    // भेजने के लिए (Request)
    data class Request(val contents: List<Content>)

    data class Content(val parts: List<Part>)

    data class Part(val text: String)

    // जवाब पाने के लिए (Response)
    data class Response(val candidates: List<Candidate>)

    data class Candidate(val content: Content)
}
