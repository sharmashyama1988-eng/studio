
package com.example.gemini_ai_chat

import okhttp3.ResponseBody
import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.Streaming

interface GeminiApi {
    @Streaming
    @POST("v1beta/models/gemini-pro:streamGenerateContent")
    fun streamGenerateContent(@Header("x-goog-api-key") apiKey: String, @Body request: GeminiModels.Request): Call<ResponseBody>
}
