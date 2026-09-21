export default function TempleMap({ lat, lng, name }) {
  if (!lat || !lng) return null

  const embedUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`

  return (
    <iframe
      src={embedUrl}
      width="100%"
      height="300"
      style={{ border: 0, borderRadius: '12px' }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title={name}
    />
  )
}
