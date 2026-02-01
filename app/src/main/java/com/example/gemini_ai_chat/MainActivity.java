
package com.example.gemini_ai_chat

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.gemini_ai_chat.databinding.ActivityMainBinding
import com.google.gson.Gson
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.ResponseBody
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.io.BufferedReader
import java.io.InputStreamReader

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var chatAdapter: ChatAdapter
    private lateinit var db: AppDatabase
    private lateinit var geminiApi: GeminiApi
    private lateinit var keyRotator: KeyRotator

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val messages = mutableListOf<Message>()
        chatAdapter = ChatAdapter(messages)
        binding.chatRecyclerView.layoutManager = LinearLayoutManager(this)
        binding.chatRecyclerView.adapter = chatAdapter

        db = AppDatabase.getDatabase(this)
        geminiApi = RetrofitClient.getClient()
        keyRotator = KeyRotator(this)

        loadMessages(messages)

        binding.sendButton.setOnClickListener {
            val inputText = binding.messageInputText.text.toString()
            if (inputText.isNotEmpty()) {
                sendMessage(inputText, messages)
            }
        }
    }

    private fun loadMessages(messages: MutableList<Message>) {
        lifecycleScope.launch(Dispatchers.IO) {
            val loadedMessages = db.messageDao().getAllMessages()
            withContext(Dispatchers.Main) {
                messages.addAll(loadedMessages)
                chatAdapter.notifyDataSetChanged()
                binding.chatRecyclerView.scrollToPosition(messages.size - 1)
            }
        }
    }

    private fun sendMessage(text: String, messages: MutableList<Message>) {
        val userMessage = Message(text = text, isUser = true, timestamp = System.currentTimeMillis())
        addMessage(userMessage, messages)
        binding.messageInputText.setText("")

        lifecycleScope.launch(Dispatchers.IO) {
            val messageId = db.messageDao().insert(userMessage)
            userMessage.id = messageId.toInt()

            val aiMessage = Message(text = "", isUser = false, timestamp = System.currentTimeMillis())
            val aiMessageId = db.messageDao().insert(aiMessage)
            aiMessage.id = aiMessageId.toInt()

            withContext(Dispatchers.Main) {
                addMessage(aiMessage, messages)
            }

            val apiKey = keyRotator.getNextKey() ?: ""
            val request = GeminiModels.Request(text)
            geminiApi.streamGenerateContent(apiKey, request).enqueue(object : Callback<ResponseBody> {
                override fun onResponse(call: Call<ResponseBody>, response: Response<ResponseBody>) {
                    if (response.isSuccessful) {
                        lifecycleScope.launch(Dispatchers.IO) {
                            val reader = BufferedReader(InputStreamReader(response.body()?.byteStream()))
                            val responseBuilder = StringBuilder()
                            var line: String?
                            while (reader.readLine().also { line = it } != null) {
                                if (line!!.contains("\"text\":")) {
                                    val jsonResponse = line!!.substring(line!!.indexOf("{"), line!!.lastIndexOf("}") + 1)
                                    try {
                                        val geminiResponse = Gson().fromJson(jsonResponse, GeminiModels.Response::class.java)
                                        if (geminiResponse?.candidates?.isNotEmpty() == true) {
                                            val newText = geminiResponse.candidates[0].content.parts[0].text
                                            responseBuilder.append(newText)
                                            aiMessage.text = responseBuilder.toString()
                                            updateMessage(aiMessage, messages)
                                        }
                                    } catch (e: Exception) {
                                        // Ignore JSON parsing errors for incomplete lines
                                    }
                                }
                            }
                            db.messageDao().update(aiMessage)
                        }
                    } else {
                        aiMessage.text = "Error: ${response.code()}"
                        updateMessage(aiMessage, messages)
                        lifecycleScope.launch(Dispatchers.IO) {
                            db.messageDao().update(aiMessage)
                        }
                    }
                }

                override fun onFailure(call: Call<ResponseBody>, t: Throwable) {
                    aiMessage.text = "Failure: ${t.message}"
                    updateMessage(aiMessage, messages)
                    lifecycleScope.launch(Dispatchers.IO) {
                        db.messageDao().update(aiMessage)
                    }
                }
            })
        }
    }

    private fun addMessage(message: Message, messages: MutableList<Message>) {
        runOnUiThread {
            messages.add(message)
            chatAdapter.notifyItemInserted(messages.size - 1)
            binding.chatRecyclerView.scrollToPosition(messages.size - 1)
        }
    }


    private fun updateMessage(message: Message, messages: MutableList<Message>) {
        runOnUiThread {
            val index = messages.indexOfFirst { it.id == message.id }
            if (index != -1) {
                messages[index] = message
                chatAdapter.notifyItemChanged(index)
            }
        }
    }
}
