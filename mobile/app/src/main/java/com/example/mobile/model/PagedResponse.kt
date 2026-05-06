package com.example.mobile.model

data class PagedResponse<T>(
    val content: List<T>,
    val totalPages: Int,
    val totalElements: Long,
    val currentPage: Int
)
