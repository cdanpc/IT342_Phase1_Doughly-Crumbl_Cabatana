package com.example.mobile.notifications.data

import com.example.mobile.model.Notification
import com.example.mobile.network.ApiService
import com.example.mobile.network.RetrofitClient
import com.example.mobile.util.SessionManager
import retrofit2.Response

class NotificationsRepository(sessionManager: SessionManager) {
    private val api: ApiService = RetrofitClient.getInstance(sessionManager).create(ApiService::class.java)

    suspend fun getNotifications(): Response<List<Notification>> = api.getNotifications()
    suspend fun markRead(id: Long): Response<Void> = api.markNotificationRead(id)
    suspend fun markAllRead(): Response<Void> = api.markAllNotificationsRead()
}
