import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useLanguage } from './language'

export default function LocationMapPicker({ latitude, longitude, onSelect }) {
  const { t } = useLanguage()
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const onSelectRef = useRef(onSelect)

  useEffect(() => { onSelectRef.current = onSelect }, [onSelect])

  useEffect(() => {
    if (!containerRef.current) return undefined
    const hasPosition = Number.isFinite(latitude) && Number.isFinite(longitude)
    const center = hasPosition ? [latitude, longitude] : [20.5937, 78.9629]
    const map = L.map(containerRef.current, { scrollWheelZoom: false })
      .setView(center, hasPosition ? 16 : 5)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)
    const marker = L.marker(center, {
      draggable: true,
      icon: L.divIcon({ className: 'delivery-map-pin', html: '', iconSize: [26, 34], iconAnchor: [13, 32] }),
    }).addTo(map)
    const reportPoint = point => {
      marker.setLatLng(point)
      onSelectRef.current({ latitude: point.lat, longitude: point.lng })
    }
    map.on('click', event => reportPoint(event.latlng))
    marker.on('dragend', () => reportPoint(marker.getLatLng()))
    mapRef.current = map
    markerRef.current = marker
    const resizeTimer = window.setTimeout(() => map.invalidateSize(), 100)
    return () => {
      window.clearTimeout(resizeTimer)
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current || !markerRef.current || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return
    const point = [latitude, longitude]
    markerRef.current.setLatLng(point)
    mapRef.current.setView(point, Math.max(mapRef.current.getZoom(), 16))
  }, [latitude, longitude])

  return (
    <div className="location-map-wrap">
      <p>{t('Move the map and click the delivery point, or drag the pin to the exact entrance.')}</p>
      <div className="location-map" ref={containerRef} role="application" aria-label="Map to select delivery location" />
      {Number.isFinite(latitude) && Number.isFinite(longitude) && (
        <small>{t('Selected map point:')} {latitude.toFixed(5)}, {longitude.toFixed(5)}</small>
      )}
    </div>
  )
}
