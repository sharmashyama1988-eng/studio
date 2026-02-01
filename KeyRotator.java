
import android.content.Context;
import android.content.SharedPreferences;
import androidx.security.crypto.EncryptedSharedPreferences;
import androidx.security.crypto.MasterKeys;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

public class KeyRotator {

    private static final String PREF_FILE_NAME = "byok_key_vault";
    private static final String KEY_SET_KEY = "api_key_set";

    private final SharedPreferences sharedPreferences;
    private final List<String> apiKeys = new ArrayList<>();
    private int currentIndex = 0;

    public KeyRotator(Context context) throws GeneralSecurityException, IOException {
        String masterKeyAlias = MasterKeys.getOrCreate(MasterKeys.AES256_GCM_SPEC);
        this.sharedPreferences = EncryptedSharedPreferences.create(
                PREF_FILE_NAME,
                masterKeyAlias,
                context,
                EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        );
        loadKeys();
    }

    private void loadKeys() {
        Set<String> keySet = sharedPreferences.getStringSet(KEY_SET_KEY, null);
        if (keySet != null) {
            apiKeys.addAll(keySet);
        }
    }

    public void addKey(String apiKey) {
        apiKeys.add(apiKey);
        saveKeys();
    }

    public void removeKey(String apiKey) {
        apiKeys.remove(apiKey);
        saveKeys();
    }

    private void saveKeys() {
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.putStringSet(KEY_SET_KEY, new java.util.HashSet<>(apiKeys));
        editor.apply();
    }

    public String getNextKey() {
        if (apiKeys.isEmpty()) {
            return null;
        }
        String key = apiKeys.get(currentIndex);
        currentIndex = (currentIndex + 1) % apiKeys.size();
        return key;
    }
}
