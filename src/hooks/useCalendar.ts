import { useState, useEffect, useCallback } from "react"
import { useSettingsStore } from "~store/settingsStore"
import {
  getSilentToken,
  getGoogleToken,
  revokeGoogleToken
} from "~services/chromeIdentity"
import {
  getTodayEvents,
  getCalendarProfile,
  CalendarAPIError
} from "~services/googleCalendar"
import type { CalendarState } from "~types/calendar"

export function useCalendar() {
  const { gcalConnected, setGcalConnected } = useSettingsStore()
  const [calState, setCalState] = useState<CalendarState>({
    connected: gcalConnected,
    email: useSettingsStore.getState().gcalEmail,
    events: [],
    loading: false,
    error: null
  })

  const fetchEvents = useCallback(async (token: string) => {
    try {
      const events = await getTodayEvents(token)
      setCalState((s) => ({ ...s, events, loading: false, error: null }))
    } catch (err) {
      const msg =
        err instanceof CalendarAPIError && err.statusCode === 401
          ? "Sesión expirada — reconecta Google Calendar"
          : "Error al cargar eventos"
      setCalState((s) => ({ ...s, loading: false, error: msg }))
    }
  }, [])

  // Silent reconnect on mount
  useEffect(() => {
    if (!gcalConnected) return
    setCalState((s) => ({ ...s, loading: true }))
    getSilentToken()
      .then((token) => {
        if (token) return fetchEvents(token)
        setCalState((s) => ({ ...s, loading: false, connected: false }))
      })
      .catch(() =>
        setCalState((s) => ({ ...s, loading: false }))
      )
  }, [gcalConnected, fetchEvents])

  const connect = useCallback(async () => {
    setCalState((s) => ({ ...s, loading: true, error: null }))
    try {
      const token = await getGoogleToken(true)
      const profile = await getCalendarProfile(token)
      setGcalConnected(true, profile.email)
      setCalState((s) => ({
        ...s,
        connected: true,
        email: profile.email,
        loading: false
      }))
      await fetchEvents(token)
    } catch (err) {
      setCalState((s) => ({
        ...s,
        loading: false,
        error: (err as Error).message
      }))
    }
  }, [fetchEvents, setGcalConnected])

  const disconnect = useCallback(async () => {
    const token = await getSilentToken()
    if (token) await revokeGoogleToken(token)
    setGcalConnected(false, null)
    setCalState({ connected: false, email: null, events: [], loading: false, error: null })
  }, [setGcalConnected])

  const refresh = useCallback(async () => {
    const token = await getSilentToken()
    if (!token) return
    setCalState((s) => ({ ...s, loading: true }))
    await fetchEvents(token)
  }, [fetchEvents])

  return { ...calState, connect, disconnect, refresh }
}
