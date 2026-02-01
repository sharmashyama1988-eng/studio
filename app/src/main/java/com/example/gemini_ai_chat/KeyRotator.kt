
package com.example.gemini_ai_chat

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKeys
import java.io.IOException
import java.security.GeneralSecurityException

class KeyRotator(context: Context) {

    private val sharedPreferences: SharedPreferences
    private val apiKeys = mutableListOf<String>()
    private var currentIndex = 0

    init {
        try {
            val masterKeyAlias = MasterKeys.getOrCreate(MasterKeys.AES256_GCM_SPEC)
            sharedPreferences = EncryptedSharedPreferences.create(
                PREF_FILE_NAME,
                masterKeyAlias,
                context,
                EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
            )
        } catch (e: GeneralSecurityException) {
            throw RuntimeException("Failed to create encrypted shared preferences", e)
        } catch (e: IOException) {
            throw RuntimeException("Failed to create encrypted shared preferences", e)
        }
        loadKeys()
    }

    private fun loadKeys() {
        val keySet = sharedPreferences.getStringSet(KEY_SET_KEY, null)
        if (keySet != null) {
            apiKeys.addAll(keySet)
        }
    }

    fun addKey(apiKey: String) {
        apiKeys.add(apiKey)
        saveKeys()
    }

    fun removeKey(apiKey: String) {
        apiKeys.remove(apiKey)
        saveKeys()
    }

    private fun saveKeys() {
        val editor = sharedPreferences.edit()
        editor.putStringSet(KEY_SET_KEY, HashSet(apiKeys))
        editor.apply()
    }

    fun getNextKey(): String? {
        if (apiKeys.isEmpty()) {
            return null
        }
        val key = apiKeys[currentIndex]
        currentIndex = (currentIndex + 1) % apiKeys.size
        return key
    }

    companion object {
        private const val PREF_FILE_NAME = "byok_key_vault"
        private const val KEY_SET_KEY = "api_key_set"
    }
}
