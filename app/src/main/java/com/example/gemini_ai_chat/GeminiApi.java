
import com.example.gemini_ai_chat.GeminiModels;

import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.Header;
import retrofit2.http.POST;
import retrofit2.http.Streaming;

public interface GeminiApi {
    @Streaming
    @POST("v1beta/models/gemini-pro:streamGenerateContent")
    Call<ResponseBody> streamGenerateContent(@Header("x-goog-api-key") String apiKey, @Body GeminiModels.Request request);
}
