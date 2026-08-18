import React from 'react'

export default function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-8 bg-white rounded shadow">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="mt-2">You do not have permission to view this page.</p>
      </div>
    </div>
  )
}
