'use client'

import { ChangeEvent, useState } from 'react'
import { theme } from '@/lib/theme'

const C = theme

type Photo = { id: string; url: string; caption: string | null }

export default function GalleryPanel({ initialPhotos }: { initialPhotos: Photo[] }) {
  const [photos, setPhotos] = useState(initialPhotos)
  const [caption, setCaption] = useState('')
  const [preview, setPreview] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const chooseImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPreview(String(reader.result || ''))
    reader.readAsDataURL(file)
  }

  const addPhoto = async () => {
    if (!preview) return setMessage('Choose an image first.')
    setSaving(true)
    setMessage('')
    try {
      const response = await fetch('/api/gallery', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: preview, caption }) })
      const data = await response.json()
      if (!response.ok) { setMessage(data?.error || 'Unable to upload image.'); return }
      setPhotos((current) => [data, ...current])
      setPreview('')
      setCaption('')
      setMessage('Image added to the gallery.')
    } catch { setMessage('Unable to upload image.') } finally { setSaving(false) }
  }

  const removePhoto = async (id: string) => {
    const response = await fetch('/api/gallery', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if (response.ok) setPhotos((current) => current.filter((photo) => photo.id !== id))
    else setMessage('Unable to remove image.')
  }

  const editCaption = async (photo: Photo) => {
    const nextCaption = window.prompt('Gallery caption', photo.caption || '')
    if (nextCaption === null) return
    const response = await fetch('/api/gallery', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: photo.id, caption: nextCaption }) })
    if (response.ok) setPhotos((current) => current.map((item) => item.id === photo.id ? { ...item, caption: nextCaption } : item))
    else setMessage('Unable to update caption.')
  }

  return <>
    <section style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginTop: 24 }}>
      <h2 style={{ margin: '0 0 14px', color: C.text, fontSize: 19, fontFamily: 'var(--font-display)', fontWeight: 500 }}>Add gallery image</h2>
      <div style={{ display: 'grid', gap: 10, maxWidth: 560 }}>
        <input type="file" accept="image/*" onChange={chooseImage} />
        <input placeholder="Caption" value={caption} onChange={(event) => setCaption(event.target.value)} style={{ padding: 11, border: `1px solid ${C.border}`, borderRadius: 8 }} />
        <button type="button" onClick={addPhoto} disabled={saving} style={{ width: 'fit-content', border: 'none', borderRadius: 8, padding: '11px 16px', background: saving ? C.muted : C.gold500, color: '#fff', fontWeight: 700 }}>{saving ? 'Uploading...' : 'Add image'}</button>
        {message ? <div style={{ color: C.gold600, fontSize: 13 }}>{message}</div> : null}
      </div>
    </section>
    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, marginTop: 20 }}>
      {photos.map((photo) => <div key={photo.id} style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}><img src={photo.url} alt={photo.caption || 'Gallery image'} style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover' }} /><div style={{ padding: 12 }}><div style={{ color: C.text, fontSize: 13 }}>{photo.caption || 'No caption'}</div><button type="button" onClick={() => editCaption(photo)} style={{ marginTop: 10, border: 'none', background: 'transparent', color: C.gold600, padding: 0, cursor: 'pointer' }}>Edit caption</button><button type="button" onClick={() => removePhoto(photo.id)} style={{ marginTop: 10, marginLeft: 12, border: 'none', background: 'transparent', color: '#9b2c2c', padding: 0, cursor: 'pointer' }}>Remove</button></div></div>)}
    </section>
  </>
}
