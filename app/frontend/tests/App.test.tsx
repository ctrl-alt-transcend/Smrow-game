// @vitest-environment jsdom
import { render } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { RouterProvider } from 'react-router'
import { describe, it, expect } from 'vitest'
import { router } from '../src/routes'

describe('App', () => {
  it('no crash', () => {
    const { container } = render(
      <MantineProvider>
        <RouterProvider router={router} />
      </MantineProvider>
    )

    expect(container).toBeTruthy()
  })
})