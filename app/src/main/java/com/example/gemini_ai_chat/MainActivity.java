
package com.example.gemini_ai_chat;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.View;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;

import com.example.gemini_ai_chat.databinding.ActivityMainBinding;
import com.google.gson.Gson;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MainActivity extends AppCompatActivity {

    private ActivityMainBinding binding;
    private ChatAdapter chatAdapter;
    private List<Message> messages;
    private GeminiApi geminiApi;
    private AppDatabase db;
    private Handler mainHandler = new Handler(Looper.getMainLooper());

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityMainBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        messages = new ArrayList<>();
        chatAdapter = new ChatAdapter(messages);
        binding.chatRecyclerView.setLayoutManager(new LinearLayoutManager(this));
        binding.chatRecyclerView.setAdapter(chatAdapter);

        geminiApi = RetrofitClient.getClient();
        db = AppDatabase.getDatabase(this);

        loadMessages();

        binding.sendButton.setOnClickListener(v -> {
            String inputText = binding.messageInputText.getText().toString();
            if (!inputText.isEmpty()) {
                sendMessage(inputText);
            }
        });
    }

    private void loadMessages() {
        new Thread(() -> {
            List<Message> loadedMessages = db.messageDao().getAllMessages();
            mainHandler.post(() -> {
                messages.addAll(loadedMessages);
                chatAdapter.notifyDataSetChanged();
                binding.chatRecyclerView.scrollToPosition(messages.size() - 1);
            });
        }).start();
    }

    private void sendMessage(String text) {
        Message userMessage = new Message(text, true, System.currentTimeMillis());
        addMessage(userMessage);
        binding.messageInputText.setText("");

        new Thread(() -> {
            long messageId = db.messageDao().insert(userMessage);
            userMessage.id = (int) messageId;

            Message aiMessage = new Message("", false, System.currentTimeMillis());
            long aiMessageId = db.messageDao().insert(aiMessage);
            aiMessage.id = (int) aiMessageId;

            mainHandler.post(() -> addMessage(aiMessage));

            GeminiModels.Request request = new GeminiModels.Request(text);
            geminiApi.streamGenerateContent(BuildConfig.GEMINI_API_KEY, request).enqueue(new Callback<ResponseBody>() {
                @Override
                public void onResponse(Call<ResponseBody> call, Response<ResponseBody> response) {
                    if (response.isSuccessful()) {
                        try {
                            BufferedReader reader = new BufferedReader(new InputStreamReader(response.body().byteStream()));
                            String line;
                            StringBuilder responseBuilder = new StringBuilder();
                            while ((line = reader.readLine()) != null) {
                                if (line.contains("\"text\":")) {
                                    String jsonResponse = line.substring(line.indexOf("{"), line.lastIndexOf("}") + 1);
                                    try {
                                        GeminiModels.Response geminiResponse = new Gson().fromJson(jsonResponse, GeminiModels.Response.class);
                                        if (geminiResponse != null && geminiResponse.candidates != null && !geminiResponse.candidates.isEmpty()) {
                                            String newText = geminiResponse.candidates.get(0).content.parts.get(0).text;
                                            responseBuilder.append(newText);
                                            aiMessage.text = responseBuilder.toString();
                                            updateMessage(aiMessage);
                                        }
                                    } catch (Exception e) {
                                        // Ignore JSON parsing errors for incomplete lines
                                    }
                                }
                            }
                            new Thread(() -> db.messageDao().update(aiMessage)).start();
                        } catch (IOException e) {
                            e.printStackTrace();
                        }
                    } else {
                        aiMessage.text = "Error: " + response.code();
                        updateMessage(aiMessage);
                        new Thread(() -> db.messageDao().update(aiMessage)).start();
                    }
                }

                @Override
                public void onFailure(Call<ResponseBody> call, Throwable t) {
                    aiMessage.text = "Failure: " + t.getMessage();
                    updateMessage(aiMessage);
                    new Thread(() -> db.messageDao().update(aiMessage)).start();
                }
            });
        }).start();
    }

    private void addMessage(Message message) {
        messages.add(message);
        chatAdapter.notifyItemInserted(messages.size() - 1);
        binding.chatRecyclerView.scrollToPosition(messages.size() - 1);
    }

    private void updateMessage(Message message) {
        mainHandler.post(() -> {
            int index = -1;
            for (int i = 0; i < messages.size(); i++) {
                if (messages.get(i).id == message.id) {
                    index = i;
                    break;
                }
            }
            if (index != -1) {
                messages.set(index, message);
                chatAdapter.notifyItemChanged(index);
            }
        });
    }
}
