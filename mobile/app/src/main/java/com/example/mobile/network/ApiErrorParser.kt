package com.example.mobile.network

import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import retrofit2.Response

object ApiErrorParser {
    private val gson = Gson()

    fun message(response: Response<*>?, fallback: String): String {
        if (response == null) return fallback
        val raw = try {
            response.errorBody()?.string()
        } catch (_: Exception) {
            null
        }
        if (raw.isNullOrBlank()) return fallback

        return try {
            val type = object : TypeToken<Map<String, Any?>>() {}.type
            val data: Map<String, Any?> = gson.fromJson(raw, type)
            val fields = data["fields"] as? Map<*, *>
            val fieldMessage = fields?.values?.firstOrNull()?.toString()
            fieldMessage ?: data["message"]?.toString() ?: fallback
        } catch (_: Exception) {
            fallback
        }
    }
}
