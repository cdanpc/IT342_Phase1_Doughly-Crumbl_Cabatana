package com.example.mobile

import android.app.Application
import android.content.Context

class DoughlyApp : Application() {

    companion object {
        lateinit var appContext: Context
            private set
    }

    override fun onCreate() {
        super.onCreate()
        appContext = applicationContext
    }
}
