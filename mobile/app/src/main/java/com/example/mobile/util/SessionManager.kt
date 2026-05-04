package com.example.mobile.util

import android.content.Context
import android.content.SharedPreferences

class SessionManager(context: Context) {

    private val prefs: SharedPreferences =
        context.getSharedPreferences("doughly_session", Context.MODE_PRIVATE)

    fun saveToken(token: String) = prefs.edit().putString(KEY_TOKEN, token).apply()
    fun getToken(): String? = prefs.getString(KEY_TOKEN, null)

    fun saveUser(userId: Long, name: String, email: String, role: String) {
        prefs.edit()
            .putLong(KEY_USER_ID, userId)
            .putString(KEY_NAME, name)
            .putString(KEY_EMAIL, email)
            .putString(KEY_ROLE, role)
            .apply()
    }

    fun getUserId(): Long = prefs.getLong(KEY_USER_ID, -1)
    fun getName(): String? = prefs.getString(KEY_NAME, null)
    fun getEmail(): String? = prefs.getString(KEY_EMAIL, null)
    fun getRole(): String? = prefs.getString(KEY_ROLE, null)
    fun isAdmin(): Boolean = getRole() == "ADMIN"
    fun isLoggedIn(): Boolean = getToken() != null

    fun clearSession() = prefs.edit().clear().apply()

    companion object {
        private const val KEY_TOKEN   = "token"
        private const val KEY_USER_ID = "user_id"
        private const val KEY_NAME    = "name"
        private const val KEY_EMAIL   = "email"
        private const val KEY_ROLE    = "role"
    }
}
