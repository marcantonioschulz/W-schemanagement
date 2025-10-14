import { render } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import App from '../src/App'

const responses: Record<string, unknown> = {
  '/api/health': { status: 'ok' },
  '/api/providers': { providers: ['local'], active: 'local' },
  '/api/laundry/': [
    { id: 1, label: 'Sample Item', material: 'cotton', color: 'white', tag_id: 'abc', status: 'dirty' }
  ]
}

function mockFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
  const key = Object.keys(responses).find(endpoint => url.endsWith(endpoint))
  const body = key ? responses[key] : { ok: true }
  const ok = key !== undefined || (init && init.method && init.method !== 'GET')
  return Promise.resolve({
    ok,
    json: () => Promise.resolve(body)
  } as unknown as Response)
}

describe('App', () => {
  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockImplementation(mockFetch)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders title and inventory data', async () => {
    const { findByText } = render(<App />)
    expect(await findByText('Laundry AI')).toBeDefined()
    expect(await findByText('Sample Item')).toBeDefined()
  })
})
