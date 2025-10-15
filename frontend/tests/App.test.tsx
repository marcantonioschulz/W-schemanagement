import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import App from '../src/App'

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })
})

const baseItem = {
  id: 1,
  label: 'Sample Item',
  material: 'cotton',
  color: 'white',
  tag_id: 'abc',
  status: 'dirty',
  history: [
    { id: 1, status: 'dirty', note: 'created', created_at: '2024-01-01T10:00:00Z' },
  ],
}

const routes: Record<string, (init?: RequestInit) => unknown> = {
  '/api/health': () => ({ status: 'ok' }),
  '/api/providers': () => ({ providers: ['local'], active: 'local' }),
  '/api/laundry/statuses': () => ({ statuses: ['dirty', 'washing', 'drying', 'clean', 'folded'] }),
  '/api/laundry/': init => {
    if (init?.method === 'POST') {
      const payload = JSON.parse(init.body as string)
      return { ...baseItem, ...payload, id: 2 }
    }
    return [baseItem]
  },
  '/api/laundry/1': init => {
    if (init?.method === 'PATCH') {
      const payload = JSON.parse(init.body as string)
      return { ...baseItem, ...payload, history: [...baseItem.history, { id: 2, status: payload.status ?? 'dirty', note: payload.note ?? null, created_at: '2024-01-02T10:00:00Z' }] }
    }
    return baseItem
  },
}

function mockFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
  const key = Object.keys(routes).find(endpoint => url.endsWith(endpoint))
  if (!key) {
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response)
  }
  const payload = routes[key](init)
  return Promise.resolve({ ok: true, json: () => Promise.resolve(payload) } as Response)
}

describe('App', () => {
  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockImplementation(mockFetch)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders redesigned dashboard', async () => {
    render(<App />)
    expect(await screen.findByText('Laundry Control Center')).toBeTruthy()
    expect(await screen.findByText('Sample Item')).toBeTruthy()
    expect(await screen.findByText(/AI Workflow Assistant/i)).toBeTruthy()
  })

  it('filters items by search and opens detail dialog', async () => {
    render(<App />)
    const [searchField] = await screen.findAllByPlaceholderText(/Search label/i)
    fireEvent.change(searchField, { target: { value: 'xyz' } })
    await waitFor(() => {
      expect(screen.getByRole('group', { name: /dirty column with 0 items/i })).toBeTruthy()
    })

    fireEvent.change(searchField, { target: { value: '' } })
    const [selectCheckbox] = await screen.findAllByLabelText(/Select Sample Item/i)
    fireEvent.click(selectCheckbox)
    const [detailButton] = await screen.findAllByRole('button', { name: /Details/i })
    fireEvent.click(detailButton)
    expect(await screen.findByText(/History/)).toBeTruthy()
  })
})
