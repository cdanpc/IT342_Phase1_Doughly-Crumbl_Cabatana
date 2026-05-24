package com.example.mobile.network

import android.content.Context
import java.net.HttpURLConnection
import java.net.Inet4Address
import java.net.NetworkInterface
import java.net.URL
import java.util.Collections
import java.util.concurrent.Callable
import java.util.concurrent.ExecutorCompletionService
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

object ApiServerDiscovery {
    private const val PREFS = "api_server_discovery"
    private const val KEY_BASE_URL = "base_url"
    private const val API_PORT = 8080
    private const val PROBE_TIMEOUT_MS = 450
    private const val SCAN_THREADS = 8
    private const val DEFAULT_BASE_URL = "http://10.0.2.2:8080/api/"
    private const val LAST_KNOWN_LAN_BASE_URL = "http://192.168.1.52:8080/api/"

    @Volatile
    private var cachedBaseUrl: String? = null

    fun currentOrDiscover(context: Context): String =
        cachedBaseUrl ?: discover(context, force = false)

    fun discover(context: Context, force: Boolean): String = synchronized(this) {
        if (!force) {
            cachedBaseUrl?.let { return it }
        }

        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val savedBaseUrl = prefs.getString(KEY_BASE_URL, null)

        // Fast path: try well-known URLs serially before spawning the subnet scan.
        // On emulator 10.0.2.2 responds immediately; on physical device the saved
        // or last-known LAN URL should hit. Only fall through to the subnet scan when
        // all fixed candidates fail (backend unreachable from every known address).
        val fixedCandidates = linkedSetOf<String>()
        savedBaseUrl?.let(fixedCandidates::add)
        fixedCandidates.add(DEFAULT_BASE_URL)
        fixedCandidates.add(LAST_KNOWN_LAN_BASE_URL)

        fixedCandidates.firstOrNull { isBackendReachable(it) }?.let {
            cache(context, it)
            return it
        }

        // Slow path: full subnet scan as last resort.
        val subnetCandidates = buildSubnetCandidates()
        val discovered = findReachable(subnetCandidates) ?: DEFAULT_BASE_URL
        cache(context, discovered)
        discovered
    }

    fun clearIfMatches(baseUrl: String) = synchronized(this) {
        if (cachedBaseUrl == baseUrl) {
            cachedBaseUrl = null
        }
    }

    private fun cache(context: Context, baseUrl: String) {
        cachedBaseUrl = baseUrl
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit()
            .putString(KEY_BASE_URL, baseUrl)
            .apply()
    }

    private fun buildSubnetCandidates(): List<String> {
        val candidates = linkedSetOf<String>()
        localIpv4Addresses().forEach { localIp ->
            subnetHosts(localIp).forEach { host ->
                candidates.add("http://$host:$API_PORT/api/")
            }
        }
        return candidates.toList()
    }

    private fun findReachable(candidates: List<String>): String? {
        val executor = Executors.newFixedThreadPool(SCAN_THREADS)
        val completion = ExecutorCompletionService<String?>(executor)
        try {
            candidates.forEach { baseUrl ->
                completion.submit(Callable { if (isBackendReachable(baseUrl)) baseUrl else null })
            }

            repeat(candidates.size) {
                val result = completion.poll(2, TimeUnit.SECONDS)?.get()
                if (result != null) {
                    return result
                }
            }
        } catch (_: Exception) {
            return null
        } finally {
            executor.shutdownNow()
        }
        return null
    }

    private fun isBackendReachable(baseUrl: String): Boolean {
        val connection = try {
            URL(baseUrl + "products?page=0&size=1").openConnection() as HttpURLConnection
        } catch (_: Exception) {
            return false
        }

        return try {
            connection.requestMethod = "GET"
            connection.connectTimeout = PROBE_TIMEOUT_MS
            connection.readTimeout = PROBE_TIMEOUT_MS
            connection.responseCode in 200..499
        } catch (_: Exception) {
            false
        } finally {
            connection.disconnect()
        }
    }

    private fun localIpv4Addresses(): List<String> =
        try {
            Collections.list(NetworkInterface.getNetworkInterfaces())
                .filter { it.isUp && !it.isLoopback }
                .flatMap { networkInterface ->
                    Collections.list(networkInterface.inetAddresses)
                        .filterIsInstance<Inet4Address>()
                        .map { it.hostAddress }
                }
                .filter { isPrivateLanAddress(it) }
        } catch (_: Exception) {
            emptyList()
        }

    private fun isPrivateLanAddress(ip: String): Boolean =
        ip.startsWith("192.168.") ||
            ip.startsWith("10.") ||
            Regex("^172\\.(1[6-9]|2\\d|3[0-1])\\.").containsMatchIn(ip)

    private fun subnetHosts(localIp: String): List<String> {
        val prefix = localIp.substringBeforeLast('.', missingDelimiterValue = "")
        if (prefix.isBlank()) return emptyList()
        return (1..254)
            .map { "$prefix.$it" }
            .filterNot { it == localIp }
    }
}
