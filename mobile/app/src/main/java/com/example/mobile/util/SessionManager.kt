package com.example.mobile.util

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKeys

class SessionManager(context: Context) {

    private val appContext = context.applicationContext
    private val prefs: SharedPreferences

    init {
        prefs = try {
            buildPrefs()
        } catch (e: Exception) {
            // Keystore key was invalidated (e.g. reinstall without clearing data) — wipe and recreate
            appContext.deleteSharedPreferences(PREFS_NAME)
            buildPrefs()
        }
    }

    private fun buildPrefs(): SharedPreferences {
        val masterKeyAlias = MasterKeys.getOrCreate(MasterKeys.AES256_GCM_SPEC)
        return EncryptedSharedPreferences.create(
            PREFS_NAME,
            masterKeyAlias,
            appContext,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }

    fun saveToken(token: String) {
        try { prefs.edit().putString(KEY_TOKEN, token).apply() } catch (_: Exception) {}
    }

    fun getToken(): String? = try {
        prefs.getString(KEY_TOKEN, null)
    } catch (_: Exception) { null }

    fun saveUser(userId: Long, name: String, email: String, role: String) {
        try {
            prefs.edit()
                .putLong(KEY_USER_ID, userId)
                .putString(KEY_NAME, name)
                .putString(KEY_EMAIL, email)
                .putString(KEY_ROLE, role)
                .apply()
        } catch (_: Exception) {}
    }

    fun getUserId(): Long = try { prefs.getLong(KEY_USER_ID, -1) } catch (_: Exception) { -1 }
    fun getName(): String? = try { prefs.getString(KEY_NAME, null) } catch (_: Exception) { null }
    fun getEmail(): String? = try { prefs.getString(KEY_EMAIL, null) } catch (_: Exception) { null }
    fun getRole(): String? = try { prefs.getString(KEY_ROLE, null) } catch (_: Exception) { null }
    fun isAdmin(): Boolean = getRole() == "ADMIN"
    fun isLoggedIn(): Boolean = getToken() != null

    fun clearSession() {
        try {
            prefs.edit().clear().apply()
        } catch (_: Exception) {
            // If the keystore key is corrupt, deleting the file achieves the same result
            appContext.deleteSharedPreferences(PREFS_NAME)
        }
    }

    companion object {
        private const val PREFS_NAME   = "doughly_session"
        private const val KEY_TOKEN    = "token"
        private const val KEY_USER_ID  = "user_id"
        private const val KEY_NAME     = "name"
        private const val KEY_EMAIL    = "email"
        private const val KEY_ROLE     = "role"
    }
}
